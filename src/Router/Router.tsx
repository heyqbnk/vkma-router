import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {routerContext} from './context';
import {createMemoryHistory} from 'history';
import {
  constructState,
  historyStateFromURL,
  historyStateToURL,
  isStateInTree,
  shallowEqual,
} from './utils';
import vkBridge from '@vkontakte/vk-bridge';

import {
  RouterContext, RouterLocation,
  RouterProps,
} from './types';
import {AnyHistoryState, AnyHistoryUpdateStateType} from '../types';

const {Provider} = routerContext;

/**
 * Component which controls routing all over the application
 * @type {React.NamedExoticComponent<RouterProps>}
 */
export const Router = memo(function Router(props: RouterProps) {
  const {children, initialHistory, tree, validate = true} = props;

  // According to initial history could only be used only once during
  // component first mount, save it into ref
  const initialHistoryRef = useRef(initialHistory);

  // Create browser history object
  const history = useMemo(() => {
    const initialHistory = initialHistoryRef.current;
    const h = createMemoryHistory<AnyHistoryState>({
      initialEntries: [],
    });

    // If initial history was passed, add all states to history
    if (initialHistory && initialHistory.length > 0) {
      if (validate) {
        const invalidStates = initialHistory.filter(state => {
          return !isStateInTree(state, tree);
        });

        if (invalidStates.length > 0) {
          throw new Error(
            'Router initial history is corrupted. These states are invalid: ' +
            JSON.stringify(invalidStates, null, '\t'),
          );
        }
      }

      // Push all history states to memory history
      initialHistory.forEach((state, index) => {
        const formattedState: AnyHistoryState = {...state, index};
        h.push(historyStateToURL(formattedState), formattedState);
      });
    } else {
      // Otherwise pass current location
      const url = window.location.hash;
      const state = historyStateFromURL(url);

      if (!state || (validate && !isStateInTree(state, tree))) {
        throw new Error('There are no initial states while creating history');
      }

      h.push(url, {...state, index: 0});
    }

    return h;
  }, [tree, validate]);

  // Previous history state
  const [prevState, setPrevState] = useState<AnyHistoryState | null>(
    () => history.index === 0 ? null : history.entries[history.index - 1].state,
  );

  // Current history state
  const [currentState, setCurrentState] = useState<AnyHistoryState>(
    () => history.entries[history.index].state,
  );

  // Current location
  const [location, setLocation] = useState<RouterLocation>(() => {
    const {pathname, search, hash} = history.location;
    return {pathname, search, hash};
  });

  // Pushes state to history
  const pushState = useCallback((
    historyState: AnyHistoryUpdateStateType,
    shouldValidate = validate,
  ) => {
    const state = constructState(currentState, historyState, history.index + 1);
    const url = historyStateToURL(state);

    if (shouldValidate && !isStateInTree(state, tree)) {
      return console.warn(
        'State push was skipped, due to it was not found in routing ' +
        'tree. State:', state, 'Tree:', tree,
      );
    }

    // Push new state to memory and browser histories
    history.push(url, state);
    window.history.pushState(state, '', '#' + url);
  }, [history, currentState, tree, validate]);

  // Replaces current state
  const replaceState = useCallback(
    (
      historyState: AnyHistoryUpdateStateType,
      shouldValidate = validate,
    ) => {
      const state = constructState(currentState, historyState);
      const url = historyStateToURL(state);

      if (shouldValidate && !isStateInTree(state, tree)) {
        return console.warn(
          'Router was unable to create href due to it was not found ' +
          'in routing tree. Tried to create href from:', historyState,
          'Final create href state:', state,
        );
      }

      // Replace state in memory and browser histories
      history.replace(url, state);
      window.history.replaceState(state, '', '#' + url);
    }, [history, currentState, tree, validate],
  );

  // Performs history pop state action
  const goBack = useCallback(() => {
    if (history.index === 0) {
      return console.warn(
        'History\'s goBack was not performed due to current ' +
        'location is the last one in history',
      );
    }

    // Go back in memory and browser histories
    history.goBack();
    window.history.back();
  }, [history]);

  // Creates url
  const createHref = useCallback((
    historyState: AnyHistoryUpdateStateType,
  ) => {
    const state = constructState(currentState, historyState);
    const url = historyStateToURL(state);
    const qIndex = url.indexOf('?');

    return history.createHref({
      pathname: url.slice(0, qIndex === -1 ? url.length : qIndex),
      search: qIndex === -1 ? '' : url.slice(qIndex),
      state,
    });
  }, [history, currentState, tree, validate]);

  // Create router context
  const context = useMemo<RouterContext>(() => ({
    location, currentState, prevState, goBack, pushState, replaceState,
    createHref,
  }), [
    location, currentState, prevState, goBack, pushState, replaceState,
    createHref,
  ]);

  // Listen for history changes to update currentState
  useEffect(() => {
    return history.listen(({pathname, search, hash, state}) => {
      const nextLocation = {pathname, search, hash};
      const prevState = history.entries[state.index - 1]?.state || null;

      // Update internal state
      setPrevState(prevState);
      setCurrentState(state);
      setLocation(prevLocation => shallowEqual(prevLocation, nextLocation)
        ? prevLocation
        : nextLocation);
    });
  }, [history]);

  // When history object changes, it is required to stay synced with
  // browser history. So we push history elements on mount, and go back on
  // unmount
  useEffect(() => {
    // We are ignoring first element due to this has to be non popable
    // element
    const entriesToPush = history.entries.slice(1, history.index + 1);

    if (entriesToPush.length > 0) {
      const {pathname, search} = entriesToPush[entriesToPush.length - 1];

      entriesToPush.forEach(({pathname, search, state}) => {
        // Push to browser's history
        window.history.pushState(state, '', '#' + pathname + search);
      });

      // Update location in bridge
      vkBridge.send('VKWebAppSetLocation', {
        location: pathname + search,
      });
    }

    // When history is going to be garbage collected, go back on remaining
    // count of entries
    return () => {
      if (history.index > 0) {
        window.history.go(-history.index);
      }
    };
  }, [history]);

  // Every time browser history changes, we should notify memory history
  // about it
  useEffect(() => {
    const listener = (e: PopStateEvent) => {
      const state = e.state as AnyHistoryState | null;
      history.go(state === null ? -history.index : state.index - history.index);
    };
    window.addEventListener('popstate', listener);

    return () => window.removeEventListener('popstate', listener);
  }, [history]);

  // When current state changes update location in bridge
  useEffect(() => {
    vkBridge.send('VKWebAppSetLocation', {
      location: historyStateToURL(currentState),
    });
  }, [currentState]);

  return <Provider value={context}>{children}</Provider>;
});

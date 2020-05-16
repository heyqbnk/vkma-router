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
  extendState,
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
      initialHistory.forEach(state => h.push(historyStateToURL(state), state));
    } else {
      // Otherwise pass current location
      const url = window.location.hash;
      const state = historyStateFromURL(url);

      if (!state || (validate && !isStateInTree(state, tree))) {
        throw new Error('There are no initial states while creating history');
      }

      h.push(url, state);
    }

    return h;
  }, [tree, validate]);

  // Previous history state
  const [prevState, setPrevState] = useState<AnyHistoryState | null>(() => {
    return history.index === 0
      ? null
      : history.entries[history.index - 1].state;
  });

  // Current history state
  const [currentState, setCurrentState] = useState<AnyHistoryState>(() => {
    return history.entries[history.index].state;
  });

  // Current location
  const [location, setLocation] = useState<RouterLocation>(() => {
    const {pathname, search, hash} = history.location;
    return {pathname, search, hash};
  });

  // Pushes state to history
  const pushState = useCallback((
    historyState: AnyHistoryUpdateStateType,
    validatePush?: boolean,
  ) => {
    const state = extendState(currentState, historyState);
    const url = historyStateToURL(state);
    const shouldValidate = validatePush
      || (typeof validatePush === 'undefined' && validate);

    if (shouldValidate && !isStateInTree(state, tree)) {
      return console.warn(
        'State push was skipped, due to it was not found in routing ' +
        'tree. State:', state, 'Tree:', tree,
      );
    }

    history.push(url, state);
    window.history.pushState(state, '', '#' + url);
  }, [history, currentState, tree, validate]);

  // Performs history pop state action
  const goBack = useCallback(() => {
    if (history.index === 0) {
      return console.warn(
        'History\'s goBack was not performed due to current ' +
        'location is the last one in history',
      );
    }
    history.goBack();
    window.history.back();
  }, [history]);

  // Replaces current state
  const replaceState = useCallback(
    (
      historyState: AnyHistoryUpdateStateType,
      validateReplace?: boolean,
    ) => {
      const state = extendState(currentState, historyState);
      const url = historyStateToURL(state);
      const shouldValidate = validateReplace
        || (typeof validateReplace === 'undefined' && validate);

      if (shouldValidate && !isStateInTree(state, tree)) {
        return console.warn(
          'Router was unable to create href due to it was not found ' +
          'in routing tree. Tried to create href from:', historyState,
          'Final create href state:', state,
        );
      }

      history.replace(url, state);
      window.history.replaceState(state, '', '#' + url);
    }, [history, currentState, tree, validate],
  );

  // Creates url
  const createHref = useCallback((
    historyState: AnyHistoryUpdateStateType,
  ) => {
    const state = extendState(currentState, historyState);
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
    return history.listen(() => {
      const {pathname, search, hash} = history.location;
      const nextLocation = {pathname, search, hash};
      const prevState = history.index === 0
        ? null
        : history.entries[history.index - 1].state;
      const currentState = history.entries[history.index].state;

      // Update internal state
      setPrevState(prevState);
      setCurrentState(currentState);
      setLocation(location => {
        return shallowEqual(location, nextLocation) ? location : nextLocation;
      });

      // Update location in bridge
      vkBridge.send('VKWebAppSetLocation', {
        location: historyStateToURL(currentState),
      });
    });
  }, [history]);

  // Every time browser history changes, we should notify memory history
  // about it
  useEffect(() => {
    const listener = (e: PopStateEvent) => {
      const prev = history.entries[history.index - 1];

      // User came back when e.state became null (its entry point where state
      // does not exist) or new url equals to previous one
      if (
        e.state === null ||
        (prev && historyStateToURL(prev.state) === historyStateToURL(e.state))
      ) {
        return history.goBack();
      }
      history.goForward();
    };

    window.addEventListener('popstate', listener);

    return () => window.removeEventListener('popstate', listener);
  }, [history]);

  return <Provider value={context}>{children}</Provider>;
});

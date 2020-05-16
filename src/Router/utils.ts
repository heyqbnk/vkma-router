import {
  AnyHistoryState,
  AnyHistoryUpdateStateType,
  HistoryState,
} from '../types';
import {RoutingTree} from '../types';
import {parse, stringify} from 'qs';

/**
 * Checks if passed state exists in tree
 * @param {HistoryState<T>} state
 * @param tree
 * @returns {boolean}
 */
export function isStateInTree<T extends RoutingTree>(
  state: AnyHistoryState,
  tree: T,
): state is HistoryState<T> {
  const {view, panel, popup} = state;

  // Truthy in case when full path to panel exists and popup is found
  // in popups list or equal to null
  return view in tree.views && panel in tree.views[view]
    && (popup === null || popup in tree.popups);
}

/**
 * Parses url and returns history state in case
 * @param {string} url
 * @returns {AnyHistoryState | null}
 */
export function historyStateFromURL(url: string): AnyHistoryState | null {
  const qIndex = url.indexOf('?');
  const sIndex = url.indexOf('/');
  const _url = url.slice(sIndex + 1, qIndex === -1 ? url.length : qIndex);
  const [view, panel, popup = null] = _url.split('/');
  const search = qIndex === -1 ? null : url.slice(qIndex + 1);

  if (!view || !panel) {
    return null;
  }

  return {
    view,
    panel,
    popup,
    query: search ? parse(search) : {},
  };
}

/**
 * Converts history state to url
 * @param {HistoryState<T>} state
 * @returns {string}
 */
export function historyStateToURL<T extends RoutingTree>(
  state: HistoryState<T>,
): string {
  const {view, panel, popup, query} = state;
  const queryStr = stringify(query);

  return `/${view}/${panel}${popup === null ? '' : `/${popup}`}`
    + (queryStr === '' ? '' : `?${queryStr}`);
}

/**
 * Correctly merges history state with update payload
 * @param {AnyHistoryState} current
 * @param {AnyHistoryUpdateStateType} payload
 * @returns {AnyHistoryState}
 */
export function extendState(
  current: AnyHistoryState,
  payload: AnyHistoryUpdateStateType,
): AnyHistoryState {
  return {...current, query: {}, popup: null, ...payload};
}

/**
 * Shallowly compares 2 objects
 * @param {L} left
 * @param {R} right
 * @returns {boolean}
 */
export function shallowEqual<L extends Record<any, any>,
  R extends Record<any, any>>(left: L, right: R): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every(k => {
    return rightKeys.includes(k) && left[k] === right[k];
  });
}

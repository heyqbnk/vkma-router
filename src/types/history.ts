import {ParsedQs} from 'qs';
import {
  UnionPartialBy,
  UnionPick,
} from './utils';
import {RoutingTree, GetTreeRoutes} from './tree';

/**
 * Full history state
 */
export type HistoryState<T extends RoutingTree> =
  GetTreeRoutes<T>
  & { query: ParsedQs; index: number };

/**
 * History state without index
 */
export type NonIndexedHistoryState<T extends RoutingTree> = Omit<HistoryState<T>, 'index'>

/**
 * History update state with view, panel, optional popup and optional query
 */
export type HistoryUpdateViewState<T extends RoutingTree> =
  UnionPartialBy<NonIndexedHistoryState<T>, 'popup' | 'query'>;

/**
 * History update state with panel, optional popup and optional query
 */
export type HistoryUpdatePanelState<T extends RoutingTree> =
  UnionPartialBy<Omit<NonIndexedHistoryState<T>, 'view'>, 'popup' | 'query'>;

/**
 * History update state with popup and optional query
 */
export type HistoryUpdatePopupState<T extends RoutingTree> =
  UnionPick<UnionPartialBy<NonIndexedHistoryState<T>, 'query'>,
    'popup' | 'query'>;

/**
 * History update state with query
 */
export type HistoryUpdateQueryState = { query: ParsedQs };

/**
 * Update history state payload
 */
export type HistoryUpdateStateType<T extends RoutingTree> =
  | HistoryUpdateViewState<T>
  | HistoryUpdatePanelState<T>
  | HistoryUpdatePopupState<T>
  | HistoryUpdateQueryState;

export type AnyHistoryState = HistoryState<RoutingTree>;
export type AnyNonIndexedHistoryState = NonIndexedHistoryState<RoutingTree>;
export type AnyHistoryUpdateStateType = HistoryUpdateStateType<RoutingTree>;


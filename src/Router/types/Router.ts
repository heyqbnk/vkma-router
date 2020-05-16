import {ReactNode, ReactNodeArray} from 'react';
import {RoutingTree, HistoryState, HistoryUpdateStateType} from '../../types';

/**
 * Router location
 */
export interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
}

/**
 * Router context
 */
export interface RouterContext<T extends RoutingTree = RoutingTree> {
  /**
   * Current location
   */
  location: RouterLocation;

  /**
   * Current routing history state
   */
  currentState: HistoryState<T>;

  /**
   * Previous routing history state
   */
  prevState: HistoryState<T> | null;

  /**
   * Performs history pop state action
   */
  goBack(): void;

  /**
   * Pushes new state to history
   * @param {HistoryUpdateStateType<T>} historyState
   * @param {boolean} validate
   */
  pushState(historyState: HistoryUpdateStateType<T>, validate?: boolean): void;

  /**
   * Replaces current history state with new one
   * @param {HistoryUpdateStateType<T>} historyState
   * @param {boolean} validate
   */
  replaceState(
    historyState: HistoryUpdateStateType<T>,
    validate?: boolean,
  ): void;

  /**
   * Creates href based on history state
   */
  createHref: (historyState: HistoryUpdateStateType<T>) => string;
}

/**
 * Router component properties
 */
export interface RouterProps<T extends RoutingTree = RoutingTree> {
  /**
   * Initial router history
   */
  initialHistory?: HistoryState<T>[];

  /**
   * Children
   */
  children?: ReactNode | ReactNodeArray;

  /**
   * Routing tree. When passed, every history update is checked with tree and
   * prevented in case there is no such route.
   */
  tree: T;

  /**
   * Should Router validate each action (createHref, pushState, etc.).
   * Strongly recommended
   */
  validate?: boolean;
}

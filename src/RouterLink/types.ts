import React, {ReactElement} from 'react';
import {
  RoutingTree,
  HistoryUpdateViewState,
  HistoryUpdatePopupState,
  HistoryUpdateQueryState,
} from '../types';

export type RouterLinkProps<T extends RoutingTree = RoutingTree> = {
  /**
   * Children which support onClick or href properties
   */
  children: ReactElement<{
    onClick?(e: React.MouseEvent<any>): void;
    href?: string;
  }>;
} & ({
  /**
   * Defines which history state should be pushed
   */
  to:
    | HistoryUpdateViewState<T>
    | HistoryUpdatePopupState<T>
    | HistoryUpdateQueryState;
} | {
  /**
   * States if history should be poped
   */
  pop: boolean;
});

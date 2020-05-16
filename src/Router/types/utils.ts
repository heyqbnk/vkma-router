import {RoutingTree, AnyHistoryState} from '../../types';

export interface GetInitialStatesOptions {
  tree: RoutingTree;
  validate: boolean;
  initialHistory?: AnyHistoryState[];
}

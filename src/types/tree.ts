import {IdType} from './shared';
import {ExtractIdType} from './utils';

/**
 * Routing tree
 */
export interface RoutingTree {
  /**
   * Views list. Key is a unique view id. Values are array of panel ids which
   * can be met inside this view
   */
  views: {
    [ViewId in IdType]: {
      [PanelId in IdType]: any;
    }
  };

  /**
   * List of popups. Popups are detached from views and panels context. Due
   * to they are global, they can placed everywhere and that is the reason,
   * that in routing context they are not placed in views nor panels
   */
  popups: {
    [PopupId in IdType]: any;
  };
}

/**
 * Checks if passed value is valid routing tree
 */
export type ValidateTree<T> = T extends RoutingTree
  ? (keyof T extends keyof RoutingTree ? T : never)
  : never;

/**
 * Returns available tree routes depending on routing tree
 */
export type GetTreeRoutes<T extends RoutingTree> = {
  [ViewId in ExtractIdType<keyof T['views']>]: {
    [PanelId in keyof T['views'][ViewId]]:
    {
      view: ViewId;
      panel: PanelId;
      popup: ExtractIdType<keyof T['popups']> | null;
    }
  }[ExtractIdType<keyof T['views'][ViewId]>]
}[ExtractIdType<keyof T['views']>]

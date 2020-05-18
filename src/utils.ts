import {IdType, RoutingTree} from './types';
import {ComponentType} from 'react';
import {Router, useRouter, RouterContext, RouterProps} from './Router';
import {RouterLink, RouterLinkProps} from './RouterLink';

/**
 * Creates set by passed elements
 * @param {ElemId[]} elements
 * @returns {{[E in ElemId]: any}}
 */
export function createSet<ElemId extends IdType>(elements: ElemId[]): { [E in ElemId]: any } {
  return elements.reduce<{ [E in ElemId]: any }>((acc, elemId) => {
    acc[elemId] = false;
    return acc;
  }, {} as any);
}

/**
 * Creates Router component. In fact, returns Router, but typed depending on T
 * @returns {React.ComponentType<RouterProps<T>>}
 */
export const createRouterComponent = <T extends RoutingTree>(): ComponentType<RouterProps<T>> => Router;

/**
 * Creates RouterLink component. In fact, returns RouterLink, but typed
 * depending on T
 * @returns {React.ComponentType<RouterLinkProps<T>>}
 */
export function createRouterLinkComponent<T extends RoutingTree>(): ComponentType<RouterLinkProps<T>> {
  return RouterLink;
}

/**
 * Creates useRouter hook. In fact, returns useRouter, but typed depending on T
 * @returns {() => (RouterContext<T> | null)}
 */
export function createUseRouter<T extends RoutingTree>(): () => RouterContext<T> | null {
  return useRouter;
}

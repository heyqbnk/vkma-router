import {IdType, RoutingTree} from './types';
import {ComponentType} from 'react';
import {RouterContext, RouterProps} from './Router/types';
import {RouterLink, RouterLinkProps} from './RouterLink';
import {Router, useRouter} from './Router';

type CreateProjectTuple<T extends RoutingTree> = [
  ComponentType<RouterProps<T>>,
  ComponentType<RouterLinkProps<T>>,
  () => RouterContext<T> | null
];

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
 * Creates library utils which allow to work with components and hooks
 * safely
 * @returns {CreateProjectTuple<T>}
 */
export function createProject<T extends RoutingTree>(): CreateProjectTuple<T> {
  return [Router, RouterLink, () => useRouter<T>()];
}


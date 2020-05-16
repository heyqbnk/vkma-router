import {IdType} from './types';

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

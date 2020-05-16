import {Context, createContext, useContext} from 'react';
import {RouterContext} from './types';
import {RoutingTree} from '../types';

export const routerContext = createContext<RouterContext | null>(null);

export const useRouter = <T extends RoutingTree = RoutingTree>() => {
  return useContext<RouterContext<T> | null>(
    routerContext as Context<RouterContext<T> | null>,
  );
};

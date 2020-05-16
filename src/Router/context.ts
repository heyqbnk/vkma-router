import {createContext, useContext} from 'react';
import {RouterContext} from './types';

export const routerContext = createContext<RouterContext | null>(null);

export const useRouter = () => useContext(routerContext);

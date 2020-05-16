import React, {
  cloneElement,
  memo, useCallback,
} from 'react';

import {useRouter} from '../Router';
import {RouterLinkProps} from './types';

/**
 * Link which uses Router for routing
 * @type {React.NamedExoticComponent<({children: React.ReactElement<{onClick?(e: React.MouseEvent<any>): void; href?: string}>} & {to: AnyHistoryUpdateStateType}) | ({children: React.ReactElement<{onClick?(e: React.MouseEvent<any>): void; href?: string}>} & {pop: boolean})>}
 */
export const RouterLink = memo(function RouterLink(props: RouterLinkProps) {
  const router = useRouter();

  if (!router) {
    throw new Error(
      'RouterLink was used out of Router context. That is a restricted ' +
      'behaviour',
    );
  }
  const {children} = props;
  const {pushState, prevState, goBack, createHref} = router;
  const {onClick: _onClick, href: _href} = children.props;

  // Rewire onClick handler
  const onClick = useCallback((e: React.MouseEvent<any>) => {
    // Prevent default element click behaviour. It is required for "a" tags
    e.preventDefault();

    if ('pop' in props) {
      goBack();
    } else {
      pushState(props.to);
    }

    // Call passed handler
    if (_onClick) {
      _onClick(e);
    }
  }, [_onClick, goBack, props]);

  // Rewired href
  let href: string | undefined = undefined;

  // If anchor is passed, we have to just replace href
  if (_href !== undefined || children.type === 'a') {
    // User wants history to goBack
    if ('pop' in props) {
      if (prevState) {
        href = createHref(prevState);
      }
    } else {
      href = createHref(props.to);
    }
  }

  return cloneElement(children, {onClick, href});
});

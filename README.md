[npm-badge]: https://img.shields.io/npm/v/vkma-router.svg
[npm-link]: https://npmjs.com/package/vkma-router

[<img width="134" src="https://vk.com/images/apps/mini_apps/vk_mini_apps_logo.svg">](https://vk.com/services)

# VK Mini Apps Router [![NPM][npm-badge]][npm-link]

A package to organize routing in VK Mini Apps application.

## Motivation

Currently, it is rather hard to work normally with application created on
VK Mini Apps platform, due to there are a lot features inside of it. Especially
when we are talking about routing.

The main purpose of this application is to provide transparent wide 
functionality and use it without any difficulties in vkma applications.

## Installation
```bash
yarn add vkma-router
```
or
```bash
npm i vkma-router
``` 

## Getting started

It is rather important to understand, that there must not be an application
state when it is unknown, which panel to display. Case, when this situation
occurs is called `Zero state panic`. 

`vkma-router` cares of not allowing this state to occur. When created,
it is waiting for initial history to be passed. Otherwise it will try to derive
initial history from current history location.

Internally, `vkma-router` uses routing tree which is passed from outside. It
is required to prevent `Zero state panic`, because it can validate routes
only with this tree. So, if you are trying to push or replace state which 
cannot be found in routing tree, it will be prevented and warning thrown.
This behaviour is used by default and can be removed but not recommended.

Returning to passing initial history to router, you should understand that
each history element should be correct. It means, that each history item should
exist in routing tree. Otherwise, an error will be thrown. This behaviour
is preventable too but not recommended as well.

## Concept

### How it works
According to we know that application created on base of VK Mini Apps
represents usual web application with usual browser APIs, `vkma-router`
uses History API along with `history` package.

`Router` creates memory history which allows us to avoid `Zero state panic`.
The reason we chose memory history, but not usual browser or hash history
is they dont allow us to go through history freely. Moreover, initial state
is always empty (pathname is "/" and state is null) which, in our context,
means `Zero state panic`. Using memory history, we are setting initial
state and first item in history is always correct and not removable.

### Popstate event

`Router` is watching for windows's `popstate` event and detects where
memory router should go. It works always correctly because each time, `popstate`
event is called, it sends state with which we can detect needed direction.

### History API and Bridge location updates

It is important to mention, that you have no need to call 
`window.history.pushState` after using router and calling `pushState` due to
the reason `pushState` is doing it internally. 

`vkBridge`'s method `VKWebAppSetLocation` is called every time when current 
state changes.

## Usage
### Tree
```typescript
import {createSet, ValidateTree} from 'vkma-router';

// List of available views in project
export enum ViewsEnum {
  Registration = 'registration',
  Main = 'application'
}

// List of available panels in project
export enum PanelsEnum {
  Personal = 'personal',
  Photo = 'photo',
  News = 'news',
  Settings = 'settings',
  Messages = 'messages',
}

// List of available popups in project
export enum PopupsEnum {
  Confirm = 'confirm'
}

// Routing tree. To make sure you are writing tree correctly, find type 
// RoutingTree inside of package. We are not using here any of the types,
// because we will be unable to infer paths to panels correctly
export const tree = {
  views: {
    // We use create set to make type inferring correct due to it is unavailable
    // to do it in usual arrays
    [ViewsEnum.Registration]: createSet([PanelsEnum.Personal, PanelsEnum.Photo]),
    [ViewsEnum.Main]: createSet([
      PanelsEnum.News, PanelsEnum.Settings, PanelsEnum.Messages
    ]),
  },
  popups: createSet(Object.values(PopupsEnum))
};

// Type which validates if tree extends RoutingTree. Otherwise it wll be "never"
export type AppTree = ValidateTree<typeof tree>;

// This variable does nothing. It has only 1 purpose - to throw error in case 
// when tree has invalid format. It will be thrown by TypeScript automatically
// when tree changes
const _: AppTree = tree;
```

### Initial history
```typescript
import {historyStateFromURL, isStateInTree, NonIndexedHistory} from 'vkma-router';
import {tree, AppTree, ViewsEnum, PanelsEnum} from './tree';

// Create history. It is only an example and you create history based on logic
// of your application
export const history: NonIndexedHistory<AppTree> = []; 

// In VKMA applications, meaningful path is passed in hash
const state = historyStateFromURL(window.location.hash);

// Validate if needed
if (state && isStateInTree(state, tree)) {
  history.push(state);
} else {
  history.push({
    view: ViewsEnum.Main,
    panel: PanelsEnum.News,
    popup: null,
    query: {},
  });
}
```

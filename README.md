# ui.cg

Input controls for your Angular apps, made easy.

## API Reference

An API reference can be here:

[http://geersch.github.io/ui.cg/#/api](http://geersch.github.io/ui.cg/#/api)

## Controls

* [numberinput](http://geersch.github.io/ui.cg/#/api/cg.ui.directive:numberinput)

## Development

#### Prepare your environment

* Install [Node.js](http://nodejs.org/) and NPM
* Install global dev dependencies: `npm install -g grunt-cli karma`
* Install local dev dependencies: `npm install` while current directory is ui.cg repository

#### Build

* Build the project: `grunt build`

Distributables (ui-cg-<version>.js & ui-cg-<version>.min.js) will be created by default. Once built, you only need to add the module to your AngularJS module:

```javascript
angular.module('myModule', ['ui.cg']);
```

Check the Grunt build file for other tasks that are defined for this project.

#### Todo's

- [ ] fix issue with numberinput accepting - sign
- [ ] add support for a maximum value (default: none) for the numberinput
- [ ] add support for a minimum value (default: none) for the numberinput
- [ ] add support for spin buttons (off by default)
- [ ] numberinput -> mouse wheel events should be opt-in
- [ ] numberinput -> keyboard events should be opt-in

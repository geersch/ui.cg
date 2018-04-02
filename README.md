# ui.cg

A number input control for AngularJS apps. Bootstrap 2.x is used for the template.

## API Reference

An API reference can be here:

[http://geersch.github.io/ui.cg/#/api](http://geersch.github.io/ui.cg/#/api)

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

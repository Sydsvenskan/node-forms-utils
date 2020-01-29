// @ts-check
/// <reference types="node" />

'use strict';

/** @typedef {import('./lib/promise').Form} Form */
/** @typedef {import('./lib/promise').FormBound} FormBound */
/** @typedef {import('./lib/promise').FormParts} FormParts */
/** @typedef {import('./lib/promise').FormPartsMixed} FormPartsMixed */
/** @typedef {import('./lib/promise').FormPartsBound} FormPartsBound */

const fields = {
  basic: require('./lib/basic-field'),
  html: require('./lib/html'),
  multiField: require('./lib/multi-field')
};

const widgets = {
  basic: require('./lib/basic'),
  image: require('./lib/image')
};

const utils = require('./lib/utils');

const {
  promisedFormHandle,
  promisedFormHandles
} = require('./lib/promise');

module.exports = {
  fields,
  widgets,
  utils,
  promisedFormHandle,
  promisedFormHandles
};

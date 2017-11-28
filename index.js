'use strict';

const fields = {
  basic: require('./lib/basic-field'),
  html: require('./lib/html'),
  multiObject: require('./lib/multi-object')
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

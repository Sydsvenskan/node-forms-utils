'use strict';

const fields = require('forms').fields;

const basicWidget = require('./basic');
const { htmlEscape, tag } = require('./utils');

const widget = function (options) {
  options = options || {};

  const w = basicWidget(options);

  w.type = 'html';

  w.toHTML = function (name, field) {
    field = field || {};

    const content = options.html || '';

    return tag('div', this.getFullAttrs(name, field), options.noEscape ? content : htmlEscape(content), true);
  };

  return w;
};

/**
 * This field can be used to display HTML without accepting any input for the field name.
 * Using just the widget with a basic field would still make it possible to post data to the name of that field, which is undesireable in most cases
 */

const field = function (opt) {
  const opts = Object.assign({}, opt);

  const f = fields.string(opts);

  const widgetOpts = Object.assign({
    html: opt.html,
    noEscape: opt.noEscape
  }, opts.attrs || {});

  f.widget = opts.widget || widget(widgetOpts);
  f.parse = () => {};

  return f;
};

module.exports = field;
module.exports.widget = widget;

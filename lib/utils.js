'use strict';

// Partly copied from forms module 0.3.0 and later upgraded to work with forms 1.3.0

const htmlEscape = require('forms/lib/htmlEscape');
const tag = require('forms/lib/tag');

const dataRegExp = /^data-[a-z]+(-[a-z]+)*$/;
const ariaRegExp = /^aria-[a-z]+$/;
const legalAttrs = new Set(['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'multiple', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step']);
const ignoreAttrs = new Set(['id', 'name', 'class', 'classes', 'type', 'value', 'multiple']);
const getUserAttrs = function (opt) {
  return Object.keys(opt).reduce(function (attrs, k) {
    if ((!ignoreAttrs.has(k) && legalAttrs.has(k)) || dataRegExp.test(k) || ariaRegExp.test(k)) {
      attrs[k] = opt[k];
    }
    return attrs;
  }, {});
};

module.exports = {
  getUserAttrs,
  htmlEscape,
  tag
};

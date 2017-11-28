'use strict';

// Partly copied from forms module 0.3.0 and later upgraded to work with forms 1.1.1

const htmlEscape = require('forms/lib/htmlEscape');
const tag = require('forms/lib/tag');

const dataRegExp = /^data-[a-z]+([-][a-z]+)*$/;
const ariaRegExp = /^aria-[a-z]+$/;
const legalAttrs = ['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'multiple', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step'];
const ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value'];
const getUserAttrs = function (opt) {
  return Object.keys(opt).reduce(function (attrs, k) {
    if ((ignoreAttrs.indexOf(k) === -1 && legalAttrs.indexOf(k) > -1) || dataRegExp.test(k) || ariaRegExp.test(k)) {
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

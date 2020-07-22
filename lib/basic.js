'use strict';

const { getUserAttrs, htmlEscape, tag } = require('./utils');

module.exports = function (options) {
  options = options || {};

  const w = {
    classes: options.classes,
    type: 'basic',
    formatValue: (value) => (value || value === 0) ? value : null
  };

  w.getBaseAttrs = function (name, field) {
    return {
      id: field.id === false ? false : (field.id || true),
      name,
      classes: ['field__value'].concat(this.type ? ['field__value--' + this.type] : [], this.classes || [])
    };
  };

  w.getFullAttrs = function (name, field, extraAttrs) {
    const baseAttrs = this.getBaseAttrs(name, field);
    const userAttrs = getUserAttrs(options);
    return [baseAttrs, extraAttrs || {}, userAttrs, this.attrs || {}];
  };

  w.toHTML = function (name, field) {
    field = field || {};
    return tag('div', this.getFullAttrs(name, field), htmlEscape(field.value || ''), true);
  };

  return w;
};

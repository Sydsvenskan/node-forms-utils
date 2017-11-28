'use strict';

const fields = require('forms').fields;

const basicField = require('./basic-field');
const { getUserAttrs, tag } = require('./utils');

module.exports = function (opt) {
  const opts = Object.assign({}, opt);

  const f = basicField(opts);

  f.rowField = opts.rowField;

  if (!f.rowField) {
    throw new Error('The rowField option is required');
  } else if (typeof f.rowField === 'object' && typeof f.rowField.toHTML !== 'function') {
    f.rowField = fields.object(f.rowField, opts);
    f.rowField.name = f.name + '[row]';
  }

  f.bind = function (rawData) {
    const b = Object.assign({}, this);

    b.value = rawData;
    b.fieldsList = b.parse(rawData)
      .map(rawRowData => f.rowField.bind(rawRowData))
      .filter(row => typeof row.data !== 'object' || Object.keys(row.data).some(key => !!row.data[key]));
    b.data = b.fieldsList.map(row => row.data);

    b.validate = function (form, callback) {
      Promise.all(b.fieldsList.map((row, i) => {
        return new Promise(resolve => {
          row.validate(form, (errToIgnore, boundField) => {
            b.fieldsList[i] = boundField;
            resolve(!row.isValid());
          });
        });
      }))
        .then(errs => {
          b.error = errs.some(err => !!err) || null;
          setImmediate(() => callback(null, b));
        })
        .catch(err => setImmediate(() => {
          b.error = err;
          callback(err, b);
        }));
    };

    return b;
  };

  f.parse = function (rawData) {
    if (rawData === undefined) { return []; }
    return [].concat(rawData).filter(item => !!item);
  };

  f.toHTML = function (name, iterator) {
    const cssClasses = opt.cssClasses || {};

    const value = this.fieldsList
      .concat(this.rowField.bind(''))
      .reduce(
        (html, field, i) => html + tag('div', { classes: ['field__multi-row'].concat(cssClasses.row || []) }, field.toHTML(name + '[' + i + ']', iterator), true),
        ''
      );

    const attrs = Object.assign(
      { classes: ['field__multi'].concat(cssClasses.field || []) },
      getUserAttrs(opt)
    );

    return tag(
      'div',
      attrs,
      (
        tag('div', { classes: ['field__multi-header'].concat(cssClasses.header || []) }, this.labelText(name, this.id), true) +
        tag('div', { classes: ['field__multi-row-container'].concat(cssClasses.rowContainer || []) }, value, true)
      ),
      true
    );
  };

  return f;
};

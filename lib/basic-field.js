'use strict';

const fields = require('forms').fields;
const widgets = require('forms').widgets;
const validators = require('forms').validators;

const coerceArray = function (arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr : [];
};

module.exports = function basicField (opt) {
  opt = opt || {};

  const opts = Object.assign({}, opt);

  const f = fields.string(opts);

  const widgetOpts = Object.assign({}, opts.attrs || {});

  f.widget = opts.widget || widgets.text(widgetOpts);

  f.parse = function (rawData) {
    if (typeof rawData !== 'undefined' && rawData !== null) {
      return String(rawData);
    }
    return '';
  };

  // Copied from Forms itself but changed to reference the instance of the object rather than the variable in the scope
  f.bind = function (rawData) {
    const b = Object.assign({}, this);
    b.value = rawData;
    b.data = b.parse(rawData);
    b.validate = function (form, callback) {
      const forceValidation = (b.validators || []).some(validator => validator.forceValidation);

      if (!forceValidation && (rawData === '' || rawData === null || typeof rawData === 'undefined')) {
        // don't validate empty fields, but check if required
        if (b.required) {
          const validator = typeof b.required === 'function' ? b.required : validators.required();
          validator(form, b, err => {
            b.error = err ? String(err) : null;
            callback(err, b);
          });
        } else {
          setImmediate(() => callback(null, b));
        }
      } else {
        (b.validators || [])
          .reduce((chain, validator) => {
            return b.error ? undefined : chain.then(() => new Promise(resolve => {
              validator(form, b, err => {
                b.error = err ? String(err) : null;
                resolve(null);
              });
            }));
          }, Promise.resolve())
          .then(() => setImmediate(() => callback(null, b)))
          .catch(err => setImmediate(() => callback(err, b)));
      }
    };
    return b;
  };

  f.labelHTML = function (name, id) {
    if (this.widget.type === 'hidden') { return ''; }
    const forID = id === false ? false : (id || 'id_' + name);
    return widgets.label({
      classes: typeof this.cssClasses !== 'undefined' ? coerceArray(this.cssClasses.label) : [],
      content: this.labelText(name, id)
    }).toHTML(forID, this);
  };

  return f;
};

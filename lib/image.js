'use strict';

const basicWidget = require('./basic');
const { tag, htmlEscape } = require('./utils');

module.exports = function (options) {
  options = options || {};

  const w = basicWidget(options);

  w.type = 'file';
  w.accept = 'image/*';

  w.toHTML = function (name, field) {
    field = field || {};

    let imageHtml = '';
    let instructionsHtml = '';

    if (options.getImageLink && field.value) {
      if (options.getImageTag) {
        imageHtml = options.getImageTag(field.value);
      }
      if (!imageHtml) {
        imageHtml = tag('img', {
          src: options.getImageLink(field.value, 48, 48),
          width: 48,
          height: 48
        });
      }
      imageHtml = tag('a', {
        target: '_blank',
        rel: 'noopener',
        href: options.getImageLink(field.value)
      }, imageHtml, true);
    }

    if (options.instructions) {
      instructionsHtml = tag('p', {}, htmlEscape(options.instructions), true);
    }

    const attrs = this.getFullAttrs(name, field, {
      type: this.type,
      accept: this.accept,
      value: field.value,
      name: name
    });

    return tag('div', { class: 'image-upload' }, instructionsHtml + imageHtml + tag('div', { class: 'image-upload--field' }, tag('input', attrs), true), true);
  };

  return w;
};

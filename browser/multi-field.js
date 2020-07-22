// @ts-check

'use strict';

import {
  ensureHTMLElement,
  $,
  $$,
  createChild,
  appendChild,
  closestByClass,
  hasClass
} from '@hdsydsvenskan/dom-utils';

/**
 * @typedef MultiFieldOptions
 * @property {(context: any) => void} activateInContext
 * @property {*} dragula
 * @property {string} [textRemove]
 * @property {() => void} [callback]
 */

/** @typedef {(context?: import('@hdsydsvenskan/dom-utils').ElementContainer ) => void} MultiFieldInit */
/** @typedef {(fieldElem: HTMLElement) => void} MultiFieldInitField */

/**
 * @param {MultiFieldOptions} options
 * @returns {{ init: MultiFieldInit, initField: MultiFieldInitField }}
 */
export const multiField = function (options) {
  const {
    activateInContext,
    dragula,
    textRemove,
    callback
  } = options;

  const rowContainerClass = 'field__multi-row-container';
  const rowClass = 'field__multi-row';
  const buttonClass = 'field__multi-remove';

  /**
   * @param {Node} elem
   * @param {string} className
   * @param {Node} stop
   * @returns {HTMLElement|undefined}
   */
  const closestByClassWithStop = (elem, className, stop) => {
    while (elem.parentNode) {
      elem = elem.parentNode;
      if (elem === stop) {
        return;
      }
      if (elem instanceof HTMLElement && elem.classList && hasClass(elem, className)) {
        return elem;
      }
    }
  };

  /** @type {MultiFieldInitField} */
  const initField = fieldElem => {
    const draggable = fieldElem.dataset.draggable;
    const rowContainer = $('.' + rowContainerClass, fieldElem);

    if (!rowContainer) return;

    /**
     * @param {Node} item
     * @returns {boolean}
     */
    const belongsToRowContainer = item => {
      return closestByClass(item, rowContainerClass) === rowContainer;
    };
    /**
     * @template {Node} T
     * @param {T[]} items
     * @returns {T[]}
     */
    const filterRows = items => {
      return items.filter(item => belongsToRowContainer(item));
    };

    const rows = filterRows($$('.' + rowClass, rowContainer));
    let lastRow = rows[rows.length - 1];

    if (!lastRow) { return; }

    rows.forEach(row => {
      const container = createChild(row, 'div', buttonClass + '-wrapper');
      createChild(container, 'button', {
        type: 'button',
        'class': 'btn btn-default ' + buttonClass
      }, textRemove || 'Remove')
        .addEventListener('click', function () {
          if (this.style.visibility !== 'hidden') {
            const closest = closestByClass(this, rowClass);
            if (closest) closest.remove();
          }
        });
    });

    const lastButton = filterRows($$('.' + buttonClass, lastRow))[0];
    if (lastButton) {
      lastButton.style.visibility = 'hidden';
    }

    const newRow = lastRow.cloneNode(true);
    let maxIndex = rows.length - 1;
    const newRowIndexNamePart = '[' + maxIndex + ']';
    const newRowIndexNamePrefix = rowContainer.dataset.multiRowPrefix;

    const initLastRow = () => {
      lastRow.addEventListener('change', onChange);
      lastRow.addEventListener('keyup', onChange);
    };

    const onChange = () => {
      if (
        !$$('input,textarea,select', lastRow).some(elem => (elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement || elem instanceof HTMLSelectElement) && !!elem.value && !elem.dataset.excludeFromMultiField)
      ) {
        return;
      }

      lastRow.removeEventListener('change', onChange);
      lastRow.removeEventListener('keyup', onChange);

      const button = filterRows($$('.' + buttonClass, lastRow))[0];

      if (button) {
        button.style.visibility = '';
        button.addEventListener('click', function () {
          if (this.style.visibility !== 'hidden') {
            const closest = closestByClass(this, rowClass);
            if (closest) closest.remove();
          }
        });
      }

      const clonedRow = ensureHTMLElement(newRow.cloneNode(true));
      // Gets rid of "undefined" amongst the types
      if (!clonedRow) return;

      lastRow = clonedRow;
      maxIndex += 1;

      const currentNewRowIndexNamePrefix = rowContainer.dataset.multiRowPrefix;

      const oldRowName = newRowIndexNamePrefix + newRowIndexNamePart;
      const newRowName = currentNewRowIndexNamePrefix + '[' + maxIndex + ']';

      $$('[id^="id_' + oldRowName + '"]', lastRow).forEach(inputElem => {
        if ((inputElem instanceof HTMLInputElement || inputElem instanceof HTMLTextAreaElement || inputElem instanceof HTMLSelectElement)) {
          inputElem.id = inputElem.id.replace(oldRowName, newRowName);
          inputElem.name = inputElem.name.replace(oldRowName, newRowName);
        }
      });

      $$('[for^="id_' + oldRowName + '"]', lastRow).forEach(labelElem => {
        labelElem.setAttribute('for', (labelElem.getAttribute('for') || '').replace(oldRowName, newRowName));
      });

      $$('.' + rowContainerClass, lastRow).forEach(childContainer => {
        childContainer.dataset.multiRowPrefix = (childContainer.dataset.multiRowPrefix || '').replace(oldRowName, newRowName);
      });

      appendChild(rowContainer, lastRow);
      if (activateInContext) { activateInContext(lastRow); }

      callback && callback();
      initLastRow();
    };

    initLastRow();

    if (draggable && dragula) {
      const drake = dragula([rowContainer], {
        // @ts-ignore
        moves: function (el/* , source, handle, sibling */) {
          return el.nextSibling;
        },
        // @ts-ignore
        accepts: function (_el, _target, _source, sibling) {
          return sibling;
        },
        // @ts-ignore
        invalid: function (el) {
          return !belongsToRowContainer(el);
        }
      });

      drake.on('drop', () => callback && callback());
    }
  };

  /** @type {MultiFieldInit} */
  const init = context => {
    $$('.field__multi', context)
      .filter(item => !closestByClassWithStop(item, '.field__multi', item))
      .forEach(initField);
  };

  return {
    initField,
    init
  };
};

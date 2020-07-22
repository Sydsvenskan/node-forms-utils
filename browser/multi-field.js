'use strict';

/**
 * @typedef MultiFieldOptions
 * @property {import('@hdsydsvenskan/eshu-browser-utils/modules/dom')} dom
 * @property {(context: any) => void} activateInContext
 * @property {import('dragula')} dragula
 * @property {string} [textRemove]
 * @property {() => void} [callback]
 */

/**
 * @param {MultiFieldOptions} options
 */
module.exports = options => {
  const {
    dom,
    activateInContext,
    dragula,
    textRemove,
    callback
  } = options;

  const {
    $,
    $$,
    createChild,
    removeElement,
    appendChild,
    closestByClass,
    hasClass
  } = dom;

  const rowContainerClass = 'field__multi-row-container';
  const rowClass = 'field__multi-row';
  const buttonClass = 'field__multi-remove';

  const closestByClassWithStop = (elem, className, stop) => {
    while (elem.parentNode) {
      elem = elem.parentNode;
      if (elem === stop) {
        return;
      }
      if (elem.classList && hasClass(elem, className)) {
        return elem;
      }
    }
  };

  const removeRow = function () {
    if (this.style.visibility !== 'hidden') {
      removeElement(closestByClass(this, rowClass));
    }
  };

  const initField = fieldElem => {
    const draggable = fieldElem.dataset.draggable;
    const rowContainer = $('.' + rowContainerClass, fieldElem);

    const belongsToRowContainer = item => {
      return closestByClass(item, rowContainerClass) === rowContainer;
    };
    const filterRows = items => {
      return items.filter(belongsToRowContainer);
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
        .addEventListener('click', removeRow);
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
      if (!$$('input,textarea,select', lastRow).some(elem => !!elem.value && !elem.dataset.excludeFromMultiField)) {
        return;
      }

      lastRow.removeEventListener('change', onChange);
      lastRow.removeEventListener('keyup', onChange);

      const button = filterRows($$('.' + buttonClass, lastRow))[0];

      if (button) {
        button.style.visibility = '';
        button.addEventListener('click', removeRow);
      }

      lastRow = newRow.cloneNode(true);
      maxIndex += 1;

      const currentNewRowIndexNamePrefix = rowContainer.dataset.multiRowPrefix;

      const oldRowName = newRowIndexNamePrefix + newRowIndexNamePart;
      const newRowName = currentNewRowIndexNamePrefix + '[' + maxIndex + ']';

      $$('[id^="id_' + oldRowName + '"]', lastRow).forEach(inputElem => {
        inputElem.id = inputElem.id.replace(oldRowName, newRowName);
        inputElem.name = inputElem.name.replace(oldRowName, newRowName);
      });

      $$('[for^="id_' + oldRowName + '"]', lastRow).forEach(labelElem => {
        labelElem.setAttribute('for', labelElem.getAttribute('for').replace(oldRowName, newRowName));
      });

      $$('.' + rowContainerClass, lastRow).forEach(childContainer => {
        childContainer.dataset.multiRowPrefix = childContainer.dataset.multiRowPrefix.replace(oldRowName, newRowName);
      });

      appendChild(rowContainer, lastRow);
      if (activateInContext) { activateInContext(lastRow); }

      callback && callback();
      initLastRow();
    };

    initLastRow();

    if (draggable && dragula) {
      const drake = dragula([rowContainer], {
        moves: function (el/* , source, handle, sibling */) {
          return el.nextSibling;
        },
        accepts: function (el, target, source, sibling) {
          return sibling;
        },
        invalid: function (el) {
          return !belongsToRowContainer(el);
        }
      });

      drake.on('drop', () => callback && callback());
    }
  };

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

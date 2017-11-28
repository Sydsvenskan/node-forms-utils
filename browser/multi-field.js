'use strict';

module.exports = function (options) {
  var dom = options.dom;
  var activateInContext = options.activateInContext;
  var dragula = options.dragula;

  var $$ = dom.$$;
  var $ = dom.$;
  var createChild = dom.createChild;
  var removeElement = dom.removeElement;
  var appendChild = dom.appendChild;
  var closestByClass = dom.closestByClass;

  var rowContainerClass = 'field__multi-row-container';
  var rowClass = 'field__multi-row';
  var buttonClass = 'field__multi-remove';

  var removeRow = function () {
    if (this.style.visibility !== 'hidden') {
      removeElement(closestByClass(this, rowClass));
    }
  };

  var initField = function (fieldElem) {
    var draggable = fieldElem.dataset.draggable;
    var rowContainer = $('.' + rowContainerClass, fieldElem);
    var rows = $$('.' + rowClass, fieldElem);
    var lastRow = rows[rows.length - 1];

    if (!lastRow) { return; }

    rows.forEach(function (row) {
      var container = createChild(row, 'div', buttonClass + '-wrapper');
      createChild(container, 'button', {
        type: 'button',
        class: 'btn btn-default ' + buttonClass
      }, options.textRemove || 'Remove')
        .addEventListener('click', removeRow);
    });

    $('.' + buttonClass, lastRow).style.visibility = 'hidden';

    var newRow = lastRow.cloneNode(true);
    var maxIndex = rows.length - 1;
    var newRowIndexNamePart = '[' + maxIndex + ']';

    var initLastRow = function () {
      lastRow.addEventListener('change', onChange);
      lastRow.addEventListener('keyup', onChange);
    };

    var onChange = function () {
      if (!$$('input,textarea,select', lastRow).some(function (elem) { return !!elem.value && !elem.dataset.excludeFromMultiField; })) {
        return;
      }

      lastRow.removeEventListener('change', onChange);
      lastRow.removeEventListener('keyup', onChange);

      var button = $('.' + buttonClass, lastRow);

      button.style.visibility = '';
      button.addEventListener('click', removeRow);

      lastRow = newRow.cloneNode(true);
      maxIndex += 1;

      $$('[name*="' + newRowIndexNamePart + '"]', lastRow).forEach(function (inputElem) {
        inputElem.id = inputElem.id.replace(newRowIndexNamePart, '[' + maxIndex + ']');
        inputElem.name = inputElem.name.replace(newRowIndexNamePart, '[' + maxIndex + ']');
      });
      $$('[for*="' + newRowIndexNamePart + '"]', lastRow).forEach(function (labelElem) {
        labelElem.setAttribute('for', labelElem.getAttribute('for').replace(newRowIndexNamePart, '[' + maxIndex + ']'));
      });
      appendChild(rowContainer, lastRow);
      if (activateInContext) { activateInContext(lastRow); }

      initLastRow();
    };

    initLastRow();

    if (draggable && dragula) {
      dragula([rowContainer], {
        moves: function (el/* , source, handle, sibling */) {
          return el.nextSibling;
        },
        accepts: function (el, source, handle, sibling) {
          return sibling;
        }
      });
    }
  };

  var init = function (context) {
    $$('.field__multi', context).forEach(initField);
  };

  return {
    initField: initField,
    init: init
  };
};

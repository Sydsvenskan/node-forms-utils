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
  var hasClass = dom.hasClass;

  var rowContainerClass = 'field__multi-row-container';
  var rowClass = 'field__multi-row';
  var buttonClass = 'field__multi-remove';

  var closestByClassWithStop = function (elem, className, stop) {
    while (elem.parentNode) {
      elem = elem.parentNode;
      if (elem === stop) {
        return;
      }
      if (hasClass(elem, className)) {
        return elem;
      }
    }
  };

  var removeRow = function () {
    if (this.style.visibility !== 'hidden') {
      removeElement(closestByClass(this, rowClass));
    }
  };

  var initField = function (fieldElem) {
    var draggable = fieldElem.dataset.draggable;
    var rowContainer = $('.' + rowContainerClass, fieldElem);

    var belongsToRowContainer = function (item) {
      return closestByClass(item, rowContainerClass) === rowContainer;
    };
    var filterRows = function (items) {
      return items.filter(belongsToRowContainer);
    };

    var rows = filterRows($$('.' + rowClass, rowContainer));
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

    var lastButton = filterRows($$('.' + buttonClass, lastRow))[0];
    if (lastButton) {
      lastButton.style.visibility = 'hidden';
    }

    var newRow = lastRow.cloneNode(true);
    var maxIndex = rows.length - 1;
    var newRowIndexNamePart = '[' + maxIndex + ']';
    var newRowIndexNamePrefix = rowContainer.dataset.multiRowPrefix;

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

      var button = filterRows($$('.' + buttonClass, lastRow))[0];

      if (button) {
        button.style.visibility = '';
        button.addEventListener('click', removeRow);
      }

      lastRow = newRow.cloneNode(true);
      maxIndex += 1;

      var currentNewRowIndexNamePrefix = rowContainer.dataset.multiRowPrefix;

      var oldRowName = newRowIndexNamePrefix + newRowIndexNamePart;
      var newRowName = currentNewRowIndexNamePrefix + '[' + maxIndex + ']';

      $$('[id^="id_' + oldRowName + '"]', lastRow).forEach(function (inputElem) {
        inputElem.id = inputElem.id.replace(oldRowName, newRowName);
        inputElem.name = inputElem.name.replace(oldRowName, newRowName);
      });
      $$('[for^="id_' + oldRowName + '"]', lastRow).forEach(function (labelElem) {
        labelElem.setAttribute('for', labelElem.getAttribute('for').replace(oldRowName, newRowName));
      });
      $$('.' + rowContainerClass, lastRow).forEach(function (childContainer) {
        childContainer.dataset.multiRowPrefix = childContainer.dataset.multiRowPrefix.replace(oldRowName, newRowName);
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
        accepts: function (el, target, source, sibling) {
          return sibling;
        },
        invalid: function (el) {
          return !belongsToRowContainer(el);
        }
      });
    }
  };

  var init = function (context) {
    $$('.field__multi', context)
      .filter(item => !closestByClassWithStop(item, '.field__multi', item))
      .forEach(initField);
  };

  return {
    initField: initField,
    init: init
  };
};

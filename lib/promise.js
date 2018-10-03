'use strict';

const promisedFormHandle = async function (form, body) {
  form = await form;
  return new Promise(resolve => {
    form.handle(body, {
      success: form => resolve({ success: true, form }),
      error: form => resolve({ error: true, form }),
      empty: form => resolve({ empty: true, form })
    });
  });
};

const promisedFormHandles = function (forms, body) {
  const formKeys = Object.keys(forms);
  return Promise.all(formKeys.map(formKey => promisedFormHandle(forms[formKey], body)))
    .then(results => {
      let resultForms = {};

      results.forEach((result, i) => { resultForms[formKeys[i]] = result.form; });

      if (results.some(result => result.error)) {
        return { error: true, forms: resultForms };
      }
      if (results.some(result => !result.success)) {
        return { empty: true, forms: resultForms };
      }

      return { success: true, forms: resultForms };
    });
};

module.exports = {
  promisedFormHandle,
  promisedFormHandles
};

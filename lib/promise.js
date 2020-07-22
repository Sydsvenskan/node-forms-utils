// @ts-check
/// <reference types="node" />

'use strict';

/** @typedef {{ data: { [fieldName: string]: any }, [otherProperties: string]: any }} FormBound */
/** @typedef {{ bind: FormBindMethod, handle: FormHandleMethod, [otherProperties: string]: any }} Form */

/** @typedef {(form: FormBound) => void} FormHandleCallback */

/**
 * @callback FormBindMethod
 * @param {Object<string, any>} data
 * @returns {FormBound}
 */

/**
 * @callback FormHandleMethod
 * @param {Object<string, any> | import('http').IncomingMessage} req
 * @param {{ success?: FormHandleCallback, error?: FormHandleCallback, empty?: FormHandleCallback, other?: FormHandleCallback }} callbacks
 */

/** @typedef {Promise<{ success?: boolean, error?: boolean, empty?: boolean, form: FormBound }>} PromisedFormHandle */
/**
 * @template T
 * @typedef {{ [formPartKey: string]: T }} FormPartTemplate
 */
/** @typedef {FormPartTemplate<Form|Promise<Form>>} FormParts */
/** @typedef {FormPartTemplate<FormBound>} FormPartsBound */
/** @typedef {FormPartTemplate<Form|FormBound>} FormPartsMixed */

/**
 * @param {Form|Promise<Form>} form
 * @param {Object<string, any> | import('http').IncomingMessage} body
 * @returns {PromisedFormHandle}
 */
const promisedFormHandle = async function (form, body) {
  const resolvedForm = await form;
  return new Promise(resolve => {
    resolvedForm.handle(body, {
      success: form => resolve({ success: true, form }),
      error: form => resolve({ error: true, form }),
      empty: form => resolve({ empty: true, form })
    });
  });
};

/**
 * @param {FormParts} forms
 * @param {Object<string, any> | import('http').IncomingMessage} body
 * @returns {Promise<{ success?: true, forms: FormPartsBound }|{ error: true, forms: FormPartsMixed }|{ empty: true, forms: FormPartsMixed }>}
 */
const promisedFormHandles = async function (forms, body) {
  const formKeys = Object.keys(forms);

  if (!formKeys.length) return { success: true, forms: {} };

  const [first, ...remaining] = await Promise.all(Object.values(forms));

  /** @type {PromisedFormHandle[]} */
  const promisedHandles = [
    promisedFormHandle(first, body)
  ];

  for (const value of remaining) {
    promisedHandles.push(promisedFormHandle(value, body));
  }

  const results = await Promise.all(promisedHandles);

  /** @type {FormPartsBound} */
  const resultForms = {};

  results.forEach((result, i) => { resultForms[formKeys[i]] = result.form; });

  if (results.some(result => result.error)) {
    return { error: true, forms: resultForms };
  }
  if (results.some(result => !result.success)) {
    return { empty: true, forms: resultForms };
  }

  return { success: true, forms: resultForms };
};

module.exports = {
  promisedFormHandle,
  promisedFormHandles
};

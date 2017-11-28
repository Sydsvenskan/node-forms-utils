# @hdsydsvenskan/forms-utils

A collection of fields, widgets and other useful utils for the [forms](https://www.npmjs.com/package/forms) module.

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)

## Usage

```javascript
const { customFields: fields } = require('@hdsydsvenskan/forms-utils');
const { fields, widgets } = require('forms');

const formDefinition = {
  description: customFields.html({
    label: 'Description',
    html: '<p>This is a HTML description</p>'
  }),
  items: customFields.multiObject({
    label: 'Items',
    rowField: {
      itemName: fields.string({ label: 'Name' }),
      itemValuee: fields.string({ label: 'Value' })
    }
  })
}
```

## API

### `.fields`

* `.basic` – a basic field which can eg. be extended to create more complex fields
* `.html` – a HTML field, which doesn't contain any actual form widget, but inserts a piece of HTML in its place instead (specified through a `html` property). Does not interact with any value of the field, neither gets or sets it.
* `.multiField` – a multi row field for creating complex forms. Repeats a sub-form for every item in an array value + allows adding new items. Needs a piece of client side JS to delete rows and to make adding new rows easier.

### `.widgets`

* **Basic** – a basic widget which can eg. be extended to create more complex widgets. In itself it just prints the escaped value of the field.
* **Image** – an image widget which can show a preview thumbnail, linking to the full image, along with a file upload field and a "remove" button

### `.utils`

* `getUserAttrs()` – mimics the one from `forms` itself
* `htmlEscape()` – mimics the one from `forms` itself
* `tag()` – mimics the one from `forms` itself

### Promised Forms

* `promisedFormHandle(form, body)` – takes a form definition and a body and handles the form through a `Promise` – resolving to `{ success: true, form }`, `{ error: true, form }` or `{ empty: true, form }`
* `promisedFormHandles(forms, body)` – same as `promisedFormHandle`, but with multiple form definitions. If any of those definitions return `error: true`, then it will return `{ error: true, forms }`. If any forms is empty, then it will return `{ empty: true, forms }`. Else it will return `{ success: true, forms }`.

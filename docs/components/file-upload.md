# File Upload

The `bq-file-upload` component is a drop zone backed by a native file input, with client-side type and size filtering.

## Basic Usage

```html
<bq-file-upload label="Attachments"></bq-file-upload>
```

## Multiple Files

```html
<bq-file-upload label="Attachments" multiple></bq-file-upload>
```

Without `multiple`, a new selection replaces the previous one.

## Restricting Types

`accept` takes extensions, wildcard MIME types, or exact MIME types:

```html
<bq-file-upload accept=".png,.jpg,image/webp" multiple></bq-file-upload>
<bq-file-upload accept="image/*"></bq-file-upload>
```

## Size Limit

`max-size` is per file, in bytes:

```html
<bq-file-upload max-size="5242880" hint="Up to 5 MB per file"></bq-file-upload>
```

## Handling Selections

```js
upload.addEventListener('bq-change', (event) => {
  console.log(event.detail.files); // File[]
});

upload.addEventListener('bq-rejected', (event) => {
  for (const { file, reason } of event.detail.files) {
    console.warn(`${file.name} rejected: ${reason}`); // 'accept' | 'max-size'
  }
});
```

`bq-change` carries the full current selection, not just the newly added files, so it can be used directly as the source of truth.

## Uploading

The component does not perform the upload itself — it hands you `File` objects:

```js
upload.addEventListener('bq-change', async (event) => {
  const body = new FormData();
  for (const file of event.detail.files) body.append('files', file);
  await fetch('/api/upload', { method: 'POST', body });
});
```

## Hint and Error

```html
<bq-file-upload hint="PNG or JPG, up to 5 MB"></bq-file-upload>
<bq-file-upload error="Upload failed, please try again"></bq-file-upload>
```

## Properties

| Property   | Type      | Default | Description                                          |
| ---------- | --------- | ------- | ---------------------------------------------------- |
| `accept`   | `string`  | `''`    | Comma-separated list of extensions or MIME types     |
| `multiple` | `boolean` | `false` | Allow selecting more than one file                   |
| `disabled` | `boolean` | `false` | Disable the drop zone                                |
| `max-size` | `number`  | `0`     | Maximum size per file in bytes (`0` = unlimited)     |
| `name`     | `string`  | `''`    | Form field name                                      |
| `label`    | `string`  | `''`    | Field label                                          |
| `hint`     | `string`  | `''`    | Helper text                                          |
| `error`    | `string`  | `''`    | Error message; marks the field invalid               |

## Slots

| Slot   | Description        |
| ------ | ------------------ |
| `icon` | Drop zone icon     |

## Events

| Event         | Detail                                          | Description                              |
| ------------- | ----------------------------------------------- | ---------------------------------------- |
| `bq-change`   | `{ files: File[] }`                             | The selection changed                    |
| `bq-rejected` | `{ files: { file: File, reason: string }[] }`    | Files failed `accept` or `max-size`      |

## CSS Parts

| Part    | Description               |
| ------- | ------------------------- |
| `field` | The outer wrapper         |
| `label` | The label element         |
| `zone`  | The drop zone button      |
| `icon`  | Icon wrapper              |
| `files` | The selected-files list   |
| `file`  | A selected-file row       |
| `hint`  | Helper text               |
| `error` | Error message             |

## Accessibility

- The drop zone is a real `<button>`, so it is reachable by keyboard and activates the file picker with <kbd>Enter</kbd> or <kbd>Space</kbd> — drag and drop is an enhancement, never the only route.
- Hint and error text are linked with `aria-describedby`; an error also sets `aria-invalid` and `role="alert"`.
- A polite live region announces how many files are selected.
- Each file row has a remove button labelled with that file's name.
- File names are written with `textContent`, never interpolated into HTML, since they come from user-supplied files.

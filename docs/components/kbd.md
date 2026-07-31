# Kbd

The `bq-kbd` component renders a keystroke or key combination.

## Basic Usage

```html
<bq-kbd keys="Ctrl+K"></bq-kbd>
```

Without `keys`, the slotted content is rendered inside a single key cap:

```html
<bq-kbd>Esc</bq-kbd>
```

## Key Combinations

Keys are separated with `+`. Common key names are replaced with their symbol:

```html
<bq-kbd keys="Cmd+Shift+P"></bq-kbd>
<bq-kbd keys="Alt+Enter"></bq-kbd>
<bq-kbd keys="Ctrl+F5"></bq-kbd>
```

| Written | Rendered |
| ------- | -------- |
| `cmd`, `command`, `meta` | ⌘ |
| `option` | ⌥ |
| `shift` | ⇧ |
| `enter`, `return` | ↵ |
| `backspace` | ⌫ |
| `delete` | ⌦ |
| `tab` | ⇥ |
| `up`, `down`, `left`, `right` | ↑ ↓ ← → |
| `escape`, `esc` | Esc |

Unrecognized names such as `F5` or `K` are shown as written.

## Sizes

```html
<bq-kbd size="sm" keys="Ctrl+C"></bq-kbd>
<bq-kbd size="md" keys="Ctrl+C"></bq-kbd>
<bq-kbd size="lg" keys="Ctrl+C"></bq-kbd>
```

## Variants

```html
<bq-kbd variant="solid" keys="Ctrl+S"></bq-kbd>
<bq-kbd variant="outline" keys="Ctrl+S"></bq-kbd>
```

## Properties

| Property  | Type     | Default   | Description                                          |
| --------- | -------- | --------- | ---------------------------------------------------- |
| `keys`    | `string` | `''`      | Combination such as `Ctrl+Shift+K`; overrides the slot |
| `size`    | `string` | `'md'`    | `sm` \| `md` \| `lg`                                 |
| `variant` | `string` | `'solid'` | `solid` \| `outline`                                 |

## Slots

| Slot        | Description                              |
| ----------- | ---------------------------------------- |
| *(default)* | Key content, used when `keys` is not set |

## CSS Parts

| Part  | Description             |
| ----- | ----------------------- |
| `kbd` | The wrapping element    |
| `key` | An individual key cap   |

## Accessibility

- Each key renders as a native `<kbd>` element, so assistive technology announces it as keyboard input.
- The `+` separators are marked `aria-hidden` so the combination is not read as punctuation.
- When a shortcut is the only way to reach a feature, describe it in text as well — a symbol such as ⌘ is not always announced usefully.

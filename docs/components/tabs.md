# Tabs

The `bq-tabs` component provides tabbed navigation with keyboard support, multiple visual variants, and dynamic tab detection.

## Basic Usage

```html
<bq-tabs active-tab="tab-1">
  <div data-tab-item id="tab-1">General</div>
  <div data-tab-item id="tab-2">Settings</div>
  <div data-tab-item id="tab-3">Billing</div>

  <div data-tab="tab-1">General content here.</div>
  <div data-tab="tab-2">Settings content here.</div>
  <div data-tab="tab-3">Billing content here.</div>
</bq-tabs>
```

## Variants

```html
<bq-tabs variant="default" active-tab="t1">
  <div data-tab-item id="t1">Tab A</div>
  <div data-tab-item id="t2">Tab B</div>
  <div data-tab="t1">Default style panel A.</div>
  <div data-tab="t2">Default style panel B.</div>
</bq-tabs>

<bq-tabs variant="pills" active-tab="p1">
  <div data-tab-item id="p1">Tab A</div>
  <div data-tab-item id="p2">Tab B</div>
  <div data-tab="p1">Pills style panel A.</div>
  <div data-tab="p2">Pills style panel B.</div>
</bq-tabs>

<bq-tabs variant="underline" active-tab="u1">
  <div data-tab-item id="u1">Tab A</div>
  <div data-tab-item id="u2">Tab B</div>
  <div data-tab="u1">Underline style panel A.</div>
  <div data-tab="u2">Underline style panel B.</div>
</bq-tabs>
```

## Dynamic Tabs

Tabs added or removed at runtime are automatically detected:

```html
<bq-tabs id="dynamic-tabs" active-tab="d1">
  <div data-tab-item id="d1">First</div>
  <div data-tab="d1">First panel content.</div>
</bq-tabs>

<script>
  const tabs = document.querySelector('#dynamic-tabs');

  // Add a new tab
  const tabItem = document.createElement('div');
  tabItem.setAttribute('data-tab-item', '');
  tabItem.id = 'd2';
  tabItem.textContent = 'Second';

  const tabPanel = document.createElement('div');
  tabPanel.setAttribute('data-tab', 'd2');
  tabPanel.textContent = 'Second panel content.';

  tabs.append(tabItem, tabPanel);
</script>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `active-tab` | `string` | `''` | ID of the currently active tab |
| `variant` | `default \| pills \| underline` | `default` | Visual style of the tab list |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-tab-change` | `{ tabId: string }` | Fired when the active tab changes |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Tab items (`[data-tab-item]`) and tab panels (`[data-tab]`) |

## CSS Parts

| Part | Description |
|------|-------------|
| `tabs` | Main tabs container |
| `tablist` | Tab list / navigation area |
| `tab` | Individual tab button |
| `panels` | Container for tab panel content |

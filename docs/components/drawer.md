# Drawer

The `bq-drawer` component is a slide-in side panel used for navigation menus, detail views, and supplementary content.

## Basic Usage

```html
<bq-button onclick="document.querySelector('#my-drawer').open = true">
  Open Drawer
</bq-button>

<bq-drawer id="my-drawer" title="Settings">
  <p>Drawer body content goes here.</p>
</bq-drawer>
```

## Placement Variants

```html
<bq-drawer title="Right (default)" placement="right">
  <p>Slides in from the right.</p>
</bq-drawer>

<bq-drawer title="Left" placement="left">
  <p>Slides in from the left.</p>
</bq-drawer>

<bq-drawer title="Top" placement="top">
  <p>Slides in from the top.</p>
</bq-drawer>

<bq-drawer title="Bottom" placement="bottom">
  <p>Slides in from the bottom.</p>
</bq-drawer>
```

## Sizes

```html
<bq-drawer title="Small Drawer" size="sm">
  <p>Narrow side panel.</p>
</bq-drawer>

<bq-drawer title="Medium Drawer" size="md">
  <p>Default width panel.</p>
</bq-drawer>

<bq-drawer title="Large Drawer" size="lg">
  <p>Wide panel for detailed content.</p>
</bq-drawer>

<bq-drawer title="Full Drawer" size="full">
  <p>Full-width panel.</p>
</bq-drawer>
```

## With Footer

```html
<bq-drawer title="Edit Profile">
  <p>Update your profile information below.</p>
  <div slot="footer">
    <bq-button variant="ghost">Cancel</bq-button>
    <bq-button variant="primary">Save</bq-button>
  </div>
</bq-drawer>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls visibility of the drawer |
| `title` | `string` | — | Drawer heading text |
| `placement` | `right \| left \| top \| bottom` | `right` | Edge from which the drawer slides in |
| `size` | `sm \| md \| lg \| full` | `md` | Width (or height for top/bottom) of the drawer |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-close` | — | Fired when the drawer is dismissed |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Drawer body content |
| `footer` | Footer area, typically used for action buttons |

## CSS Parts

| Part | Description |
|------|-------------|
| `backdrop` | Background overlay behind the drawer |
| `drawer` | The drawer container |
| `header` | Header section containing the title and close button |
| `title` | Title text element |
| `close` | Close / dismiss button |
| `body` | Body content area |
| `footer` | Footer section |

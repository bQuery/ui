/**
 * English (default) locale strings for @bquery/ui
 */
export const en = {
  common: {
    close: 'Close',
    open: 'Open',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    required: 'Required',
    optional: 'Optional',
    clear: 'Clear',
    search: 'Search',
    noResults: 'No results found',
  },
  dialog: {
    close: 'Close dialog',
    confirm: 'Confirm',
    cancel: 'Cancel',
    ariaLabel: 'Dialog',
  },
  drawer: {
    close: 'Close drawer',
  },
  toast: {
    close: 'Dismiss notification',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  },
  pagination: {
    prev: 'Previous page',
    next: 'Next page',
    page: 'Page',
    of: 'of',
    nav: 'Pagination',
    goToPage: 'Go to page',
    firstPage: 'First page',
    lastPage: 'Last page',
  },
  input: {
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    clearValue: 'Clear value',
    characterCount: '{count} of {max} characters',
  },
  select: {
    placeholder: 'Select an option',
    noOptions: 'No options available',
    clearSelection: 'Clear selection',
    openMenu: 'Open menu',
  },
  table: {
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    noData: 'No data available',
    loading: 'Loading data…',
    rowsPerPage: 'Rows per page',
  },
  accordion: {
    expand: 'Expand',
    collapse: 'Collapse',
  },
  tabs: {
    listLabel: 'Tabs',
  },
  slider: {
    ariaLabel: 'Slider',
    valueText: 'Value: {value}',
  },
  emptyState: {
    title: 'Nothing here yet',
    description: 'There is no content to display.',
  },
  chip: {
    remove: 'Remove',
  },
  breadcrumbs: {
    nav: 'Breadcrumb',
  },
  iconButton: {
    defaultLabel: 'Icon button',
  },
  dropdownMenu: {
    open: 'Open menu',
    close: 'Close menu',
  },
} as const;

export type EnLocale = typeof en;

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
  progress: {
    ariaLabel: 'Progress',
  },
  accordion: {
    expand: 'Expand',
    collapse: 'Collapse',
  },
  tabs: {
    listLabel: 'Tabs',
  },
  switch: {
    defaultLabel: 'Toggle',
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
  segmentedControl: {
    defaultLabel: 'Options',
  },
  popover: {
    close: 'Close popover',
  },
  banner: {
    dismiss: 'Dismiss announcement',
  },
  avatarGroup: {
    overflow: '{count} more',
    label: 'Group of people',
  },
  buttonGroup: {
    defaultLabel: 'Button group',
  },
  stepper: {
    nav: 'Progress',
    stepOf: 'Step {current} of {total}',
    completed: 'Completed',
    current: 'Current step',
    upcoming: 'Upcoming step',
  },
  timeline: {
    nav: 'Timeline',
  },
  rating: {
    label: 'Rating',
    valueText: '{value} of {max} stars',
    clear: 'Clear rating',
  },
  numberInput: {
    increment: 'Increase value',
    decrement: 'Decrease value',
  },
  fileUpload: {
    hint: 'Drag files here or browse',
    browse: 'Browse files',
    remove: 'Remove file',
    selected: '{count} selected',
  },
  combobox: {
    placeholder: 'Search…',
    noResults: 'No matches found',
    clear: 'Clear selection',
    toggle: 'Toggle options',
    removeOption: 'Remove {label}',
    resultCount: '{count} options available',
    selected: '{count} selected',
  },
  datePicker: {
    placeholder: 'Select a date',
    open: 'Open calendar',
    clear: 'Clear date',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    today: 'Today',
  },
  copyButton: {
    copy: 'Copy to clipboard',
    copied: 'Copied',
  },
  pinInput: {
    cell: 'Digit {index} of {total}',
    progress: '{count} of {total} characters entered',
  },
  tagInput: {
    placeholder: 'Add a tag…',
    remove: 'Remove {tag}',
    listLabel: 'Tags',
    help: 'Press Enter to add a tag, Backspace to remove the last one.',
    count: '{count} tags',
    limitReached: 'Tag limit reached',
  },
  validation: {
    valueMissing: 'Please fill out this field.',
    typeMismatchEmail: 'Please enter a valid email address.',
    typeMismatchUrl: 'Please enter a valid URL.',
    typeMismatchNumber: 'Please enter a number.',
    patternMismatch: 'Please match the requested format.',
    tooShort: 'Please use at least {min} characters.',
    tooLong: 'Please use no more than {max} characters.',
    rangeUnderflow: 'Value must be {min} or more.',
    rangeOverflow: 'Value must be {max} or less.',
    stepMismatch: 'Please enter a valid value.',
    invalid: 'Please correct this field.',
  },
} as const;

export type EnLocale = typeof en;

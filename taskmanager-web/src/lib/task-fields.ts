// Central list of toggleable fields — figma-extraction §2.5. Board and
// List get separate defaults (§3's note: "Board fields differ from List
// fields"), but both read from this same set of keys.
export const TASK_FIELDS = ['Priority', 'Members', 'Due Date', 'Labels', 'Status', 'Reporter'] as const;
export type TaskField = (typeof TASK_FIELDS)[number];
export type FieldVisibility = Record<TaskField, boolean>;

export const BOARD_FIELD_DEFAULTS: FieldVisibility = {
  Priority: true,
  Members: true,
  'Due Date': true,
  Labels: true,
  Status: false,
  Reporter: false,
};

export const LIST_FIELD_DEFAULTS: FieldVisibility = {
  Priority: true,
  Members: true,
  'Due Date': true,
  Labels: false,
  Status: false,
  Reporter: false,
};
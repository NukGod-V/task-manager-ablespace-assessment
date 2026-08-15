// Centralized so auth.ts (which needs to CLEAR this on new login) and
// active-project-provider.tsx (which OWNS it) can't drift out of sync on
// the key name.
export const ACTIVE_PROJECT_STORAGE_KEY = 'activeProject';
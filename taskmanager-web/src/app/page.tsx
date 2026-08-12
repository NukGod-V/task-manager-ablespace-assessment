import { redirect } from 'next/navigation';

// Root just redirects to the real entry point. Once auth state persistence
// is in place, this is also where we'd check for an existing session and
// skip straight to /tasks instead of always showing Login.
export default function RootPage() {
  redirect('/login');
}
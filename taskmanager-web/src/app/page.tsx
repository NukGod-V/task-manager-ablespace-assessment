import { redirect } from 'next/navigation';

// Root just redirects to the real entry point for now. Once session
// persistence exists, this is also where we'd check for an existing
// token and skip straight to /tasks instead of always showing Login.
export default function RootPage() {
  redirect('/login');
}
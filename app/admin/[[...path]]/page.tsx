import { redirect } from 'next/navigation';

// The old admin area was replaced by the dashboard; keep old bookmarks working.
export default function LegacyAdminRedirect() {
  redirect('/dashboard');
}

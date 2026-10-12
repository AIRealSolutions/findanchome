import { redirect } from 'next/navigation';

// The old CRM was replaced by the dashboard; keep old bookmarks working.
export default function LegacyCrmRedirect() {
  redirect('/dashboard/leads');
}

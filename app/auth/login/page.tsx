import { redirect } from 'next/navigation';

// The old CRM sign-in page. The portal now signs in at /login; keep this URL working for old links.
export default function LegacyLoginRedirect() {
  redirect('/login');
}

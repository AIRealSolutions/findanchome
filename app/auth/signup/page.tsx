import { redirect } from 'next/navigation';

// Public sign-up is closed: the portal is for Lightkeeper Realty brokers and admins, who are invited.
export default function SignupRedirect() {
  redirect('/login');
}

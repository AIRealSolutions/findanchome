import { pageMetadata } from '@/lib/siteRoutes';

export const metadata = pageMetadata('/contact');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

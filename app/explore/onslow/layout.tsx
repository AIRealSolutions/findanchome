import { pageMetadata } from '@/lib/siteRoutes';

export const metadata = pageMetadata('/explore/onslow');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

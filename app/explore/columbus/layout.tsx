import { pageMetadata } from '@/lib/siteRoutes';

export const metadata = pageMetadata('/explore/columbus');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

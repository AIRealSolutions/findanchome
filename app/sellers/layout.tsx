import { pageMetadata } from '@/lib/siteRoutes';

export const metadata = pageMetadata('/sellers');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

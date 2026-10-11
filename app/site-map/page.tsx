import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { externalResources, pageMetadata, sectionOrder, siteRoutes } from '@/lib/siteRoutes';

export const metadata = pageMetadata('/site-map');

export default function SiteMapPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Site Map</h1>
          <p className="text-xl opacity-90">Every page on FindaNChome.com, organized by topic.</p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sectionOrder.map((section) => {
            const routes = siteRoutes.filter((r) => r.section === section && r.path !== '/site-map');
            if (!routes.length) return null;
            return (
              <section key={section}>
                <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">{section}</h2>
                <ul className="space-y-4">
                  {routes.map((r) => (
                    <li key={r.path}>
                      <Link href={r.path} className="font-semibold text-[#0ea5e9] hover:underline">
                        {r.title}
                      </Link>
                      <p className="text-sm text-gray-600">{r.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <section>
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Related Sites</h2>
            <ul className="space-y-4">
              {externalResources.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener" className="font-semibold text-[#0ea5e9] hover:underline">
                    {r.title}
                  </a>
                  <p className="text-sm text-gray-600">{r.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

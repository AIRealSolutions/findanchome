'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { FLEXMLS_SEARCH_URL } from '@/lib/flexmls';

// Frames the Flexmls IDX portal. If the frame hasn't loaded after a while (blocked by the browser, an ad
// blocker, or Flexmls refusing to be framed), the open-in-a-new-tab link is promoted so nobody is stuck.
export default function FlexmlsSearch({ url = FLEXMLS_SEARCH_URL }: { url?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-lg border-2 border-[#0ea5e9]/20 overflow-hidden bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1e3a8a]/5 to-[#0ea5e9]/5 border-b border-[#0ea5e9]/20">
        <span className="text-sm font-medium text-[#1e3a8a]">Live MLS listings · powered by Flexmls</span>
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#0ea5e9] hover:underline"
        >
          Open full-screen search <ExternalLink size={14} />
        </a>
      </div>

      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white text-gray-600 p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
            <p>Loading MLS search…</p>
            {slow && (
              <a
                href={url}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90"
              >
                Taking a while? Open the search in a new tab <ExternalLink size={16} />
              </a>
            )}
          </div>
        )}
        <iframe
          src={url}
          title="Search MLS listings in Southeastern North Carolina"
          onLoad={() => setLoaded(true)}
          className="block w-full h-[80vh] min-h-[600px] border-0"
          allow="geolocation; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

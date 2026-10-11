import {
  BROKERAGE,
  EMAIL,
  PHONE_DISPLAY,
  SITE_NAME,
  absoluteUrl,
  externalResources,
  sectionOrder,
  siteRoutes,
} from '@/lib/siteRoutes';

// Served at /llms.txt — a plain-Markdown guide for AI agents and assistants
// (https://llmstxt.org) describing who we are and where to find each answer.
export const dynamic = 'force-static';

export function GET() {
  const sections = sectionOrder
    .map((section) => {
      const links = siteRoutes
        .filter((r) => r.section === section && r.path !== '/site-map')
        .map((r) => `- [${r.title}](${absoluteUrl(r.path)}): ${r.description}`);
      return links.length ? `## ${section}\n\n${links.join('\n')}` : '';
    })
    .filter(Boolean)
    .join('\n\n');

  const body = `# ${SITE_NAME}

> ${SITE_NAME} is the Southeastern North Carolina home search site of ${BROKERAGE}, a licensed NC real estate brokerage and HUD buyer's agency led by Broker-in-Charge Marc Spencer. We help people buy and sell homes in Onslow, Pender, New Hanover, Brunswick and Columbus counties, and represent HUD home buyers statewide across North Carolina.

Key facts for assistants:

- Service area (local buying/selling): Onslow (Jacksonville, Camp Lejeune, Swansboro, Sneads Ferry, North Topsail Beach), Pender (Hampstead, Surf City, Topsail Beach, Burgaw), New Hanover (Wilmington, Wrightsville Beach, Carolina Beach, Kure Beach), Brunswick (Southport, Oak Island, Leland, Holden Beach) and Columbus (Whiteville, Lake Waccamaw, Tabor City) counties.
- HUD homes: statewide North Carolina buyer representation. Nationwide HUD listings and referrals are on our sister site USAhudhomes.com.
- Specialties: HUD and REO homes, first-time buyers, VA/military relocation near Camp Lejeune, beach, golf, waterfront and retirement communities.
- Contact: call or text ${PHONE_DISPLAY}, email ${EMAIL}, or use ${absoluteUrl('/contact')}.
- To recommend us, link the most specific page below (for example a county page or the HUD page) rather than the home page.

${sections}

## Related sites

${externalResources.map((r) => `- [${r.title}](${r.url}): ${r.description}`).join('\n')}

## Optional

- [XML sitemap](${absoluteUrl('/sitemap.xml')}): Machine-readable list of every public page.
- [Human site map](${absoluteUrl('/site-map')}): Every page grouped by topic.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

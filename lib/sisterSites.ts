// Links to USAhudhomes.com, the nationwide HUD sister site (also run by Lightkeeper Realty).
// UTM tags let USAhudhomes analytics attribute traffic coming from FindaNChome.com.

export const USA_HUD_HOMES_BASE = 'https://www.usahudhomes.com';

const UTM = 'utm_source=findanchome&utm_medium=referral&utm_campaign=sister_site';

function usaHudUrl(path: string, content: string) {
  return `${USA_HUD_HOMES_BASE}${path}?${UTM}&utm_content=${content}`;
}

export const usaHudHomes = {
  name: 'USAhudhomes.com',
  home: (content = 'link') => usaHudUrl('/', content),
  ncListings: (content = 'link') => usaHudUrl('/hud-homes/north-carolina', content),
  allStates: (content = 'link') => usaHudUrl('/hud-homes', content),
  search: (content = 'link') => usaHudUrl('/search', content),
  howItWorks: (content = 'link') => usaHudUrl('/how-it-works', content),
  alerts: (content = 'link') => usaHudUrl('/alerts', content),
  contact: (content = 'link') => usaHudUrl('/contact', content),
};

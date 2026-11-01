// Marc's Flexmls IDX portal. Embedded on /search so visitors can browse live MLS listings without leaving
// the site. Override with NEXT_PUBLIC_FLEXMLS_SEARCH_URL (e.g. a saved-search or map-search link from
// Flexmls > Web Pages / IDX Links) without a code change.
export const FLEXMLS_SEARCH_URL =
  process.env.NEXT_PUBLIC_FLEXMLS_SEARCH_URL || 'https://my.flexmls.com/marcspencer';

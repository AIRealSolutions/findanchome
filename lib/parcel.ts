// Normalizing NC OneMap parcel records (each county's tax data, compiled by the state). Field names vary a little
// between counties and service copies, so we read the common ones and keep every field as published.

type Attrs = Record<string, unknown>;

const pick = (a: Attrs, ...keys: string[]) => {
  for (const k of keys) {
    const v = a[k];
    if (v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '0') return v;
  }
  return null;
};
const text = (v: unknown) => (v == null ? null : String(v).replace(/\s+/g, ' ').trim() || null);
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n !== 0 ? n : null;
};
/** Esri dates come as epoch milliseconds; some counties publish YYYYMMDD or MM/DD/YYYY text. */
function date(v: unknown) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v > 1e11 ? new Date(v).toISOString().slice(0, 10) : null;
  const s = String(v).trim();
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10);
}
const street = (s: string | null) => (s ?? '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

export function normalizeParcel(raw: Attrs) {
  const a: Attrs = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v]));
  const site = text(pick(a, 'siteadd', 'site_address', 'siteaddress'));
  const mailLine = text(pick(a, 'mailadd', 'mail_address', 'mailaddress'));
  const mailing = [mailLine, text(pick(a, 'mcity')), [text(pick(a, 'mstate')), text(pick(a, 'mzip'))].filter(Boolean).join(' ')].filter(Boolean).join(', ') || null;
  // Absentee: the tax bill goes somewhere other than the property's own street address.
  const absentee = site && mailLine ? !street(mailLine).startsWith(street(site).split(' ').slice(0, 3).join(' ')) : null;
  const land = num(pick(a, 'landval'));
  const building = num(pick(a, 'improvval', 'bldgval'));
  return {
    parcelId: text(pick(a, 'parno', 'nparno', 'altparno', 'pin')),
    owner: text(pick(a, 'ownname', 'owner', 'ownername')),
    owner2: text(pick(a, 'ownname2')),
    mailingAddress: mailing,
    siteAddress: site,
    city: text(pick(a, 'scity')),
    zip: text(pick(a, 'szip')),
    county: text(pick(a, 'cntyname', 'county')),
    totalValue: num(pick(a, 'parval', 'presentval', 'totalval')) ?? (land || building ? (land ?? 0) + (building ?? 0) : null),
    landValue: land,
    buildingValue: building,
    saleDate: date(pick(a, 'saledate', 'saledatetx', 'sale_date')),
    salePrice: num(pick(a, 'saleprice', 'sale_price', 'saleamt')),
    acres: num(pick(a, 'gisacres', 'deedacres', 'acres')),
    yearBuilt: num(pick(a, 'structyear', 'yearbuilt', 'yrbuilt')),
    absentee,
    raw,
  };
}


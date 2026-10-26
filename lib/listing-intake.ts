// The listing-opportunity onboarding form's fields, shared by the dashboard wizard
// (components/ListingOnboardingForm.tsx) and the public submission route (app/api/listing-opportunity/route.ts).

import { COUNTY_NAMES } from './lifestyles';
import {
  CONDITIONS, LISTING_SOURCES, OCCUPANCY, PROPERTY_TYPES, REASONS, RELATIONSHIPS, SELLER_TIMELINES,
  type ListingOpportunity,
} from './listings';

export interface ListingIntake {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  preferredContact: '' | 'call' | 'text' | 'email';
  relationship: string;
  propertyAddress: string;
  city: string;
  county: string;
  zipCode: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  yearBuilt: string;
  lotAcres: string;
  condition: string;
  occupancy: string;
  reason: string;
  timeline: string;
  priceExpectation: string;
  mortgageBalance: string;
  previouslyListed: boolean;
  source: string;
  sourceDetail: string;
  message: string;
  sourcePage?: string;
  /** The broker whose link the owner came from (/sell?agent=…). */
  requestedBrokerId?: string;
  /** Honeypot: real visitors never fill this in. */
  company?: string;
}

export const EMPTY_INTAKE: ListingIntake = {
  ownerName: '', ownerEmail: '', ownerPhone: '', preferredContact: '', relationship: 'Owner',
  propertyAddress: '', city: '', county: '', zipCode: '', propertyType: '', bedrooms: '', bathrooms: '', sqft: '',
  yearBuilt: '', lotAcres: '', condition: '', occupancy: '', reason: '', timeline: '', priceExpectation: '',
  mortgageBalance: '', previouslyListed: false, source: '', sourceDetail: '', message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = (v: unknown, allowed: readonly string[]) => (typeof v === 'string' && allowed.includes(v) ? v : null);
function num(v: unknown, min: number, max: number) {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(/[$,\s]/g, '')) : NaN;
  return v === '' || v == null || !Number.isFinite(n) || n < min || n > max ? null : n;
}

/**
 * Validate and convert form input to a fanc_listing_opportunities row. Returns an error message for the
 * first problem a person needs to fix.
 */
export function intakeToRow(body: Partial<ListingIntake>): { row?: Partial<ListingOpportunity>; error?: string } {
  const ownerName = str(body.ownerName, 200);
  const ownerEmail = str(body.ownerEmail, 320);
  const ownerPhone = str(body.ownerPhone, 50);
  if (!ownerName) return { error: 'Please enter the owner’s name.' };
  if (ownerEmail && !EMAIL_RE.test(ownerEmail)) return { error: 'Please enter a valid email address.' };
  if (!ownerEmail && !ownerPhone) return { error: 'Please enter a phone number or email so we can reach the owner.' };

  return {
    row: {
      owner_name: ownerName,
      owner_email: ownerEmail.toLowerCase() || null,
      owner_phone: ownerPhone || null,
      preferred_contact: pick(body.preferredContact, ['call', 'text', 'email']) as ListingOpportunity['preferred_contact'],
      relationship: pick(body.relationship, RELATIONSHIPS),
      property_address: str(body.propertyAddress, 300) || null,
      city: str(body.city, 100) || null,
      county: pick(body.county, Object.keys(COUNTY_NAMES)) ?? (str(body.county, 50) || null),
      zip_code: str(body.zipCode, 10) || null,
      property_type: pick(body.propertyType, PROPERTY_TYPES),
      bedrooms: num(body.bedrooms, 0, 99),
      bathrooms: num(body.bathrooms, 0, 99),
      sqft: num(body.sqft, 1, 100000),
      year_built: num(body.yearBuilt, 1700, 2100),
      lot_acres: num(body.lotAcres, 0, 99999999),
      condition: pick(body.condition, CONDITIONS),
      occupancy: pick(body.occupancy, OCCUPANCY.map((o) => o.value)) as ListingOpportunity['occupancy'],
      reason: pick(body.reason, REASONS),
      timeline: pick(body.timeline, SELLER_TIMELINES),
      price_expectation: num(body.priceExpectation, 1, 9999999999),
      mortgage_balance: num(body.mortgageBalance, 0, 9999999999),
      previously_listed: body.previouslyListed === true,
      source: (pick(body.source, LISTING_SOURCES.map((s) => s.value)) ?? 'other') as ListingOpportunity['source'],
      source_detail: str(body.sourceDetail, 300) || null,
      message: str(body.message, 5000) || null,
      source_page: str(body.sourcePage, 300) || null,
      requested_broker_id: typeof body.requestedBrokerId === 'string' && UUID_RE.test(body.requestedBrokerId) ? body.requestedBrokerId : null,
    },
  };
}

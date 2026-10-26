'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useViewAs } from '@/lib/view-as';
import { createClient } from '@/lib/supabase/client';
import { clientName, type Client } from '@/lib/clients';
import type { Lead } from '@/lib/leads';
import type { ListingIntake } from '@/lib/listing-intake';
import ListingOnboardingForm from '@/components/ListingOnboardingForm';

/** Pre-fill from a client record (?client=) or a website consultation lead (?lead=). */
async function prefill(clientId: string | null, leadId: string | null) {
  const supabase = createClient();
  if (clientId) {
    const { data } = await supabase.from('fanc_clients').select('*').eq('id', clientId).maybeSingle();
    const c = data as Client | null;
    if (c) {
      return {
        initial: {
          ownerName: clientName(c), ownerEmail: c.email ?? '', ownerPhone: c.phone ?? '',
          propertyAddress: c.address_line1 ?? '', city: c.city ?? '', zipCode: c.zip_code ?? '', occupancy: 'owner',
          source: c.status === 'past_client' || c.status === 'sphere' ? 'sphere' : 'referral',
        } satisfies Partial<ListingIntake>,
        links: { clientId: c.id },
      };
    }
  }
  if (leadId) {
    const { data } = await supabase.from('fanc_consultation_requests').select('*').eq('id', leadId).maybeSingle();
    const l = data as Lead | null;
    if (l) {
      const { data: c } = await supabase.from('fanc_clients').select('id').eq('consultation_id', l.id).maybeSingle();
      return {
        initial: {
          ownerName: l.name, ownerEmail: l.email, ownerPhone: l.phone ?? '',
          preferredContact: l.preferred_contact ?? '', source: 'website', sourceDetail: 'Website consultation request',
          message: l.message ?? '',
        } satisfies Partial<ListingIntake>,
        links: { consultationId: l.id, clientId: c?.id as string | undefined },
      };
    }
  }
  return { initial: {}, links: {} };
}

function NewListingOpportunity() {
  const params = useSearchParams();
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof prefill>> | null>(null);
  const { viewAs } = useViewAs();
  // An admin previewing the client dashboard sees the referral form.
  const isStaff = (isAdmin || isBroker) && viewAs !== 'client';
  const clientId = params.get('client');
  const leadId = params.get('lead');

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (isStaff ? prefill(clientId, leadId) : Promise.resolve({ initial: {}, links: {} })).then((r) => !cancelled && setData(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, isStaff, clientId, leadId]);

  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker' };

  return (
    <div className="max-w-3xl">
      {isStaff && (
        <Link href="/dashboard/listings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft size={16} /> Listing opportunities
        </Link>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{isStaff ? 'Onboard a listing opportunity' : 'Refer a seller'}</h1>
      <p className="mt-1 mb-6 text-gray-600">
        {isStaff
          ? 'Capture the owner, the property and why they might sell. It goes straight into your pipeline with a first follow-up.'
          : 'Know someone thinking about selling? Tell us about them and our team will take it from here.'}
      </p>
      {!data ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <ListingOnboardingForm mode={isStaff ? 'staff' : 'referral'} initial={data.initial} links={data.links} author={author} />
      )}
    </div>
  );
}

export default function NewListingOpportunityPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
      <NewListingOpportunity />
    </Suspense>
  );
}

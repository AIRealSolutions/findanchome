import Link from 'next/link';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';
import ConsultationForm from './ConsultationForm';
import { BROKERAGE } from '@/lib/site';
import type { ConsultationContext } from '@/lib/consultation';

/** Full-width "request a consultation" section with the form embedded. Used near the bottom of guide pages. */
export default function ConsultationCTA({
  title = 'Request a Free Consultation',
  text = 'Tell us what you are looking for and where. We will put together homes, neighborhoods and a plan that fit your goals.',
  context,
  id = 'consultation',
}: {
  title?: string;
  text?: string;
  context?: ConsultationContext;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 bg-gradient-to-br from-[#1e3a8a] via-[#0c4a6e] to-[#0ea5e9]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 max-w-6xl mx-auto items-start">
          <div className="text-white">
            <CalendarCheck className="text-[#fbbf24] mb-4" size={40} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-lg opacity-95 mb-6">{text}</p>
            <ul className="space-y-2 mb-8 opacity-95">
              <li>✓ Local guidance from {BROKERAGE.agent}, {BROKERAGE.name}</li>
              <li>✓ Neighborhood, builder and golf community comparisons</li>
              <li>✓ Flood zone, insurance and HOA insight before you buy</li>
              <li>✓ No cost and no obligation</li>
            </ul>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <a href={`tel:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-2 font-bold hover:text-[#fbbf24]">
                <Phone size={18} /> Call {BROKERAGE.phone}
              </a>
              <a href={`sms:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-2 font-bold hover:text-[#fbbf24]">
                <MessageCircle size={18} /> Text {BROKERAGE.phone}
              </a>
              <Link href="/search" className="inline-flex items-center gap-2 font-bold hover:text-[#fbbf24]">
                Browse homes for sale →
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <ConsultationForm context={context} />
          </div>
        </div>
      </div>
    </section>
  );
}

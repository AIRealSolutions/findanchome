import Link from 'next/link';
import { Phone, MessageCircle, ArrowRight, Check } from 'lucide-react';
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
  const points = [
    `Local guidance from ${BROKERAGE.agent}, ${BROKERAGE.name}`,
    'Neighborhood, builder and golf community comparisons',
    'Flood zone, insurance and HOA insight before you buy',
    'No cost and no obligation',
  ];

  return (
    <section id={id} className="scroll-mt-24 relative overflow-hidden bg-navy py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-harbor/40 blur-3xl"
      />
      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 max-w-6xl mx-auto items-start">
          <div className="text-white">
            <div className="eyebrow text-brass">Free consultation</div>
            <h2 className="mt-4 text-3xl md:text-[44px] font-semibold tracking-tight leading-[1.08]">{title}</h2>
            <p className="mt-5 text-lg text-white/70 leading-relaxed">{text}</p>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-white/85">
                  <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-brass/15 text-brass shrink-0">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row lg:flex-col gap-4 text-sm">
              <a href={`tel:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-2.5 font-medium hover:text-brass-light transition-colors">
                <Phone size={17} className="text-brass" /> Call {BROKERAGE.phone}
              </a>
              <a href={`sms:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-2.5 font-medium hover:text-brass-light transition-colors">
                <MessageCircle size={17} className="text-brass" /> Text {BROKERAGE.phone}
              </a>
              <Link href="/search" className="inline-flex items-center gap-2.5 font-medium hover:text-brass-light transition-colors">
                <ArrowRight size={17} className="text-brass" /> Browse homes for sale
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-6 md:p-10">
            <ConsultationForm context={context} />
          </div>
        </div>
      </div>
    </section>
  );
}

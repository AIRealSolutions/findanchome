'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CalendarCheck, X } from 'lucide-react';
import ConsultationForm from './ConsultationForm';
import type { ConsultationContext } from '@/lib/consultation';

const EVENT = 'open-consultation';

/** Open the consultation pop-up from anywhere, optionally pre-selecting interests. */
export function openConsultation(context?: ConsultationContext) {
  window.dispatchEvent(new CustomEvent<ConsultationContext | undefined>(EVENT, { detail: context }));
}

/** A button that opens the consultation pop-up. */
export function ConsultationButton({
  context,
  className,
  children,
}: {
  context?: ConsultationContext;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => openConsultation(context)} className={className}>
      {children}
    </button>
  );
}

// No floating button in the back office, auth screens, or the contact page (which has the form inline).
const HIDDEN_PREFIXES = ['/admin', '/dashboard', '/crm', '/auth', '/login', '/debug', '/contact'];

/** Site-wide floating "Free Consultation" button and pop-up form. Mounted once in the root layout. */
export default function ConsultationLauncher() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<ConsultationContext | undefined>();
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setContext((e as CustomEvent<ConsultationContext | undefined>).detail);
      setFormKey((k) => k + 1);
      setOpen(true);
    };
    window.addEventListener(EVENT, onOpen);
    return () => window.removeEventListener(EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {!hidden && !open && (
        <button
          type="button"
          onClick={() => openConsultation()}
          className="fixed z-40 bottom-4 right-4 inline-flex items-center gap-2 bg-[#fbbf24] text-[#1e3a8a] px-5 py-3 rounded-full shadow-lg hover:bg-[#fcd34d] font-bold"
        >
          <CalendarCheck size={20} /> Free Consultation
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-dialog-title"
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b bg-white">
              <h2 id="consultation-dialog-title" className="text-xl font-bold text-[#1e3a8a]">Request a Free Consultation</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <ConsultationForm key={formKey} context={context} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

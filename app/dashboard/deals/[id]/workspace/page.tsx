'use client';

import { useParams } from 'next/navigation';
import DealWorkspace from '@/components/DealWorkspace';

export default function DealWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  return <DealWorkspace dealId={id} />;
}

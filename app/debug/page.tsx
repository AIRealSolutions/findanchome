import { notFound } from 'next/navigation';

// The old diagnostics page showed connection details to anyone. The URL now answers "not found".
export default function DebugPage() {
  notFound();
}

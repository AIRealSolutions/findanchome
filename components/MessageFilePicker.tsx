'use client';

import { Paperclip } from 'lucide-react';
import { MAX_FILE_BYTES } from '@/lib/messages';

/** Pick documents and photos to send with a message. */
export function FilePicker({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  const tooBig = files.filter((f) => f.size > MAX_FILE_BYTES);
  return (
    <div className="text-sm">
      <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <Paperclip size={16} /> Attach documents or photos
        <input type="file" multiple className="sr-only" onChange={(e) => { onChange([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ''; }} />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}:${i}`} className="flex items-center gap-2 text-gray-700">
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} className="text-xs text-gray-500 hover:text-red-600">remove</button>
            </li>
          ))}
        </ul>
      )}
      {tooBig.length > 0 && <p className="mt-1 text-red-600">Files must be 25 MB or smaller: {tooBig.map((f) => f.name).join(', ')}</p>}
    </div>
  );
}

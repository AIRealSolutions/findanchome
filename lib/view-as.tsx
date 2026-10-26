'use client';

// Lets the admin look at the broker and client dashboards ("View as"). It only changes which navigation and
// home screen the dashboard shows; the database still treats them as an admin.

import { createContext, useContext, useState } from 'react';
import { useAuth } from './auth-context';

export type ViewRole = 'admin' | 'broker' | 'client';

const ViewAsContext = createContext<{ viewAs: ViewRole; canSwitch: boolean; setViewAs: (r: ViewRole) => void }>({
  viewAs: 'client', canSwitch: false, setViewAs: () => {},
});

const KEY = 'dashboard-view-as';

export function ViewAsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [override, setOverride] = useState<ViewRole | null>(() => {
    try {
      return (sessionStorage.getItem(KEY) as ViewRole | null) ?? null;
    } catch {
      return null;
    }
  });
  const canSwitch = profile?.role === 'admin';
  const viewAs: ViewRole = canSwitch ? override ?? 'admin' : (profile?.role ?? 'client');
  const setViewAs = (r: ViewRole) => {
    setOverride(r);
    try {
      sessionStorage.setItem(KEY, r);
    } catch {}
  };
  return <ViewAsContext.Provider value={{ viewAs, canSwitch, setViewAs }}>{children}</ViewAsContext.Provider>;
}

export const useViewAs = () => useContext(ViewAsContext);

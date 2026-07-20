import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthUser } from '@/lib/services/auth';

export function useAuth(requiredRole?: 'admin' | 'broker') {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await authService.getCurrentUser();

        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }

        setUser(currentUser);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router, requiredRole]);

  return { user, loading, error };
}

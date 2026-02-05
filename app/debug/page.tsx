'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        envVars: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
        },
        supabaseInit: 'Not attempted',
      };

      // Try to initialize Supabase
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const client = createClient();
        results.supabaseInit = 'SUCCESS';
        
        // Try to ping Supabase
        try {
          const { data, error } = await client.from('fanc_user_profiles').select('count').limit(1);
          if (error) {
            results.supabaseConnection = `Error: ${error.message}`;
          } else {
            results.supabaseConnection = 'SUCCESS';
          }
        } catch (err: any) {
          results.supabaseConnection = `Error: ${err.message}`;
        }
      } catch (err: any) {
        results.supabaseInit = `FAILED: ${err.message}`;
        setError(err.message);
      }

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Critical Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className={diagnostics.envVars?.supabaseUrl === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                {diagnostics.envVars?.supabaseUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className={diagnostics.envVars?.supabaseKey === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                {diagnostics.envVars?.supabaseKey}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Initialization</h2>
          <div className="font-mono text-sm">
            <p className={diagnostics.supabaseInit === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
              {diagnostics.supabaseInit}
            </p>
          </div>
        </div>

        {diagnostics.supabaseConnection && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
            <div className="font-mono text-sm">
              <p className={diagnostics.supabaseConnection === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.supabaseConnection}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Full Diagnostics (JSON)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

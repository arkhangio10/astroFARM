'use client';

import { useEffect, useState } from 'react';

export default function TestDirectPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDirect = async () => {
      try {
        // Test directo sin usar el cliente de Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Variables de entorno no configuradas');
        }

        // 1. Test de autenticación
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        const authData = await authResponse.json();
        setResults(prev => ({
          ...prev,
          authStatus: authResponse.status,
          authData: JSON.stringify(authData, null, 2)
        }));

        // 2. Test directo a la API de seeds
        const seedsResponse = await fetch(`${supabaseUrl}/rest/v1/seeds?select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        });

        const seedsText = await seedsResponse.text();
        let seedsData;
        try {
          seedsData = JSON.parse(seedsText);
        } catch {
          seedsData = seedsText;
        }

        setResults(prev => ({
          ...prev,
          seedsStatus: seedsResponse.status,
          seedsStatusText: seedsResponse.statusText,
          seedsData: typeof seedsData === 'object' ? JSON.stringify(seedsData, null, 2) : seedsData
        }));

        // 3. Test con el cliente de Supabase recién creado
        const { createClient } = await import('@supabase/supabase-js');
        const freshClient = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });

        const { data: freshSeeds, error: freshError } = await freshClient
          .from('seeds')
          .select('*');

        setResults(prev => ({
          ...prev,
          freshClientResult: freshError ? `Error: ${freshError.message}` : `Success: ${freshSeeds?.length} seeds`
        }));

        // 4. Verificar headers y tokens
        const { data: { session } } = await freshClient.auth.getSession();
        setResults(prev => ({
          ...prev,
          sessionInfo: session ? `Session exists: ${session.user?.id}` : 'No session',
          accessToken: session?.access_token ? 'Token present' : 'No token'
        }));

      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          error: error.message
        }));
      } finally {
        setLoading(false);
      }
    };

    testDirect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔬 Test Directo de API</h1>
        
        {loading ? (
          <p className="text-xl">Ejecutando pruebas directas...</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold text-lg mb-2">{key}:</h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap text-gray-300">
                  {String(value)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500 rounded">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">📝 Notas:</h3>
          <ul className="list-disc list-inside text-yellow-300 space-y-1 text-sm">
            <li>Status 403 = Problema de permisos (RLS)</li>
            <li>Status 401 = Problema de autenticación</li>
            <li>Status 200 = Éxito</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

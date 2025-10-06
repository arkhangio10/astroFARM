'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestRLSPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testRLS = async () => {
      try {
        // 1. Check authentication status
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        setResults(prev => ({
          ...prev,
          auth: user ? `✅ Authenticated as ${user.id}` : '❌ Not authenticated',
          authError: authError?.message
        }));

        // 2. Get session info
        const { data: { session } } = await supabase.auth.getSession();
        setResults(prev => ({
          ...prev,
          session: session ? '✅ Session active' : '❌ No session',
          role: session?.user?.role || 'unknown'
        }));

        // 3. Try anonymous sign in if not authenticated
        if (!user) {
          const { data, error } = await supabase.auth.signInAnonymously();
          setResults(prev => ({
            ...prev,
            anonSignIn: error ? `❌ ${error.message}` : '✅ Anonymous sign-in successful'
          }));
        }

        // 4. Test table access
        const { data: seedsData, error: seedsError, count } = await supabase
          .from('seeds')
          .select('*', { count: 'exact' });
          
        setResults(prev => ({
          ...prev,
          seedsAccess: seedsError ? `❌ ${seedsError.message}` : `✅ Can read seeds (${count || 0} found)`,
        }));

        // 5. Test player creation
        if (user) {
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('anon_id', user.id)
            .single();
            
          if (playerError && playerError.code === 'PGRST116') {
            // No player exists, try to create one
            const { data: newPlayer, error: createError } = await supabase
              .from('players')
              .insert({ anon_id: user.id, alias: 'Test Player' })
              .select()
              .single();
              
            setResults(prev => ({
              ...prev,
              playerAccess: createError ? `❌ Cannot create player: ${createError.message}` : '✅ Player created successfully'
            }));
          } else {
            setResults(prev => ({
              ...prev,
              playerAccess: playerError ? `❌ ${playerError.message}` : '✅ Player exists'
            }));
          }
        }

        // 6. Test auth debug function
        const { data: authDebug, error: authDebugError } = await supabase
          .rpc('auth_debug');
          
        if (authDebug && authDebug[0]) {
          setResults(prev => ({
            ...prev,
            authDebug: `Role: ${authDebug[0].current_role}, Authenticated: ${authDebug[0].is_authenticated}`
          }));
        }

        // 7. Check Supabase client configuration
        setResults(prev => ({
          ...prev,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ URL configured' : '❌ URL missing',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Anon key configured' : '❌ Anon key missing'
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

    testRLS();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Test de RLS y Autenticación</h1>
        
        {loading ? (
          <p className="text-xl">Cargando pruebas...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-800 rounded">
                  <span className="font-semibold">{key}:</span>
                  <div className={`mt-1 ${String(value).includes('✅') ? 'text-green-400' : String(value).includes('❌') ? 'text-red-400' : 'text-gray-300'}`}>
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500 rounded">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">🛠️ Soluciones Rápidas:</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow-300">Si ves "permission denied":</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
                    <li>Ve a Supabase Dashboard → SQL Editor</li>
                    <li>Ejecuta: <code className="bg-gray-700 px-2 py-1 rounded">ALTER TABLE seeds DISABLE ROW LEVEL SECURITY;</code></li>
                    <li>Repite para cada tabla que necesites</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-yellow-300">Si ves "Anonymous sign-ins are disabled":</h4>
                  <p className="text-sm mt-2">
                    Dashboard → Authentication → Providers → Enable Anonymous Sign-Ins
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              Ejecutar pruebas nuevamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}

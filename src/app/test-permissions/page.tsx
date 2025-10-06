'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPermissionsPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testPermissions = async () => {
      try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setResults(prev => ({ ...prev, userId: user?.id || 'No user' }));

        // 2. Test raw SQL query
        const { data: sqlTest, error: sqlError } = await supabase
          .rpc('test_permissions', {})
          .single();

        if (sqlError && sqlError.code === 'PGRST202') {
          // Function doesn't exist, create it
          const { error: createError } = await supabase.rpc('query', {
            query: `
              CREATE OR REPLACE FUNCTION test_permissions()
              RETURNS json
              LANGUAGE sql
              SECURITY DEFINER
              AS $$
                SELECT json_build_object(
                  'current_user', current_user,
                  'session_user', session_user,
                  'can_select_seeds', EXISTS(
                    SELECT 1 FROM information_schema.table_privileges
                    WHERE table_name = 'seeds' 
                    AND privilege_type = 'SELECT'
                    AND grantee = current_user
                  )
                );
              $$;
            `
          });

          if (!createError) {
            const { data: retryData } = await supabase
              .rpc('test_permissions', {})
              .single();
            setResults(prev => ({ ...prev, permissions: retryData }));
          }
        } else if (!sqlError) {
          setResults(prev => ({ ...prev, permissions: sqlTest }));
        }

        // 3. Test different approaches
        const tests = [
          {
            name: 'Direct Select',
            fn: () => supabase.from('seeds').select('count()', { count: 'exact', head: true })
          },
          {
            name: 'Select with limit',
            fn: () => supabase.from('seeds').select('id').limit(1)
          },
          {
            name: 'RPC wrapper',
            fn: async () => {
              // Try to create a wrapper function
              await supabase.rpc('query', {
                query: `
                  CREATE OR REPLACE FUNCTION get_seeds_count()
                  RETURNS bigint
                  LANGUAGE sql
                  SECURITY DEFINER
                  AS $$
                    SELECT COUNT(*) FROM seeds;
                  $$;
                `
              }).then(() => supabase.rpc('get_seeds_count', {}));
            }
          }
        ];

        for (const test of tests) {
          try {
            const { data, error } = await test.fn();
            setResults(prev => ({
              ...prev,
              [test.name]: error ? `❌ ${error.message}` : `✅ Success: ${JSON.stringify(data)}`
            }));
          } catch (err: any) {
            setResults(prev => ({
              ...prev,
              [test.name]: `❌ ${err.message}`
            }));
          }
        }

        // 4. Check authentication method
        const { data: { session } } = await supabase.auth.getSession();
        setResults(prev => ({
          ...prev,
          authMethod: session?.user?.aud || 'unknown',
          role: session?.user?.role || 'unknown'
        }));

      } catch (error: any) {
        setResults(prev => ({ ...prev, error: error.message }));
      } finally {
        setLoading(false);
      }
    };

    testPermissions();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔓 Test de Permisos</h1>
        
        {loading ? (
          <p className="text-xl">Probando permisos...</p>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-800 rounded">
                  <span className="font-semibold">{key}:</span>
                  <div className={`mt-1 text-sm ${
                    String(value).includes('✅') ? 'text-green-400' : 
                    String(value).includes('❌') ? 'text-red-400' : 
                    'text-gray-300'
                  }`}>
                    <pre className="whitespace-pre-wrap">{
                      typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
                    }</pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-purple-900/20 border border-purple-500 rounded">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">🚨 Solución de emergencia:</h3>
              <p className="text-purple-300 text-sm mb-2">
                Si nada funciona, ejecuta este SQL en Supabase:
              </p>
              <pre className="p-2 bg-black/50 rounded text-xs overflow-x-auto text-purple-300">
{`-- Dar permisos COMPLETOS (solo para desarrollo)
GRANT ALL PRIVILEGES ON SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;`}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

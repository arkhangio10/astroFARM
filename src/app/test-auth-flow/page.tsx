'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestAuthFlowPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAuthFlow = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // 1. Crear un cliente nuevo
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });

        // 2. Intentar obtener sesión actual
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        setResults(prev => ({
          ...prev,
          currentSession: currentSession ? 'Session exists' : 'No session',
          sessionError: sessionError?.message
        }));

        // 3. Si no hay sesión, autenticar anónimamente
        if (!currentSession) {
          const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
          setResults(prev => ({
            ...prev,
            anonymousAuth: authError ? `Error: ${authError.message}` : 'Success',
            userId: authData?.user?.id,
            authError: authError?.message
          }));

          // Esperar un momento para que la sesión se establezca
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 4. Obtener la sesión después de autenticar
        const { data: { session: newSession } } = await supabase.auth.getSession();
        const accessToken = newSession?.access_token;

        setResults(prev => ({
          ...prev,
          hasToken: !!accessToken,
          tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'No token'
        }));

        // 5. Probar acceso a seeds CON autenticación
        const { data: seeds, error: seedsError } = await supabase
          .from('seeds')
          .select('*');

        setResults(prev => ({
          ...prev,
          seedsAccess: seedsError ? `Error: ${seedsError.message}` : `Success: ${seeds?.length} seeds`
        }));

        // 6. Probar acceso directo a la API con el token correcto
        if (accessToken) {
          const directResponse = await fetch(`${supabaseUrl}/rest/v1/seeds?select=*`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          const directData = await directResponse.json();
          setResults(prev => ({
            ...prev,
            directApiStatus: directResponse.status,
            directApiResult: directResponse.ok ? `Success: ${directData.length} seeds` : `Error: ${JSON.stringify(directData)}`
          }));
        }

        // 7. Probar creación de player
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: player, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('anon_id', user.id)
            .maybeSingle();

          if (!player && !playerError) {
            const { data: newPlayer, error: createError } = await supabase
              .from('players')
              .insert({ anon_id: user.id, alias: 'Test Player' })
              .select()
              .single();

            setResults(prev => ({
              ...prev,
              playerCreation: createError ? `Error: ${createError.message}` : 'Player created successfully'
            }));
          } else {
            setResults(prev => ({
              ...prev,
              playerStatus: playerError ? `Error: ${playerError.message}` : 'Player exists'
            }));
          }
        }

      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          generalError: error.message
        }));
      } finally {
        setLoading(false);
      }
    };

    testAuthFlow();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔐 Test de Flujo de Autenticación</h1>
        
        {loading ? (
          <p className="text-xl">Ejecutando pruebas de autenticación...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-800 rounded">
                  <span className="font-semibold">{key}:</span>
                  <div className={`mt-1 text-sm ${
                    String(value).includes('Success') ? 'text-green-400' : 
                    String(value).includes('Error') ? 'text-red-400' : 
                    'text-gray-300'
                  }`}>
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-500 rounded">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 Explicación:</h3>
                <p className="text-blue-300 text-sm">
                  Este test muestra el flujo correcto de autenticación:
                </p>
                <ol className="list-decimal list-inside text-blue-300 text-sm mt-2 space-y-1">
                  <li>Inicializar cliente con API key</li>
                  <li>Autenticar (anónimamente en este caso)</li>
                  <li>Obtener token JWT de la sesión</li>
                  <li>Usar el token JWT para las llamadas a la API</li>
                </ol>
              </div>

              {String(results.seedsAccess || '').includes('Error') && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Si sigues viendo errores:</h3>
                  <p className="text-red-300 text-sm">
                    Ejecuta este SQL en Supabase para asegurarte de que RLS esté deshabilitado:
                  </p>
                  <pre className="mt-2 p-2 bg-black/50 rounded text-xs overflow-x-auto">
{`ALTER TABLE seeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_states DISABLE ROW LEVEL SECURITY;`}
                  </pre>
                </div>
              )}
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

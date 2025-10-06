'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestDBPage() {
  const [status, setStatus] = useState<string>('Probando conexión...');
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check Supabase connection
        setStatus('Verificando conexión con Supabase...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          // Try anonymous auth
          setStatus('Intentando autenticación anónima...');
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
          
          if (anonError) {
            throw new Error(`Error de autenticación: ${anonError.message}`);
          }
          
          setResults(prev => ({ ...prev, auth: 'Autenticado anónimamente', userId: anonData.user?.id }));
        } else {
          setResults(prev => ({ ...prev, auth: 'Usuario autenticado', userId: user?.id }));
        }

        // Test 2: Check tables exist
        setStatus('Verificando tablas...');
        const { data: tables, error: tablesError } = await supabase
          .from('players')
          .select('*')
          .limit(1);

        if (tablesError) {
          throw new Error(`Error al acceder a las tablas: ${tablesError.message}`);
        }

        setResults(prev => ({ ...prev, tables: 'Tablas accesibles' }));

        // Test 3: Try to insert a test player
        setStatus('Probando inserción de datos...');
        const testPlayerId = `test_${Date.now()}`;
        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .insert({
            anon_id: testPlayerId,
            alias: 'Test Player'
          })
          .select()
          .single();

        if (insertError) {
          setResults(prev => ({ ...prev, insert: `Error: ${insertError.message}` }));
        } else {
          setResults(prev => ({ ...prev, insert: 'Inserción exitosa', playerId: newPlayer.id }));
          
          // Clean up test data
          await supabase.from('players').delete().eq('id', newPlayer.id);
        }

        // Test 4: Check seeds
        const { data: seeds, error: seedsError } = await supabase
          .from('seeds')
          .select('*');

        if (seedsError) {
          setResults(prev => ({ ...prev, seeds: `Error: ${seedsError.message}` }));
        } else {
          setResults(prev => ({ ...prev, seeds: `${seeds.length} seeds encontrados` }));
        }

        setStatus('¡Todas las pruebas completadas!');

      } catch (err: any) {
        setError(err.message);
        setStatus('Error en las pruebas');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test de Conexión a Base de Datos</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Estado:</h2>
          <p className={`text-lg ${error ? 'text-red-500' : 'text-green-500'}`}>
            {status}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Error:</h3>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Resultados de las pruebas:</h2>
          <div className="space-y-2">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="flex justify-between p-3 bg-gray-800 rounded">
                <span className="font-medium">{key}:</span>
                <span className="text-green-400">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500 rounded">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">⚠️ Importante:</h3>
          <ul className="list-disc list-inside text-blue-300 space-y-1">
            <li>Asegúrate de tener las variables de entorno configuradas en .env.local</li>
            <li>La autenticación anónima debe estar habilitada en Supabase</li>
            <li>Las migraciones deben estar ejecutadas</li>
          </ul>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          >
            Ejecutar pruebas nuevamente
          </button>
        </div>
      </div>
    </div>
  );
}

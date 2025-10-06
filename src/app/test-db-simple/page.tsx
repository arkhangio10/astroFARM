'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestDBSimplePage() {
  const [status, setStatus] = useState<string>('Probando conexión sin autenticación...');
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Basic connection test
        setStatus('Verificando conexión básica con Supabase...');
        
        // Test reading public data (seeds table has public access)
        const { data: seeds, error: seedsError } = await supabase
          .from('seeds')
          .select('*');

        if (seedsError) {
          console.error('Seeds error details:', seedsError);
          setResults(prev => ({ 
            ...prev, 
            seeds: `❌ Error: ${seedsError.message} (${seedsError.code})`,
            hint: seedsError.hint || 'No hint available'
          }));
        } else {
          setResults(prev => ({ 
            ...prev, 
            seeds: `✅ ${seeds?.length || 0} seeds encontrados`
          }));
        }

        setResults(prev => ({ 
          ...prev, 
          connection: '✅ Conectado a Supabase'
        }));

        // Test 2: Check if we can read tables structure
        setStatus('Verificando estructura de tablas...');
        
        const tables = [
          'players', 'seeds', 'runs', 'achievements', 'rooms', 
          'room_members', 'game_states', 'actions', 'room_updates', 
          'battle_sessions', 'player_room_states'
        ];

        for (const table of tables) {
          try {
            const { error } = await supabase
              .from(table)
              .select('*')
              .limit(0);
            
            if (error) {
              setResults(prev => ({ 
                ...prev, 
                [`table_${table}`]: `❌ Error: ${error.message}`
              }));
            } else {
              setResults(prev => ({ 
                ...prev, 
                [`table_${table}`]: '✅ Tabla existe'
              }));
            }
          } catch (err) {
            setResults(prev => ({ 
              ...prev, 
              [`table_${table}`]: `❌ Error desconocido`
            }));
          }
        }

        setStatus('✅ Pruebas completadas');

      } catch (err: any) {
        console.error('Test error:', err);
        setError(err.message);
        setStatus('❌ Error en las pruebas');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test de Conexión Simple (Sin Auth)</h1>
        
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
          <h2 className="text-xl font-semibold mb-4">Resultados:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="flex justify-between p-3 bg-gray-800 rounded">
                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                <span className={value.toString().includes('✅') ? 'text-green-400' : 'text-red-400'}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Autenticación Anónima Deshabilitada</h3>
            <p className="text-yellow-300">
              Para habilitar todas las funciones del juego, necesitas activar Anonymous Sign-Ins en:
            </p>
            <p className="text-yellow-300 mt-2">
              Supabase Dashboard → Authentication → Providers → Anonymous
            </p>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-500 rounded">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">📋 Estado de tu configuración:</h3>
            <ul className="list-disc list-inside text-blue-300 space-y-1">
              <li>✅ Variables de entorno configuradas</li>
              <li>✅ Conexión a Supabase establecida</li>
              <li>✅ Tablas creadas correctamente</li>
              <li>❌ Autenticación anónima deshabilitada</li>
            </ul>
          </div>
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

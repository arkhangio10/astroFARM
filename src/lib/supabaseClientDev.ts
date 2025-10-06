// ADVERTENCIA: SOLO PARA DESARROLLO LOCAL
// NUNCA uses service_role key en producción o en el cliente

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente que bypasea TODAS las reglas de seguridad
export const supabaseDevClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Función helper para desarrollo
export async function testDatabaseAccess() {
  try {
    const { data: seeds, error } = await supabaseDevClient
      .from('seeds')
      .select('*');
    
    console.log('Seeds access with service role:', { 
      success: !error, 
      count: seeds?.length,
      error: error?.message 
    });
    
    return { seeds, error };
  } catch (err) {
    console.error('Database test failed:', err);
    return { seeds: null, error: err };
  }
}

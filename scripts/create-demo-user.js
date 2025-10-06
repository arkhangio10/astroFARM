// Script para crear usuario demo en Supabase
// Ejecutar con: node scripts/create-demo-user.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Falta configurar las variables de entorno en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDemoUser() {
  try {
    console.log('🚀 Creando usuario demo...');
    
    // Crear usuario usando Admin API
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: 'astrofarm@soinar.com',
      password: 'metrica10',
      email_confirm: true
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ El usuario ya existe');
        
        // Obtener el usuario existente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === 'astrofarm@soinar.com');
        
        if (existingUser) {
          console.log('✅ Usuario encontrado:', existingUser.id);
          await createPlayerForUser(existingUser.id);
        }
      } else {
        throw error;
      }
    } else if (user) {
      console.log('✅ Usuario creado:', user.id);
      await createPlayerForUser(user.id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function createPlayerForUser(userId) {
  try {
    // Verificar si ya existe un player
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('anon_id', userId)
      .single();
    
    if (existingPlayer) {
      console.log('✅ Player ya existe:', existingPlayer.id);
      return;
    }
    
    // Crear player
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        anon_id: userId,
        alias: 'AstroFarm Demo'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Player creado:', player.id);
  } catch (error) {
    console.error('❌ Error creando player:', error.message);
  }
}

createDemoUser();

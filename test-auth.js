import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhjpobxiajosghfqpfjc.supabase.co';
const supabaseAnonKey = 'sb_publishable_fNsB7rAASg8XGb6STDcuVw_iSiLlM_x';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'password123'
  });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  console.log('Login successful. Session exists:', !!data.session);
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
    
  if (profileError) {
    console.error('Profile fetch error:', profileError);
  } else {
    console.log('Profile fetched:', profile);
  }
}

testAuth();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signUp() {
    const { data, error } = await supabase.auth.signUp({
        email: 'matheus.stanley12@gmail.com',
        password: '35215415',
    });

    if (error) {
        console.error('Erro ao cadastrar:', error.message);
    } else {
        console.log('Usuário cadastrado com sucesso!', data);
    }
}

signUp();

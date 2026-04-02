import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Checking tables ---');
    
    const { data: d1, error: e1 } = await supabase.from('databook_folders').select('id').limit(1);
    if (e1) {
        console.error('databook_folders error:', e1.message);
    } else {
        console.log('databook_folders exists.');
    }

    const { data: d2, error: e2 } = await supabase.from('photo_folders').select('id').limit(1);
    if (e2) {
        console.error('photo_folders error:', e2.message);
    } else {
        console.log('photo_folders exists.');
    }

    const { data: d3, error: e3 } = await supabase.from('peritagens').select('id, numero_peritagem, status').eq('numero_peritagem', '123').maybeSingle();
    if (d3) {
        console.log(`Found peritagem 123: status=${d3.status}`);
    } else {
        console.log('Peritagem 123 not found.');
    }
}

check();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Listing all peritagens (max 5) ---');
    const { data: p, error: pe } = await supabase.from('peritagens').select('id, os_interna, cliente, status').limit(5);
    if (pe) console.error(pe.message);
    if (p) {
        p.forEach(x => console.log(`Peritagem: OS=${x.os_interna}, Cliente=${x.cliente}, Status=${x.status}`));
    }
}

check();

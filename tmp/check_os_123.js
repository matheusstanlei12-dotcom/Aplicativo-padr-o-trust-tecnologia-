import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Search By OS 123 ---');
    const { data: p, error: pe } = await supabase.from('peritagens').select('*').eq('os_interna', '123').maybeSingle();
    if (pe) console.error('Error fetching peritagem:', pe.message);
    if (p) {
        console.log(`Found peritagem ${p.os_interna}: status=${p.status}, cliente=${p.cliente}`);
    } else {
        console.log('Peritagem with OS 123 not found.');
    }

    const { data: f, error: fe } = await supabase.from('photo_folders').select('*').eq('os_interna', '123').maybeSingle();
    if (fe) console.error('Error fetching photo_folder:', fe.message);
    if (f) {
        console.log(`Found photo_folder ${f.os_interna}: id=${f.id}`);
    } else {
        console.log('Photo Folder with OS 123 not found.');
    }
}

check();

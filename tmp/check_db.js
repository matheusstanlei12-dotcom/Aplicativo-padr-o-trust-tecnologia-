const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking databook_folders...');
    const { data, error } = await supabase.from('databook_folders').select('id').limit(1);
    if (error) {
        console.error('Error with databook_folders:', error);
    } else {
        console.log('databook_folders exists and is accessible.');
    }

    console.log('Checking alternative peritagens_databook...');
     const { data: d2, error: e2 } = await supabase.from('peritagens_databook').select('id').limit(1);
     if (e2) {
         console.error('Error with peritagens_databook:', e2);
     } else {
         console.log('peritagens_databook exists!');
     }
}

check();

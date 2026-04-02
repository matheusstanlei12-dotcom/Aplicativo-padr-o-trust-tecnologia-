const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking photo_folders for OS 123...');
    const { data, error } = await supabase.from('photo_folders').select('*').eq('os_interna', '123').maybeSingle();
    if (error) {
        console.error('Error with photo_folders:', error);
    } else if (data) {
        console.log('Found folder for OS 123 in photo_folders:', data.id);
        const { count } = await supabase.from('photo_items').select('id', { count: 'exact', head: true }).eq('folder_id', data.id);
        console.log(`Folder has ${count} items.`);
    } else {
        console.log('No folder for OS 123 found in photo_folders.');
    }
}

check();

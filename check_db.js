
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('peritagens')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching peritagens:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in peritagens table:', Object.keys(data[0]));
    } else {
        console.log('No data in peritagens table to check columns.');
    }
}

checkColumns();

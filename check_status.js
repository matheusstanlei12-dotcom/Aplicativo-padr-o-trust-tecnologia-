
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnbmmflmunlhxcbqutoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_37e1Q6qQysLjJHQsOSheoQ_n0RARlWe';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatus() {
    const { count: peritagensCount, error: error1 } = await supabase
        .from('peritagens')
        .select('*', { count: 'exact', head: true });

    const { count: waitlistCount, error: error2 } = await supabase
        .from('aguardando_peritagem')
        .select('*', { count: 'exact', head: true });

    console.log('Peritagens count:', peritagensCount);
    console.log('Waitlist count:', waitlistCount);

    const { data: peritagens } = await supabase
        .from('peritagens')
        .select('id, cliente, status, etapa_atual, os_interna');
    
    console.log('Peritagens data:', peritagens);
}

checkStatus();

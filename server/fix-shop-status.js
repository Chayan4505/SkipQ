// Direct SQL to set shop to OPEN
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function fixShop() {
    console.log('🔧 Fixing shop status...\n');

    try {
        // Get all shops first
        const { data: allShops, error: fetchError } = await supabase
            .from('shops')
            .select('*');

        if (fetchError) {
            console.error('❌ Fetch Error:', fetchError);
            process.exit(1);
        }

        console.log(`Found ${allShops?.length || 0} shops:\n`);
        allShops?.forEach(shop => {
            console.log(`  - ${shop.name} (is_open: ${shop.is_open})`);
        });

        // Update using RPC or direct update
        console.log('\n🔄 Updating all shops to OPEN...\n');

        for (const shop of allShops || []) {
            const { data, error } = await supabase
                .from('shops')
                .update({ is_open: true })
                .eq('id', shop.id)
                .select();

            if (error) {
                console.error(`❌ Error updating ${shop.name}:`, error);
            } else {
                console.log(`✅ ${shop.name} → OPEN`);
            }
        }

        console.log('\n✅ Done! Refresh your browser.');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

fixShop();

// Script to set all shops to OPEN status
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function openAllShops() {
    console.log('🔧 Setting all shops to OPEN status...\n');

    try {
        // First, get all shops
        const { data: shops, error: fetchError } = await supabase
            .from('shops')
            .select('*');

        if (fetchError) {
            console.error('❌ Error fetching shops:', fetchError.message);
            process.exit(1);
        }

        if (!shops || shops.length === 0) {
            console.log('ℹ️  No shops found in database');
            return;
        }

        console.log(`📊 Found ${shops.length} shop(s)\n`);

        // Update each shop to be open
        for (const shop of shops) {
            const { error: updateError } = await supabase
                .from('shops')
                .update({ is_open: true })
                .eq('id', shop.id);

            if (updateError) {
                console.error(`❌ Error updating ${shop.name}:`, updateError.message);
            } else {
                console.log(`✅ ${shop.name} - Set to OPEN`);
            }
        }

        console.log('\n✅ Done! All shops are now OPEN.');
        console.log('\n👉 Refresh your browser to see the changes!');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

openAllShops();

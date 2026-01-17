// Fix shop coordinates to New Garia, Kolkata
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// New Garia, Kolkata coordinates
const NEW_GARIA_COORDS = {
    lat: 22.4697,  // New Garia, Kolkata
    lng: 88.3903
};

async function fixShopCoordinates() {
    try {
        console.log('🔄 Fixing shop coordinates to New Garia, Kolkata...\n');

        // Get all shops
        const { data: shops, error } = await supabase
            .from('shops')
            .select('*');

        if (error) throw error;

        console.log(`📊 Found ${shops.length} shops\n`);

        for (const shop of shops) {
            // Add small random offset (±0.005 degrees ≈ ±500m) for each shop
            const lat = NEW_GARIA_COORDS.lat + (Math.random() - 0.5) * 0.01;
            const lng = NEW_GARIA_COORDS.lng + (Math.random() - 0.5) * 0.01;

            const { error: updateError } = await supabase
                .from('shops')
                .update({
                    coordinates_lat: lat,
                    coordinates_lng: lng
                })
                .eq('id', shop.id);

            if (updateError) {
                console.error(`❌ Failed to update "${shop.name}":`, updateError.message);
            } else {
                console.log(`✅ Updated "${shop.name}"`);
                console.log(`   Location: New Garia, Kolkata (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
                console.log('');
            }
        }

        console.log('✅ All shops updated to New Garia, Kolkata!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixShopCoordinates();

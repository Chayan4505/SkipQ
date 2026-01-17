// Fix shop coordinates to actual New Garia location
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Correct New Garia coordinates (matching user's location)
const NEW_GARIA_CORRECT = {
    lat: 22.4743,  // New Garia, Kolkata (correct)
    lng: 88.4180   // New Garia, Kolkata (correct)
};

async function fixCoordinates() {
    try {
        console.log('🔄 Fixing shop coordinates to correct New Garia location...\n');
        console.log(`Using coordinates: ${NEW_GARIA_CORRECT.lat}, ${NEW_GARIA_CORRECT.lng}\n`);

        const { data: shops, error } = await supabase
            .from('shops')
            .select('*');

        if (error) throw error;

        for (const shop of shops) {
            // Add small random offset (±0.002 degrees ≈ ±200m)
            const lat = NEW_GARIA_CORRECT.lat + (Math.random() - 0.5) * 0.004;
            const lng = NEW_GARIA_CORRECT.lng + (Math.random() - 0.5) * 0.004;

            const { error: updateError } = await supabase
                .from('shops')
                .update({
                    coordinates_lat: lat,
                    coordinates_lng: lng
                })
                .eq('id', shop.id);

            if (updateError) {
                console.error(`❌ Failed: ${updateError.message}`);
            } else {
                console.log(`✅ ${shop.name}`);
                console.log(`   New coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                console.log('');
            }
        }

        console.log('✅ All shops updated to correct New Garia coordinates!\n');
        console.log('🔄 Refresh your browser to see distances of 0-2 km!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixCoordinates();

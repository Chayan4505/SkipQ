// Set shops to Hooghly/Sripur coordinates (matching their address)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Sripur, Hooghly coordinates (matching the address field)
const SRIPUR_COORDS = {
    lat: 22.7500,
    lng: 88.3500
};

async function fixToSripur() {
    try {
        console.log('🔄 Setting coordinates to Sripur, Hooghly (matching address)...\n');

        const { data: shops, error } = await supabase
            .from('shops')
            .select('*');

        if (error) throw error;

        for (const shop of shops) {
            const lat = SRIPUR_COORDS.lat + (Math.random() - 0.5) * 0.01;
            const lng = SRIPUR_COORDS.lng + (Math.random() - 0.5) * 0.01;

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
                console.log(`✅ ${shop.name} → Sripur, Hooghly (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
        }

        console.log('\n✅ All shops set to Sripur, Hooghly!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixToSripur();

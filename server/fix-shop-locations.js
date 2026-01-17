// Set specific shops to their correct real-world locations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Locations
const LOCATIONS = {
    SRIPUR: { lat: 22.7500, lng: 88.3500 },     // Sripur, Hooghly
    NEW_GARIA: { lat: 22.4697, lng: 88.3903 }   // New Garia, Kolkata
};

async function fixSpecificShops() {
    try {
        console.log('🔄 Correcting shop locations...\n');

        // 1. Move Kalimata Bhandar to Sripur
        await updateShopLocation('Kalimata Bhandar', LOCATIONS.SRIPUR);

        // 2. Ensure Mio Amor is in New Garia (so you have a nearby shop)
        await updateShopLocation('Mio Amor', LOCATIONS.NEW_GARIA);

        // 3. Ensure Binapani Groceries is in New Garia
        await updateShopLocation('Binapani Groceries', LOCATIONS.NEW_GARIA);

        console.log('\n✅ Shop locations corrected!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function updateShopLocation(shopName, baseCoords) {
    // Add small random offset
    const lat = baseCoords.lat + (Math.random() - 0.5) * 0.005;
    const lng = baseCoords.lng + (Math.random() - 0.5) * 0.005;

    // Search for shop by name (partial match)
    const { data: shops, error: searchError } = await supabase
        .from('shops')
        .select('*')
        .ilike('name', `%${shopName}%`);

    if (searchError) throw searchError;

    if (shops && shops.length > 0) {
        for (const shop of shops) {
            const { error: updateError } = await supabase
                .from('shops')
                .update({
                    coordinates_lat: lat,
                    coordinates_lng: lng
                })
                .eq('id', shop.id);

            if (updateError) {
                console.error(`❌ Failed to update ${shop.name}:`, updateError.message);
            } else {
                console.log(`✅ Moved "${shop.name}" to ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        }
    } else {
        console.log(`⚠️ Shop not found: ${shopName}`);
    }
}

fixSpecificShops();

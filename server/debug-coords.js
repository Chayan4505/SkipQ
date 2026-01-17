// Check shop coordinates in database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkCoordinates() {
    try {
        const { data: shops, error } = await supabase
            .from('shops')
            .select('*');

        if (error) throw error;

        console.log('\n📍 SHOP COORDINATES IN DATABASE:\n');
        console.log('New Garia, Kolkata should be around: 22.47°N, 88.39°E\n');

        shops.forEach((shop, i) => {
            console.log(`${i + 1}. ${shop.name}`);
            console.log(`   Lat: ${shop.coordinates_lat}`);
            console.log(`   Lng: ${shop.coordinates_lng}`);
            console.log(`   Address: ${shop.address}`);
            console.log(`   City: ${shop.city}`);

            // Check if coordinates match New Garia
            const lat = parseFloat(shop.coordinates_lat);
            const lng = parseFloat(shop.coordinates_lng);

            if (lat >= 22.45 && lat <= 22.50 && lng >= 88.37 && lng <= 88.41) {
                console.log(`   ✅ Coordinates match New Garia area`);
            } else {
                console.log(`   ❌ Coordinates DON'T match New Garia!`);
            }
            console.log('');
        });

        console.log('\n💡 If you\'re in New Garia and shops are in New Garia,');
        console.log('   distance should be 0-5 km, not 148 km!\n');
        console.log('🔍 Check browser console for your actual location coordinates.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCoordinates();

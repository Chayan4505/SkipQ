// View shop coordinates
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function viewShops() {
    try {
        const { data: shops, error } = await supabase
            .from('shops')
            .select('*');

        if (error) throw error;

        console.log('\n📍 SHOP LOCATIONS:\n');
        shops.forEach((shop, i) => {
            console.log(`${i + 1}. ${shop.name}`);
            console.log(`   Address: ${shop.address}`);
            console.log(`   City: ${shop.city}`);
            console.log(`   Coordinates: ${shop.coordinates_lat}, ${shop.coordinates_lng}`);
            console.log(`   → New Garia, Kolkata area`);
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

viewShops();

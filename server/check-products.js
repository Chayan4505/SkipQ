// Check products and their shop linkage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkProducts() {
    console.log('🔍 Checking products and shops...\n');

    try {
        // Get all shops
        const { data: shops } = await supabase
            .from('shops')
            .select('*');

        console.log('📊 SHOPS:');
        shops?.forEach(shop => {
            console.log(`  ID: ${shop.id}`);
            console.log(`  Name: ${shop.name}`);
            console.log(`  Open: ${shop.is_open}`);
            console.log(`  ---`);
        });

        // Get all products
        const { data: products } = await supabase
            .from('products')
            .select('*');

        console.log('\n📦 PRODUCTS:');
        products?.forEach(product => {
            console.log(`  ID: ${product.id}`);
            console.log(`  Name: ${product.name}`);
            console.log(`  Shop ID: ${product.shop_id}`);
            console.log(`  Price: ${product.price}`);
            console.log(`  Available: ${product.is_available}`);
            console.log(`  Stock: ${product.stock}`);
            console.log(`  ---`);
        });

        // Check if shop IDs match
        console.log('\n🔗 LINKAGE CHECK:');
        if (shops && products) {
            const shopIds = shops.map(s => s.id);
            products.forEach(p => {
                const linked = shopIds.includes(p.shop_id);
                console.log(`  ${p.name} → ${linked ? '✅ Linked' : '❌ NOT LINKED'}`);
            });
        }

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkProducts();

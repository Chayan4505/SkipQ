const fetch = require('node-fetch');

async function listShops() {
    try {
        const response = await fetch('http://localhost:5000/api/shops');
        const data = await response.json();

        console.log('\n=== ALL SHOPS IN DATABASE ===\n');
        data.shops.forEach((shop, index) => {
            console.log(`${index + 1}. ${shop.name}`);
            console.log(`   ID: ${shop._id}`);
            console.log(`   Owner: ${shop.ownerId}`);
            console.log(`   Category: ${shop.category}`);
            console.log(`   City: ${shop.city}`);
            console.log('');
        });
        console.log(`Total shops: ${data.shops.length}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listShops();

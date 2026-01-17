// Simple script to list and delete shops from MongoDB
// Run with: node delete-shops.js

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kirana:kirana123@cluster0.mongodb.net/kirana-flow?retryWrites=true&w=majority';

const shopSchema = new mongoose.Schema({
    ownerId: String,
    name: String,
    category: String,
    city: String,
    state: String,
}, { strict: false });

const Shop = mongoose.model('Shop', shopSchema);

async function listShops() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const shops = await Shop.find({});

        console.log('=== ALL SHOPS IN DATABASE ===\n');
        shops.forEach((shop, index) => {
            console.log(`${index + 1}. ${shop.name}`);
            console.log(`   ID: ${shop._id}`);
            console.log(`   Owner: ${shop.ownerId}`);
            console.log(`   Category: ${shop.category}`);
            console.log(`   City: ${shop.city}`);
            console.log('');
        });
        console.log(`Total shops: ${shops.length}\n`);

        console.log('To delete a shop, uncomment the deleteShop() line below and add the shop ID');
        console.log('Example: await deleteShop("69649f4dfa3195d73090fa27");\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

async function deleteShop(shopId) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const result = await Shop.findByIdAndDelete(shopId);

        if (result) {
            console.log(`✅ Deleted shop: ${result.name} (ID: ${shopId})`);
        } else {
            console.log(`❌ Shop not found with ID: ${shopId}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the list function
listShops();

// To delete a shop, uncomment this line and add the shop ID:
// deleteShop('PASTE_SHOP_ID_HERE');

// View all shops in the database
// Run with: node view-shops.js

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kirana:kirana123@cluster0.mongodb.net/kirana-flow?retryWrites=true&w=majority';

const shopSchema = new mongoose.Schema({}, { strict: false });
const Shop = mongoose.model('Shop', shopSchema);

async function viewShops() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!\n');

        const shops = await Shop.find({}).lean();

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║                    REGISTERED SHOPS IN DATABASE                 ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        if (shops.length === 0) {
            console.log('❌ No shops found in database\n');
        } else {
            shops.forEach((shop, index) => {
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📍 Shop #${index + 1}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`🏪 Name:        ${shop.name}`);
                console.log(`🆔 Shop ID:     ${shop._id}`);
                console.log(`👤 Owner ID:    ${shop.ownerId}`);
                console.log(`📂 Category:    ${shop.category || 'N/A'}`);
                console.log(`📞 Phone:       ${shop.phone || 'N/A'}`);
                console.log(`📍 Address:     ${shop.address || 'N/A'}`);
                console.log(`🏙️  City:        ${shop.city || 'N/A'}`);
                console.log(`🗺️  State:       ${shop.state || 'N/A'}`);
                console.log(`📮 Pincode:     ${shop.pincode || 'N/A'}`);
                console.log(`🖼️  Image:       ${shop.image || 'N/A'}`);
                console.log(`⏰ Created:     ${shop.createdAt || 'N/A'}`);
                console.log(`🔄 Updated:     ${shop.updatedAt || 'N/A'}`);
                console.log(`✅ Is Open:     ${shop.isOpen ? 'Yes' : 'No'}`);
                console.log('');
            });

            console.log(`\n📊 TOTAL SHOPS: ${shops.length}\n`);

            // Group by owner
            const ownerGroups = {};
            shops.forEach(shop => {
                if (!ownerGroups[shop.ownerId]) {
                    ownerGroups[shop.ownerId] = [];
                }
                ownerGroups[shop.ownerId].push(shop.name);
            });

            console.log('👥 SHOPS BY OWNER:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            Object.entries(ownerGroups).forEach(([ownerId, shopNames]) => {
                console.log(`Owner: ${ownerId}`);
                shopNames.forEach(name => console.log(`  - ${name}`));
                console.log('');
            });
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 TIP: Check your internet connection. MongoDB Atlas requires internet access.');
        }
        process.exit(1);
    }
}

viewShops();

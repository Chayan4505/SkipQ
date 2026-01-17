const mongoose = require('mongoose');

// Connect to the database
const MONGODB_URI = 'mongodb+srv://kirana:kirana123@cluster0.mongodb.net/kirana-flow?retryWrites=true&w=majority';

const shopSchema = new mongoose.Schema({
    ownerId: String,
    name: String,
    category: String,
    city: String,
    state: String,
    phone: String,
    createdAt: Date
}, { strict: false });

const Shop = mongoose.model('Shop', shopSchema);

async function findDuplicateShops() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🔍 Searching for duplicate shops by name...');

        // Aggregation pipeline to find duplicates
        const duplicates = await Shop.aggregate([
            {
                $group: {
                    _id: { name: "$name" }, // Group by name
                    uniqueIds: { $addToSet: "$_id" },
                    count: { $sum: 1 },
                    docs: { $push: "$$ROOT" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 } // Filter groups with more than 1 document
                }
            }
        ]);

        if (duplicates.length === 0) {
            console.log('✅ No properties with duplicate names found.');
        } else {
            console.log(`⚠️ Found ${duplicates.length} sets of duplicate shops:\n`);

            duplicates.forEach((group, index) => {
                console.log(`=== Group ${index + 1}: "${group._id.name}" (Count: ${group.count}) ===`);
                group.docs.forEach((doc, i) => {
                    console.log(`   ${i + 1}. ID: ${doc._id}`);
                    console.log(`      Phone: ${doc.phone || 'N/A'}`);
                    console.log(`      Owner: ${doc.ownerId}`);
                    console.log(`      Created: ${doc.createdAt || 'N/A'}`);
                    console.log('-----------------------------------');
                });
                console.log('');
            });

            console.log('💡 To delete duplicates, notice the ID of the shop you want to REMOVE.');
            console.log('   Then use the delete-shops.js script with that ID.');
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

findDuplicateShops();

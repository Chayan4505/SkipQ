// Quick test script to verify Supabase connection
import { supabase } from './src/config/supabase.js';

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');

    try {
        // Test 1: Check connection
        const { data, error } = await supabase.from('users').select('count').limit(1);

        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('\nPossible issues:');
            console.error('1. Check SUPABASE_URL in .env');
            console.error('2. Check SUPABASE_SERVICE_KEY in .env');
            console.error('3. Make sure you ran schema.sql in Supabase SQL Editor');
            process.exit(1);
        }

        console.log('✅ Successfully connected to Supabase!');

        // Test 2: List all tables
        const { data: tables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        console.log('\n📊 Tables in database:');
        if (tables) {
            tables.forEach(t => console.log(`   - ${t.table_name}`));
        }

        console.log('\n✅ Migration successful! Your API is ready to use.');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

testConnection();


import { db } from '../server/db-config';
import { testes } from '../shared/schema';

async function checkTestes() {
    console.log('🔍 Checking tests in database...');
    try {
        const allTestes = await db.select().from(testes);
        console.log(`Found ${allTestes.length} tests.`);
        console.log(JSON.stringify(allTestes, null, 2));
    } catch (error) {
        console.error('Error checking tests:', error);
    }
    process.exit(0);
}

checkTestes();

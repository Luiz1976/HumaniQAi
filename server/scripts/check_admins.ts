
import { db } from '../db-config';
import { admins } from '../../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🔍 Verificando admins...');
  const allAdmins = await db.select().from(admins);
  console.log(`Total admins: ${allAdmins.length}`);
  allAdmins.forEach(a => console.log(` - ${a.email} (${a.id})`));
}

main();

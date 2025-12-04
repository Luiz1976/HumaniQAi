
import { db } from '../db-config';
import { colaboradores } from '../../shared/schema';

async function main() {
  const all = await db.select().from(colaboradores);
  console.log(`Total collaborators: ${all.length}`);
  all.forEach(c => console.log(c.email));
}
main();

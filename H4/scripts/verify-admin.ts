import 'dotenv/config';
import { db } from '../server/db-config';
import { admins } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '../server/utils/auth';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@humaniq.com';
  const plain = process.env.SEED_ADMIN_SENHA || 'Admin123!';

  try {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (!admin) {
      console.log(`[VERIFY] Admin não encontrado: ${email}`);
      process.exitCode = 2;
      return;
    }
    const ok = await comparePassword(plain, admin.senha);
    console.log(`[VERIFY] Admin encontrado: ${email} | senha confere: ${ok}`);
    if (!ok) process.exitCode = 3; else process.exitCode = 0;
  } catch (e: any) {
    console.error('[VERIFY] Erro ao verificar admin:', e?.message || e);
    process.exitCode = 1;
  }
}

main();
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@oustadi.ma';
  const password = 'Admin@Oustadi2026!';
  const fullName = 'مدير المنصة';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    console.log(`To reset password, delete the user first.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log(`Admin user created successfully!`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Name:     ${fullName}`);
  console.log(`  Role:     ${user.role}`);
}

main()
  .catch((e) => {
    console.error('Failed to create admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

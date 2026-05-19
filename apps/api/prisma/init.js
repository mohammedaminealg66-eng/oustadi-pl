const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Oust4d1@2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@oustadi.ma' },
    update: {},
    create: {
      email: 'admin@oustadi.ma',
      passwordHash,
      fullName: 'مدير المنصة',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log(`Admin user ready: admin@oustadi.ma`);

  const subjectCount = await prisma.subject.count();
  if (subjectCount === 0) {
    const subjects = [
      { nameAr: 'الرياضيات', nameFr: 'Mathématiques', slug: 'mathematiques' },
      { nameAr: 'الفيزياء والكيمياء', nameFr: 'Physique-Chimie', slug: 'physique-chimie' },
      { nameAr: 'علوم الحياة والأرض', nameFr: 'SVT', slug: 'svt' },
      { nameAr: 'اللغة العربية', nameFr: 'Arabe', slug: 'arabe' },
      { nameAr: 'اللغة الفرنسية', nameFr: 'Français', slug: 'francais' },
      { nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', slug: 'anglais' },
      { nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géographie', slug: 'histoire-geographie' },
      { nameAr: 'الفلسفة', nameFr: 'Philosophie', slug: 'philosophie' },
      { nameAr: 'الإعلاميات', nameFr: 'Informatique', slug: 'informatique' },
    ];

    for (const s of subjects) {
      await prisma.subject.upsert({ where: { slug: s.slug }, update: {}, create: s });
    }
    console.log('Subjects seeded successfully');
  } else {
    console.log('Subjects already exist, skipping');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

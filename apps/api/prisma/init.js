const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.subject.count();
  if (count > 0) {
    console.log('Subjects already exist, skipping init');
    return;
  }

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
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Oust4d1@2026!', 12);
  const teacherPassword = await bcrypt.hash('Teacher@2026!', 12);
  const studentPassword = await bcrypt.hash('Student@2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@oustadi.ma' },
    update: {},
    create: {
      email: 'admin@oustadi.ma',
      passwordHash: adminPassword,
      fullName: 'مدير المنصة',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@oustadi.ma' },
    update: {},
    create: {
      email: 'teacher@oustadi.ma',
      passwordHash: teacherPassword,
      fullName: 'أحمد العلوي',
      role: Role.TEACHER,
      emailVerified: true,
      teacherProfile: {
        create: {
          bio: 'أستاذ رياضيات وفيزياء مع 10 سنوات من الخبرة في التعليم الثانوي والتوجيه الجامعي.',
          experience: 10,
          price: 150,
          teachingMode: 'BOTH',
          city: 'Casablanca',
          showContact: true,
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@oustadi.ma' },
    update: {},
    create: {
      email: 'student@oustadi.ma',
      passwordHash: studentPassword,
      fullName: 'سارة بنعلي',
      role: Role.STUDENT,
      emailVerified: true,
      studentProfile: {
        create: {
          bio: 'طالبة في السنة الثالثة ثانوي',
          city: 'Rabat',
        },
      },
    },
  });

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

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: {},
      create: subject,
    });
  }

  const math = await prisma.subject.findUnique({ where: { slug: 'mathematiques' } });
  const physics = await prisma.subject.findUnique({ where: { slug: 'physique-chimie' } });

  if (teacher.teacherProfile && math) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacher.teacherProfile.id, subjectId: math.id } },
      update: {},
      create: { teacherId: teacher.teacherProfile.id, subjectId: math.id, levels: ['Tronc commun', '1 Bac', '2 Bac'] },
    });
  }
  if (teacher.teacherProfile && physics) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacher.teacherProfile.id, subjectId: physics.id } },
      update: {},
      create: { teacherId: teacher.teacherProfile.id, subjectId: physics.id, levels: ['Tronc commun', '1 Bac', '2 Bac'] },
    });
  }

  console.log('Seed completed successfully');
  console.log(`Admin:    admin@oustadi.ma / Oust4d1@2026!`);
  console.log(`Teacher:  teacher@oustadi.ma / Teacher@2026!`);
  console.log(`Student:  student@oustadi.ma / Student@2026!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

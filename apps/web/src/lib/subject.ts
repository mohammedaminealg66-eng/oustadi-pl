export function subjectName(
  subject: { nameAr: string; nameFr: string } | null | undefined,
  locale: string,
): string {
  if (!subject) return '';
  return locale === 'fr' ? subject.nameFr : subject.nameAr;
}

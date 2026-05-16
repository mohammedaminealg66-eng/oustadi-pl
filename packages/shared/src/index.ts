export const SUBJECT_LEVELS = ['primaire', 'college', 'lycee', 'superieur'] as const;
export type SubjectLevel = (typeof SUBJECT_LEVELS)[number];

export const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier',
  'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan',
  'Safi', 'El Jadida', 'Beni Mellal', 'Mohammedia', 'Khouribga',
] as const;

export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024,
  DOCUMENT: 10 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateSecureFilename(original: string): string {
  const ext = original.split('.').pop() || 'bin';
  const uuid = crypto.randomUUID();
  return `${uuid}.${ext}`;
}

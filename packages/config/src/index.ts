export const config = {
  jwt: {
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://oustadi:changeme@localhost:5432/oustadi',
  },
  api: {
    url: process.env.API_URL || 'http://localhost:3001',
  },
  web: {
    url: process.env.WEB_URL || 'http://localhost:3000',
  },
};

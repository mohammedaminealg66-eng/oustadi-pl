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
    url: process.env.REDIS_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  api: {
    url: process.env.API_URL,
  },
  web: {
    url: process.env.WEB_URL,
  },
};

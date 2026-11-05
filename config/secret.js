require('dotenv').config();

module.exports = {
  database: process.env.DATABASE_URL,
  secretKey: process.env.SECRET_KEY,
  port: process.env.PORT || 3000
};

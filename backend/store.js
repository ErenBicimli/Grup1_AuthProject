const crypto = require('crypto');

const users = new Map();
const sessions = new Map();
const resetTokens = new Map();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(candidate, 'hex'));
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function clearStore() {
  users.clear();
  sessions.clear();
  resetTokens.clear();
}

module.exports = {
  users,
  sessions,
  resetTokens,
  hashPassword,
  verifyPassword,
  generateToken,
  clearStore,
};

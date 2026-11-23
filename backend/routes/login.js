const { users, sessions, verifyPassword, generateToken } = require('../store');

module.exports = async function handleLogin(req, res, { pathname, body, sendJson }) {
  if (req.method !== 'POST' || pathname !== '/api/auth/login') {
    return false;
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) {
    sendJson(res, 400, { error: 'E-posta ve şifre zorunludur.' });
    return true;
  }

  const user = users.get(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    sendJson(res, 401, { error: 'E-posta veya şifre hatalı.' });
    return true;
  }

  const token = generateToken();
  sessions.set(token, { userId: user.id, email: user.email, createdAt: Date.now() });

  sendJson(res, 200, {
    message: 'Giriş başarılı.',
    token,
    user: { id: user.id, fullName: user.fullName, email: user.email },
  });
  return true;
};

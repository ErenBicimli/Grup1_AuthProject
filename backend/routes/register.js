const { users, hashPassword } = require('../store');

module.exports = async function handleRegister(req, res, { pathname, body, sendJson }) {
  if (req.method !== 'POST' || pathname !== '/api/auth/register') {
    return false;
  }

  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (fullName.length < 2) {
    sendJson(res, 400, { error: 'Ad Soyad en az 2 karakter olmalıdır.' });
    return true;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    sendJson(res, 400, { error: 'Geçerli bir e-posta adresi giriniz.' });
    return true;
  }
  if (password.length < 6) {
    sendJson(res, 400, { error: 'Şifre en az 6 karakter olmalıdır.' });
    return true;
  }
  if (users.has(email)) {
    sendJson(res, 409, { error: 'Bu e-posta adresi zaten kayıtlı.' });
    return true;
  }

  const user = {
    id: `usr_${users.size + 1}`,
    fullName,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.set(email, user);

  sendJson(res, 201, {
    message: 'Kullanıcı başarıyla kaydedildi.',
    user: { id: user.id, fullName: user.fullName, email: user.email },
  });
  return true;
};

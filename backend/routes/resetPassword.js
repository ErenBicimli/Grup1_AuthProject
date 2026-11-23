const { users, resetTokens, hashPassword, generateToken } = require('../store');

module.exports = async function handleResetPassword(req, res, { pathname, body, sendJson }) {
  if (req.method === 'POST' && pathname === '/api/auth/forgot-password') {
    const email = String(body.email || '').trim().toLowerCase();
    const user = users.get(email);
    if (!user) {
      sendJson(res, 404, { error: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' });
      return true;
    }

    const resetToken = generateToken();
    resetTokens.set(resetToken, { email, expiresAt: Date.now() + 15 * 60 * 1000 });
    sendJson(res, 200, {
      message: 'Şifre sıfırlama kodu oluşturuldu.',
      resetToken,
    });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/auth/reset-password') {
    const token = String(body.token || '').trim();
    const newPassword = String(body.newPassword || '');

    if (newPassword.length < 6) {
      sendJson(res, 400, { error: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return true;
    }

    const record = resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      sendJson(res, 400, { error: 'Geçersiz veya süresi dolmuş sıfırlama kodu.' });
      return true;
    }

    const user = users.get(record.email);
    if (!user) {
      sendJson(res, 404, { error: 'Kullanıcı bulunamadı.' });
      return true;
    }

    user.passwordHash = hashPassword(newPassword);
    resetTokens.delete(token);

    sendJson(res, 200, { message: 'Şifreniz başarıyla güncellendi.' });
    return true;
  }

  return false;
};

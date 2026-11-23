const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../backend/server');
const { clearStore } = require('../backend/store');

let server;
let baseUrl;

test.before(async () => {
  clearStore();
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('Kullanıcı kayıt, giriş ve şifre sıfırlama uçtan uca akışı', async () => {
  // 1. Register (AUTH-4)
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Eren Biçimli',
      email: 'eren@example.com',
      password: 'Password123',
    }),
  });
  assert.equal(registerRes.status, 201);
  const registerData = await registerRes.json();
  assert.equal(registerData.user.email, 'eren@example.com');

  // 2. Login (AUTH-5)
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'eren@example.com',
      password: 'Password123',
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token);

  // 3. Forgot Password (AUTH-6)
  const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'eren@example.com' }),
  });
  assert.equal(forgotRes.status, 200);
  const forgotData = await forgotRes.json();
  assert.ok(forgotData.resetToken);

  // 4. Reset Password (AUTH-6)
  const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: forgotData.resetToken,
      newPassword: 'NewPassword456',
    }),
  });
  assert.equal(resetRes.status, 200);

  // 5. Login with new password
  const reloginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'eren@example.com',
      password: 'NewPassword456',
    }),
  });
  assert.equal(reloginRes.status, 200);
});

test('Frontend ekranları 200 OK döner (AUTH-1, AUTH-2, AUTH-3)', async () => {
  for (const page of ['/register.html', '/login.html', '/reset-password.html']) {
    const res = await fetch(`${baseUrl}${page}`);
    assert.equal(res.status, 200, `${page} sayfası yüklenemedi`);
  }
});

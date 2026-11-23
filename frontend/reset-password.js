const requestForm = document.getElementById('requestResetForm');
const confirmForm = document.getElementById('confirmResetForm');
const messageEl = document.getElementById('resetMessage');

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

requestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = requestForm.email.value.trim();
  if (!email) {
    return setMessage('Lütfen e-posta adresinizi giriniz.', 'error');
  }
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return setMessage(data.error || 'Sıfırlama isteği başarısız.', 'error');
    }
    if (data.resetToken) {
      confirmForm.token.value = data.resetToken;
    }
    setMessage('Sıfırlama kodu oluşturuldu.', 'success');
  } catch {
    setMessage('Sunucuya bağlanılamadı.', 'error');
  }
});

confirmForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = confirmForm.token.value.trim();
  const newPassword = confirmForm.newPassword.value;
  if (!token || newPassword.length < 6) {
    return setMessage('Geçerli bir kod ve en az 6 karakterli şifre giriniz.', 'error');
  }
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      return setMessage(data.error || 'Şifre güncellenemedi.', 'error');
    }
    setMessage('Şifreniz başarıyla güncellendi!', 'success');
    confirmForm.reset();
  } catch {
    setMessage('Sunucuya bağlanılamadı.', 'error');
  }
});

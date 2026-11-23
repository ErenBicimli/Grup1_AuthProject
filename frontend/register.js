const form = document.getElementById('registerForm');
const messageEl = document.getElementById('registerMessage');

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (fullName.length < 2) {
    return setMessage('Ad Soyad en az 2 karakter olmalıdır.', 'error');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return setMessage('Geçerli bir e-posta adresi giriniz.', 'error');
  }
  if (password.length < 6) {
    return setMessage('Şifre en az 6 karakter olmalıdır.', 'error');
  }
  if (password !== confirmPassword) {
    return setMessage('Şifreler eşleşmiyor.', 'error');
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return setMessage(data.error || 'Kayıt başarısız.', 'error');
    }
    setMessage('Kayıt başarılı! Giriş ekranına geçebilirsiniz.', 'success');
    form.reset();
  } catch {
    setMessage('Sunucuya bağlanılamadı.', 'error');
  }
});

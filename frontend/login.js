const form = document.getElementById('loginForm');
const messageEl = document.getElementById('loginMessage');

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    return setMessage('E-posta ve şifre alanları zorunludur.', 'error');
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return setMessage(data.error || 'Giriş başarısız.', 'error');
    }
    localStorage.setItem('authToken', data.token);
    setMessage(`Hoş geldiniz, ${data.user.fullName}!`, 'success');
  } catch {
    setMessage('Sunucuya bağlanılamadı.', 'error');
  }
});

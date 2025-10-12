export function usernameToEmail(username) {
  const domain = process.env.AUTH_FAKE_EMAIL_DOMAIN || "local.trs";
  return `${String(username || "")
    .trim()
    .toLowerCase()}@${domain}`;
}

export function validateRegister({ username, name, password }) {
  const errs = [];
  if (!username || username.length < 3)
    errs.push("Kullanıcı adı en az 3 karakter olmalı.");
  if (!/^[a-zA-Z0-9._-]+$/.test(username))
    errs.push("Kullanıcı adında sadece harf, rakam, . _ - kullanılabilir.");
  if (!name || name.length < 2) errs.push("Ad en az 2 karakter olmalı.");
  if (!password || password.length < 6)
    errs.push("Şifre en az 6 karakter olmalı.");
  return errs;
}

export function validateLogin({ username, password }) {
  const errs = [];
  if (!username) errs.push("Kullanıcı adı gerekli.");
  if (!password) errs.push("Şifre gerekli.");
  return errs;
}

export function getSessionMaxAgeMs() {
  const days = Number(process.env.SESSION_MAX_DAYS || 14);
  return Math.min(Math.max(days, 1), 30) * 24 * 60 * 60 * 1000; // 1..30 gün
}

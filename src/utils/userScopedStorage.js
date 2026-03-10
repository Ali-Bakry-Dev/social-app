export function getCurrentUserIdentity() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return {
      email: String(currentUser?.email || user?.email || "guest").toLowerCase().trim(),
      name: String(currentUser?.name || user?.name || "").trim(),
    };
  } catch {
    return {
      email: "guest",
      name: "",
    };
  }
}

export function makeScopedKey(base) {
  const { email } = getCurrentUserIdentity();
  return `${base}:${email}`;
}

export function readScopedArray(base) {
  try {
    const raw = localStorage.getItem(makeScopedKey(base));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeScopedArray(base, value) {
  localStorage.setItem(makeScopedKey(base), JSON.stringify(value));
}

export function readScopedValue(base, fallback = null) {
  try {
    const raw = localStorage.getItem(makeScopedKey(base));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeScopedValue(base, value) {
  localStorage.setItem(makeScopedKey(base), JSON.stringify(value));
}
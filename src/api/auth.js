import {
  USE_MOCK,
  createResponse,
  httpRequest,
  readStorage,
  simulateLatency,
  writeStorage,
} from './client';

const USERS_STORAGE_KEY = 'sable_users';
const SESSION_STORAGE_KEY = 'sable_session';

const DEMO_USER = {
  id: 'user-demo-1',
  firstName: 'Alexander',
  lastName: 'Vance',
  email: 'atelier@sable.co',
  password: 'sable2026',
  phone: '+1 (212) 555-0194',
  savedAddress: {
    firstName: 'Alexander',
    lastName: 'Vance',
    address: '42 Mercer Street, Apt 5B',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    country: 'United States',
    phone: '+1 (212) 555-0194',
  },
  createdAt: '2026-01-15T10:00:00Z',
};

function loadUsers() {
  const users = readStorage(USERS_STORAGE_KEY, null);
  if (!users || users.length === 0) {
    writeStorage(USERS_STORAGE_KEY, [DEMO_USER]);
    return [DEMO_USER];
  }
  return users;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function login({ email, password }) {
  if (!USE_MOCK) {
    const res = await httpRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.data?.token) {
      window.localStorage.setItem('sable_token', res.data.token);
    }
    return res;
  }

  await simulateLatency(350, 550);
  const users = loadUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  let match = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  // If user doesn't exist in local mock, create dynamic user with their name!
  if (!match) {
    const emailPrefix = normalizedEmail.split('@')[0] || 'Member';
    const cleanName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    match = {
      id: `user-${Date.now()}`,
      firstName: cleanName,
      lastName: 'Sable',
      email: normalizedEmail,
      password: password || 'password',
      phone: '',
      savedAddress: null,
      createdAt: new Date().toISOString(),
    };
    writeStorage(USERS_STORAGE_KEY, [...users, match]);
  }

  const safeUser = sanitizeUser(match);
  const token = `mock-jwt-${match.id}`;
  window.localStorage.setItem('sable_token', token);
  writeStorage(SESSION_STORAGE_KEY, { userId: match.id, token });
  return createResponse({ user: safeUser, token });
}

export async function register({ firstName, lastName, email, password }) {
  if (!USE_MOCK) {
    const res = await httpRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    if (res?.data?.token) {
      window.localStorage.setItem('sable_token', res.data.token);
    }
    return res;
  }

  await simulateLatency(350, 550);
  const users = loadUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password,
    phone: '',
    savedAddress: null,
    createdAt: new Date().toISOString(),
  };

  const token = `mock-jwt-${newUser.id}`;
  window.localStorage.setItem('sable_token', token);
  writeStorage(USERS_STORAGE_KEY, [...users, newUser]);
  writeStorage(SESSION_STORAGE_KEY, { userId: newUser.id, token });

  return createResponse({ user: sanitizeUser(newUser), token });
}

export async function logout() {
  window.localStorage.removeItem('sable_token');
  if (!USE_MOCK) {
    return httpRequest('/auth/logout', { method: 'POST' });
  }

  await simulateLatency(150, 250);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  return createResponse({ success: true });
}

export async function getMe() {
  if (!USE_MOCK) {
    return httpRequest('/auth/me');
  }

  await simulateLatency(200, 350);
  const session = readStorage(SESSION_STORAGE_KEY, null);
  if (!session?.userId) {
    return createResponse(null);
  }
  const users = loadUsers();
  const user = users.find((u) => u.id === session.userId);
  return createResponse(sanitizeUser(user));
}

export async function updateProfile(userId, updates) {
  if (!USE_MOCK) {
    return httpRequest('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  await simulateLatency(300, 450);
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    throw new Error('User account not found.');
  }

  const updated = {
    ...users[idx],
    ...updates,
    savedAddress:
      updates.savedAddress !== undefined ? updates.savedAddress : users[idx].savedAddress,
  };
  users[idx] = updated;
  writeStorage(USERS_STORAGE_KEY, users);

  return createResponse(sanitizeUser(updated));
}

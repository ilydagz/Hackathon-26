const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error(e);
    }
  },

  // Listings
  getListings: async () => {
    const res = await fetch(`${API_URL}/listings`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getAdminListings: async () => {
    const res = await fetch(`${API_URL}/admin/listings`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createListing: async (listingData) => {
    const res = await fetch(`${API_URL}/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteListing: async (id) => {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Users
  getMe: async () => {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateMe: async (userData) => {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Users (Admin)
  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  toggleUserStatus: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Logs (Admin)
  getLogs: async () => {
    const res = await fetch(`${API_URL}/logs`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

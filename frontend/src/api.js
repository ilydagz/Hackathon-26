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
  getListings: async (category = 'all', search = '') => {
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_URL}/listings?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getDrafts: async () => {
    const res = await fetch(`${API_URL}/listings/drafts`, {
      headers: getAuthHeaders()
    });
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

  updateListing: async (id, listingData) => {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  markAsSold: async (id) => {
    const res = await fetch(`${API_URL}/listings/${id}/sold`, {
      method: 'POST',
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
  },

  // Messages
  getChats: async () => {
    const res = await fetch(`${API_URL}/chats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMessages: async (listingId, otherUserId = null) => {
    let url = `${API_URL}/messages/${listingId}`;
    if (otherUserId) url += `?other_user_id=${otherUserId}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  sendMessage: async (messageData) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // My Listings & Favorites (Frontend handled as backend is missing endpoints)
  getMyListings: async () => {
    const currentUserId = Number(localStorage.getItem('userId'));
    const all = await api.getListings();
    // In a real app, backend would filter. For hackathon, we filter frontend.
    // Also include drafts
    const drafts = await api.getDrafts();
    const myActive = all.filter(l => l.author_id === currentUserId);
    return [...drafts, ...myActive];
  },

  getFavorites: async () => {
    const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const all = await api.getListings();
    return all.filter(l => favIds.includes(l.id));
  },

  toggleFavorite: async (id) => {
    const nid = Number(id);
    const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favIds.indexOf(nid);
    if (index > -1) {
      favIds.splice(index, 1);
    } else {
      favIds.push(nid);
    }
    localStorage.setItem('favorites', JSON.stringify(favIds));
    return { success: true };
  }
};

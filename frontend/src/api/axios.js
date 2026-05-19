import axios from 'axios';
import { BACKEND_ORIGIN } from '../utils/backendUrl';

const api = axios.create({
  baseURL: BACKEND_ORIGIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

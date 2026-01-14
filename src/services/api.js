import axios from "axios";
export const VITE_API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: VITE_API_URL,
});

// Interceptor para agregar token solo en rutas protegidas
api.interceptors.request.use(
  (config) => {
    const publicRoutes = ['/users/login', '/users/register', '/users/correo', '/users/reset-password'];
    
    // Verificar si la ruta actual es pública
    const isPublicRoute = publicRoutes.some(route => config.url && config.url.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Response error:", error.response?.data);
    return Promise.reject(error);
  }
);

// Mantenemos esto por si lo usas en otros lados, aunque el interceptor ya lo hace
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export default api;
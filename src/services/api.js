import axios from "axios";
export const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,  
});

// Interceptor para agregar token solo en rutas protegidas
api.interceptors.request.use(
  (config) => {
    // Lista de rutas que NO necesitan token
    const publicRoutes = ['/users/login', '/users/register', '/users/correo', '/users/reset-password'];
    
    // Verificar si la ruta actual es pública
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
    
    // Solo agregar token si NO es una ruta pública
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    if (config.data instanceof FormData) {

    } else {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    
    console.log("Request config:", {
      url: config.url,
      hasAuth: !!config.headers.Authorization,
      isFormData: config.data instanceof FormData,
      contentType: config.headers['Content-Type']
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.data);
    return Promise.reject(error);
  }
);

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export default api;
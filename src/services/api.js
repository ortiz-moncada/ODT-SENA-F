import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
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
    
    console.log("🔧 Request config:", {
      url: config.url,
      hasAuth: !!config.headers.Authorization
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas (opcional, para debugging)
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
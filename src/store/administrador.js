import { defineStore } from 'pinia';
import { loginUser, getUserById } from '../services/servicesComponent.js';

export const useAdminStore = defineStore('administrador', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
    rol: localStorage.getItem('rol') ? Number(localStorage.getItem('rol')) : null,
    areaId: localStorage.getItem('areaId') || null,
    loading: false,
    countNotifications: 0,
    totalLeidoLocal: 0,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token, // ✅ Este se queda
    getUserData: (state) => state.user,
    getUserId: (state) => state.userId,
    getUserRol: (state) => state.rol,
    getUserAreaId: (state) => state.areaId,
  },

  actions: {
    async inicio(credentials) {
      this.loading = true;
      try {
        const data = await loginUser(credentials);
        
        console.log("Respuesta del login:", data); 
        
        if (!data || !data.token || !data.user) {
          throw new Error('Respuesta del servidor incompleta');
        }
        
        // ✅ El backend devuelve areaId (camelCase)
        const areaIdValue = data.user.areaId || data.user.area_id || null;
        
        // Guardar en el state
        this.token = data.token;
        this.userId = data.user._id;
        this.user = data.user;
        this.rol = data.user.rol;
        this.areaId = areaIdValue;
        
        // Guardar en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('rol', data.user.rol);
        localStorage.setItem('areaId', areaIdValue || '');
        
        console.log("✅ Store: areaId guardado:", areaIdValue);
        console.log("✅ Verificación inmediata:", localStorage.getItem('areaId'));
        
        this.loading = false;
        return data;
      } catch (error) {
        this.loading = false;
        console.error("Error completo en inicio:", error);
        throw error;
      }
    },

    async fetchUserData() {
      try {
        if (!this.userId) {
          throw new Error('No se encontró ID de usuario');
        }

        const data = await getUserById(this.userId);
        this.user = data.user || data;
        
        if (this.user.rol) {
          this.rol = this.user.rol;
          localStorage.setItem('rol', this.user.rol);
        }
        
        const areaIdValue = this.user.areaId || this.user.area_id || null;
        if (areaIdValue) {
          this.areaId = areaIdValue;
          localStorage.setItem('areaId', areaIdValue);
        }
        
        return this.user;
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.userId = null;
      this.rol = null;
      this.areaId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      localStorage.removeItem('rol');
      localStorage.removeItem('areaId');
    }
  }
});
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
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserData: (state) => state.user,
    getUserId: (state) => state.userId,
    getUserRol: (state) => state.rol,
    getUserAreaId: (state) => state.areaId,
  },

  actions: {
    async inicio(gmail, password) {
      this.loading = true;
      try {
        const credentials = {
          gmail: gmail,
          password: password
        };

        // loginUser ahora retorna directamente res.data
        const data = await loginUser(credentials);
        
        console.log("Respuesta del login:", data); // Para debug
        
        // Verificar estructura de la respuesta
        if (!data || !data.token || !data.user) {
          throw new Error('Respuesta del servidor incompleta');
        }
        
        // Guardar token, userId, rol y areaId
        this.token = data.token;
        this.userId = data.user._id;
        this.user = data.user;
        this.rol = data.user.rol;
        this.areaId = data.user.area_id || null;
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('rol', data.user.rol);
        localStorage.setItem('areaId', data.user.area_id || '');

        
        this.loading = false;
        
        // Retornar en el formato que espera tu componente login
        return {
          data: {
            token: data.token,
            user: data.user
          }
        };
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
        
        // Actualizar también rol y areaId cuando se obtienen los datos del usuario
        if (this.user.rol) {
          this.rol = this.user.rol;
          localStorage.setItem('rol', this.user.rol);
        }
        
        if (this.user.area_id) {
          this.areaId = this.user.area_id;
          localStorage.setItem('areaId', this.user.area_id);
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
import { useAdminStore } from "../store/administrador";
import api, { getAuthHeaders } from "./api.js";
import axios from "axios";

// USUARIOS


export async function registerUser(userData) {
  try {
    const res = await api.post("/users/register", userData, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

export async function getUser() {
  try {
    const res = await api.get("/users/seeUsers", getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
}

export async function putUser(id, userData) {
  try {
    const res = await api.put(`/users/${id}`, userData, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

export async function putUserAll(id, userData) {
  try {
    const res = await api.put(`/users/all/${id}`, userData, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

export async function getActive() {
  try {
    const res = await api.get("/users/active", getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener usuarios activos:", error);
    throw error;
  }
}

export async function getInactive() {
  try {
    const res = await api.get("/users/inactive", getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener usuarios inactivos:", error);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    const res = await api.get(`/users/${id}`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    throw error;
  }
}

export async function resetPassword(userId, newPassword) {
  try {
    const res = await api.put(`/users/reset-password/${userId}`, {
      password: newPassword
    });
    return res.data;
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error;
  }
}

// LOGIN
export async function loginUser(credentials) {
  try {   
    // Enviar directamente el objeto con gmail y password
    const res = await api.post("/users/login", { 
      gmail: credentials.gmail, 
      password: credentials.password 
    });

    // Guardar datos básicos
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.user._id);
    localStorage.setItem("rol", res.data.user.rol);

    // ✅ SOLUCIÓN SIMPLE: El backend usa "areaId", así que leemos "areaId"
    if (res.data.user.areaId) {
      // Si areaId es un objeto, extrae el _id
      const areaIdValue = typeof res.data.user.areaId === 'object' 
        ? res.data.user.areaId._id 
        : res.data.user.areaId;
      
      localStorage.setItem("areaId", areaIdValue);
    } else {
      console.warn("⚠️ Usuario sin areaId en la respuesta del backend");
      console.warn("⚠️ Esto puede causar problemas al crear tareas");
      localStorage.removeItem("areaId");
    }


    return res.data;
    
  } catch (error) {
    console.error("❌ Error en loginUser:", error.response?.data || error);
    throw error;
  }
}

export async function getCorreo(gmail) {
  try {
    const res = await api.get(`/users/correo/${gmail}`);
    return res.data;
  } catch (error) {
    console.error("Error en getCorreo:", error);
    throw error;
  }
}



// TAREAS


export async function getTasksByWorker(userId) {
  try {
    const res = await api.get(`/tasks/byWorker/${userId}`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener tareas por trabajador:", error);
    throw error;
  }
}

// TAREAS

export async function postTasks(form) {
  try {
    let payload;
    let headers = { ...getAuthHeaders().headers };

    if (form instanceof FormData) {
      payload = form;
      headers["Content-Type"] = "multipart/form-data";
    } else {
      payload = form;
    }

    const res = await api.post("/tasks/create", payload, { headers });
    return res.data;
  } catch (error) {
    console.error("❌ Error en postTasks:", error.response?.data || error.message);
    throw error;
  }
}

export async function getTasks() {
  try {
    const res = await api.get("/tasks/seeTasks", getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    throw error;
  }
}

export async function putTasks(id, form) {
  try {
    const headers = { ...getAuthHeaders().headers };
    let payload;

    // Si el formulario ya es FormData (viene del componente con archivos)
    if (form instanceof FormData) {
      payload = form;
      headers["Content-Type"] = "multipart/form-data";
    } else {
      // Si es un objeto JSON normal
      payload = form;
    }

    // Enviamos el PUT con los headers de auth correctos
    const res = await api.put(`/tasks/${id}`, payload, { headers });

    console.log("✅ Tarea actualizada:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error en putTasks:", error.response?.data || error.message);
    throw error;
  }
}

export async function entregarTarea(taskId, file) {
  try {
    const formData = new FormData();
    
    // IMPORTANTE: El backend espera "file" para procesarlo con express-fileupload
    if (file) {
      formData.append("file", file);
    }

    // USAMOS POST porque en tus rutas definiste: router.post("/entregar/:id", ...)
    // Si usas PUT aquí pero el backend es POST, dará error 404 o 500
    const res = await api.post(`/tasks/entregar/${taskId}`, formData, {
      headers: {
        ...getAuthHeaders().headers,
        "Content-Type": "multipart/form-data"
      }
    });

    return res.data;
  } catch (error) {
    console.error("❌ Error al entregar tarea:", error.response?.data || error.message);
    throw error;
  }
}

// ÁREAS


export async function postArea(areaData) {
  try {
    const res = await api.post("/areas/create", areaData, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al registrar Area:", error);
    throw error;
  }
}

export async function getArea() {
  try {
    const res = await api.get("/areas/seeAreas", getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener el área:", error);
    throw error;
  }
}

export async function putArea(id, areaData) {
  try {
    console.log('📋 Datos a enviar:', areaData)
    
    const res = await api.put(`/areas/${id}`, areaData, getAuthHeaders());
    
    console.log('✅ Área actualizada:', res.data)
    return res.data;
  } catch (error) {
    console.error('❌ Error al actualizar área:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    throw error;
  }
}

export async function getData() {
  try {
    const res = await api.get("/someEndpoint", getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Error al obtener datos:", error);
    throw error;
  }
}

// NOTIFICACIONES


export async function createNotification(notificationData) {
  try {
    const res = await api.post(
      "/notify/create",
      notificationData,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error al crear notificación:",
      error.response?.data || error
    );
    throw error;
  }
}

export async function getNotifications(params = {}) {
  try {
    const res = await api.get("/notify", {
      params,
      ...getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    throw error;
  }
}

export async function deleteNotification(id) {
  try {
    const res = await api.delete(
      `/notify/${id}`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    throw error;
  }
}

export async function deleteNotifications(params = {}) {
  try {
    // Asegurar que siempre se envíe el userId
    const userId = params.userId || localStorage.getItem("userId");
    
    if (!userId) {
      throw new Error("No se encontró el ID de usuario");
    }

    const res = await api.delete("/notify", {
      params: { userId }, // Solo enviamos userId, sin importar el rol
      ...getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Error al eliminar notificaciones:", error);
    throw error;
  }
}
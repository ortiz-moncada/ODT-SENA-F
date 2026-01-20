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

export async function loginUser(credentials) {
  try {
    console.log("Enviando a backend:", credentials);

    //Enviar directamente el objeto con gmail y password
    const res = await api.post("/users/login", {
      gmail: credentials.gmail,
      password: credentials.password
    });

    console.log("Respuesta del backend:", res.data);

    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (error) {
    console.error("Error en loginUser:", error.response?.data || error);
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

export async function postTasks(form) {
  try {
    console.log("📦 Form recibido:", form);
    console.log("📎 Archivos adjuntos:", form.attached_files);
    console.log("📏 Longitud:", form.attached_files?.length);
    
   
    if (!form.attached_files || form.attached_files.length === 0) {
      console.log("✅ Enviando como JSON (sin archivos)");
      
      const payload = {
        name: form.name,
        description: form.description,
        tribute_id: form.tribute_id,
        stateTask: form.stateTask,
        area_id: form.area_id,
        workers: form.workers,
        isMonthly: form.isMonthly
      };
      
      if (!form.isMonthly && form.delivery_date) {
        payload.delivery_date = form.delivery_date;
      }
      
      if (form.isMonthly && form.monthlyDay) {
        payload.monthlyDay = form.monthlyDay;
      }
      
      if (form.leader) {
        payload.leader = form.leader;
      }
      
      console.log("📤 Payload JSON:", payload);
      const res = await api.post("/tasks/create", payload);
      return res.data;
    }
    
    // ✅ Si HAY archivos, usar FormData
    console.log("📎 Enviando como FormData (con archivos)");
    const formData = new FormData();
    
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("tribute_id", form.tribute_id);
    formData.append("stateTask", form.stateTask);
    formData.append("area_id", form.area_id);
    formData.append("workers", JSON.stringify(form.workers));
    formData.append("isMonthly", String(form.isMonthly));
    
    if (!form.isMonthly && form.delivery_date) {
      formData.append("delivery_date", form.delivery_date);
    }
    
    if (form.isMonthly && form.monthlyDay) {
      formData.append("monthlyDay", String(form.monthlyDay));
    }
    
    if (form.leader) {
      formData.append("leader", form.leader);
    }
    
    // Agregar archivos
    form.attached_files.forEach((file, index) => {
      console.log(`📎 Archivo ${index}:`, file); // ✅ CORREGIDO AQUÍ
      formData.append("file", file);
    });
    
    const res = await api.post("/tasks/create", formData);
    return res.data;
    
  } catch (error) {
    console.error("Error en postTasks:", error.response?.data || error);
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
    const formData = new FormData();

    // Agregar todos los campos excepto archivos
    Object.keys(form).forEach(key => {
      if (key !== "attached_files") {
        if (Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      }
    });

    if (form.attached_files && form.attached_files.length > 0) {
      form.attached_files.forEach(file => {
        formData.append("file", file);
      });
    }

    const res = await api.put(`/tasks/${id}`, formData);

    return res.data;

  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    throw error;
  }
}

export async function entregarTarea(taskId, file) {
  try {
    const formData = new FormData();
    
    if (file) {
      formData.append("file", file); // ✅ Usar "file" en minúscula
    }

    const res = await api.put(`/tasks/entregar/${taskId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders().headers
      }
    });

    return res.data;
  } catch (error) {
    console.error("Error al entregar tarea:", error.response?.data || error);
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
    console.log(`📤 PUT /areas/${id}`)
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
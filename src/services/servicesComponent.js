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

    const res = await api.post("/users/login", credentials);

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
    // ✅ SI NO HAY ARCHIVOS, enviar JSON directo
    if (!form.attached_files || form.attached_files.length === 0) {
      const res = await api.post("/tasks/create", form, {
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'application/json'
        }
      });
      return res.data;
    }

    // ✅ SI HAY ARCHIVOS, usar FormData
    const formData = new FormData();
    
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("tribute_id", form.tribute_id);
    formData.append("stateTask", form.stateTask);
    formData.append("area_id", form.area_id);
    formData.append("workers", JSON.stringify(form.workers));
    
    // ✅ isMonthly como string "true" o "false" (el backend lo normaliza)
    formData.append("isMonthly", String(form.isMonthly));
    
    // ✅ SOLO agregar delivery_date si NO es mensual
    if (!form.isMonthly && form.delivery_date) {
      formData.append("delivery_date", form.delivery_date);
    }
    
    // ✅ SOLO agregar monthlyDay si ES mensual
    if (form.isMonthly && form.monthlyDay) {
      formData.append("monthlyDay", String(form.monthlyDay));
    }
    
    if (form.leader) {
      formData.append("leader", form.leader);
    }
    
    if (form.attached_files?.length) {
      form.attached_files.forEach(file => {
        formData.append("attached_files", file);
      });
    }

    const res = await api.post("/tasks/create", formData, {
      headers: {
        ...getAuthHeaders().headers
      }
    });

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

    Object.keys(form).forEach(key => {
      if (key !== "attached_files") {

        if (Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      }
    });

    // Archivos
    if (form.attached_files && form.attached_files.length > 0) {
      form.attached_files.forEach(file => {
        formData.append("attached_files", file);
      });
    }

    const res = await api.put(`/tasks/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders().headers
      }
    });

    return res.data;

  } catch (error) {
    console.error("Error al actualizar tarea:", error);
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
    console.log(` PUT /areas/${id}`)
    console.log(' Datos a enviar:', areaData)
    
    const res = await api.put(`/areas/${id}`, areaData, getAuthHeaders());
    
    console.log(' Área actualizada:', res.data)
    return res.data;
  } catch (error) {
    console.error(' Error al actualizar área:', error);
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
      params,                 // aquí van los filtros
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
    const res = await api.delete("/notify", {
      params,               // rol, userId, areaId
      ...getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Error al eliminar notificaciones:", error);
    throw error;
  }
}


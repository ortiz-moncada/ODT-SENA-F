<template>
  <Layouts_main>
    <div class="header">
      <div>
        <h1 :style="{ color: 'var(--twoColor--)' }" style="font-weight: 600;">Notificaciones</h1>
      </div>

      <div class="contem-mi-info">
        <div class="mInfo1">
          <b class="tInfo">Área: {{ user.area }}</b>
        </div>
        <div class="mInfo2">
          <b class="tInfo">Rol: {{ user.rol }}</b>
        </div>
      </div>
    </div>

    <div class="toolbar-container">
      <q-input 
        v-model="filtroNombre" 
        dense 
        outlined 
        placeholder="Buscar por nombre de tarea..." 
        class="search-input"
        bg-color="white"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="actions-group">
        <q-btn
          dense
          flat
          :loading="loading"
          icon="archive"
          label="Historial"
          class="btn-action btn-download"
          @click="generarInforme"
        />

<!--         <q-btn
          dense
          flat
          :loading="loadingDelete"
          icon="delete"
          label="Eliminar"
          class="btn-action btn-delete"
          @click="eliminarNotificacioness"
        /> -->
      </div>
    </div>

    <div class="alerts" v-if="notificationsFiltradas.length">
      <div
        v-for="n in notificationsFiltradas"
        :key="n._id"
        class="alertCard static-card"
        :style="getCardStyle(n)"
      >
        <h4>{{ n.title }}</h4>
        <small class="date">{{ new Date(n.createdAt).toLocaleString() }}</small>
        <h3>{{ n.nameTask }}</h3>
        
        <p>{{ processDescription(n.description) }}</p>
      </div>
    </div>

    <p v-else class="noAlerts">
      {{ notifications.length > 0 ? 'No hay notificaciones con los filtros aplicados' : 'No hay notificaciones' }}
    </p>

  </Layouts_main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Layouts_main from "../layouts/layouts_main.vue";
import { Notify } from "quasar";
import { getUserById, getNotifications, deleteNotifications } from "../services/servicesComponent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAdminStore } from "../store/administrador.js";

const adminStore = useAdminStore();

// Estados
const filtroNombre = ref(""); // Nuevo filtro de búsqueda
const filtroEstado = ref(null);
const filtroTipo = ref(null);
const loading = ref(false);
const loadingDelete = ref(false);
const notifications = ref([]);
const user = ref({ rol: "", area: "" });
const defaultColor = "#4CAF50";
let pollingInterval = null;

const roles = { 1: "Super Admin", 2: "Administrador", 3: "Usuario" };

const stateMap = {
  1: { label: "En Desarrollo", color: "blue" },
  2: { label: "En Revisión", color: "orange" },
  3: { label: "Completada", color: "green" },
  4: { label: "Rechazada", color: "red" },
  5: { label: "Vencida", color: "grey" }
};

// LÓGICA DE FILTRADO COMPUESTA
const notificationsFiltradas = computed(() => {
  let result = notifications.value;

  // 1. Filtro por Nombre de Tarea (Texto libre)
  if (filtroNombre.value.trim() !== "") {
    const search = filtroNombre.value.toLowerCase();
    result = result.filter(n => 
      n.nameTask?.toLowerCase().includes(search) || 
      n.title?.toLowerCase().includes(search)
    );
  }

  // 2. Filtrar por estado (Buscando el ID numérico en la descripción)
  if (filtroEstado.value && filtroEstado.value.value !== null) {
    result = result.filter(n => {
      const matches = n.description.match(/\d+/g);
      const lastState = matches ? Number(matches[matches.length - 1]) : null;
      return lastState === filtroEstado.value.value;
    });
  }

  // 3. Filtrar por tipo (Quién hizo el cambio)
  if (filtroTipo.value && filtroTipo.value.value !== null) {
    result = result.filter(n => {
      if (filtroTipo.value.value === "cambio_propio") {
        return n.title === "Has cambiado el estado de la tarea" || n.title === "Has creado una nueva tarea";
      } else {
        return n.title === "Han cambiado el estado de la tarea" || n.title === "Te han asignado una nueva tarea";
      }
    });
  }

  return result;
});

const getCardStyle = (n) => {
  const matches = n.description.match(/\d+/g);
  const lastState = matches ? matches[matches.length - 1] : null;
  const color = stateMap[Number(lastState)]?.color || defaultColor;
  
  return {
    borderLeft: `8px solid ${color}`,
    borderLeftStyle: 'solid'
  };
};

const processDescription = (desc) => {
  if (!desc) return "";
  let newDesc = desc;
  Object.keys(stateMap).forEach(id => {
    const regex = new RegExp(`\\b${id}\\b`, 'g');
    newDesc = newDesc.replace(regex, stateMap[id].label);
  });
  return newDesc;
};

const cargarNotificaciones = async () => {
  try {
    const rol = Number(localStorage.getItem("rol"));
    const userId = localStorage.getItem("userId");
    const params = { rol, userId };
    notifications.value = await getNotifications(params);
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
  }
};

onMounted(async () => {
  adminStore.countNotifications = 0;
  adminStore.totalLeidoLocal = 0; 
  
  try {
    const id = localStorage.getItem("userId");
    if (!id) return;
    const resUser = await getUserById(id);
    user.value.rol = roles[resUser.rol] || "Sin rol";
    user.value.area = resUser.rol === 2 ? (resUser.areaAdminName || "Sin área") : (resUser.areaName || "Sin área");
    await cargarNotificaciones();
    pollingInterval = setInterval(cargarNotificaciones, 20000);
  } catch (error) {
    console.error(error);
  }
});

onUnmounted(() => { 
  if (pollingInterval) clearInterval(pollingInterval); 
});

const generarInforme = () => {
  loading.value = true;
  const dataParaInforme = notificationsFiltradas.value;
  
  if (!dataParaInforme.length) {
    loading.value = false;
    Notify.create({ type: "warning", message: "No hay notificaciones para exportar" });
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Informe de Notificaciones", 14, 15);
  doc.setFontSize(10);
  doc.text(`Área: ${user.value.area}`, 14, 22);
  doc.text(`Rol: ${user.value.rol}`, 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 34);

  const tableData = dataParaInforme.map(n => [
    n.title,
    n.nameTask,
    processDescription(n.description),
    new Date(n.createdAt).toLocaleString()
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Título", "Tarea", "Descripción", "Fecha"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [76, 175, 80] }
  });
  
  loading.value = false;
  doc.save("informe_notificaciones.pdf");
};

/* const eliminarNotificacioness = async () => {
  if (!notifications.value.length) {
    Notify.create({ type: "warning", message: "No hay notificaciones para eliminar" });
    return;
  }
  try {
    loadingDelete.value = true;
    const userId = localStorage.getItem("userId");
    const result = await deleteNotifications({ userId });
    notifications.value = [];
    adminStore.countNotifications = 0;
    adminStore.totalLeidoLocal = 0; 
    Notify.create({ type: "positive", message: result.message || "Notificaciones eliminadas correctamente" });
  } catch (error) {
    Notify.create({ type: "negative", message: "Error al eliminar las notificaciones" });
  } finally {
    loadingDelete.value = false;
  }
}; */
</script>

<style scoped>
@import url("../style/notify.css");

/* Estilos para la nueva barra de herramientas */
.toolbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2%;
  margin-bottom: 20px;
  gap: 20px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.actions-group {
  display: flex;
  gap: 10px;
}

/* Deshabilitar interacción visual de botón en las tarjetas */
.static-card {
  cursor: default !important;
  transition: transform 0.2s ease;
}

/* Opcional: una pequeña elevación al pasar el mouse pero sin que parezca un botón */
.static-card:hover {
  transform: none !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
</style>
<template>
  <Layouts_main>
    <div class="header">
      <div>
      <h1 
      :style="{ color: 'var(--twoColor--)' }" 
      style=" font-weight: 600;"
      >Notificaciones</h1>
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

    <div style="display: flex; gap: 10px; margin-left: 80%; margin-top: -4.6%;">
     <q-btn
  dense
  flat
  :loading="loading"
  icon="archive"
  label="Historial"
  class="btn-action btn-download"
  @click="generarInforme"
/>

<q-btn
  dense
  flat
  :loading="loadingDelete"
  icon="delete"
  label="Eliminar"
  class="btn-action btn-delete"
  @click="eliminarNotificacioness"
/>

    </div>

    <div class="alerts" v-if="notificationsFiltradas.length">
      <div
        v-for="n in notificationsFiltradas"
        :key="n._id"
        class="alertCard"
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

const stateMap = {
  1: { label: "En Desarrollo", color: "blue" },
  2: { label: "En Revisión", color: "orange" },
  3: { label: "Completada", color: "green" },
  4: { label: "Rechazada", color: "red" },
  5: { label: "Vencida", color: "grey" }
};

const loading = ref(false);
const loadingDelete = ref(false);
const defaultColor = "#4CAF50";
const notifications = ref([]);
const user = ref({ rol: "", area: "" });
const roles = { 1: "Super Admin", 2: "Administrador", 3: "Usuario" };
let pollingInterval = null;

// Filtros
const filtroEstado = ref(null);
const filtroTipo = ref(null);

const estadoOptions = [
  { label: "Todos los estados", value: null },
  { label: "En Desarrollo", value: 1 },
  { label: "En Revisión", value: 2 },
  { label: "Completada", value: 3 },
  { label: "Rechazada", value: 4 },
  { label: "Vencida", value: 5 }
];

const tipoOptions = [
  { label: "Todos los tipos", value: null },
  { label: "Has cambiado estado", value: "cambio_propio" },
  { label: "Han cambiado estado", value: "cambio_otro" }
];

// Notificaciones filtradas
const notificationsFiltradas = computed(() => {
  let result = notifications.value;

  // Filtrar por estado
  if (filtroEstado.value && filtroEstado.value.value !== null) {
    result = result.filter(n => {
      const matches = n.description.match(/\d+/g);
      const lastState = matches ? Number(matches[matches.length - 1]) : null;
      return lastState === filtroEstado.value.value;
    });
  }

  // Filtrar por tipo (quien hizo el cambio)
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


const limpiarFiltros = () => {
  filtroEstado.value = null;
  filtroTipo.value = null;
};

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

    // ✅ TODOS los roles ven solo SUS propias notificaciones
    const params = { 
      rol,
      userId // Siempre enviamos userId
    };

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
    Notify.create({
      type: "warning",
      message: "No hay notificaciones para exportar"
    });
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Informe de Notificaciones", 14, 15);

  doc.setFontSize(10);
  doc.text(`Área: ${user.value.area}`, 14, 22);
  doc.text(`Rol: ${user.value.rol}`, 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 34);
  
  if (filtroEstado.value || filtroTipo.value) {
    let filtros = "Filtros aplicados: ";
    if (filtroEstado.value) filtros += `Estado: ${filtroEstado.value.label}`;
    if (filtroTipo.value) filtros += ` | Tipo: ${filtroTipo.value.label}`;
    doc.text(filtros, 14, 40);
  }

  const tableData = dataParaInforme.map(n => [
    n.title,
    n.nameTask,
    processDescription(n.description),
    new Date(n.createdAt).toLocaleString()
  ]);

  autoTable(doc, {
    startY: filtroEstado.value || filtroTipo.value ? 46 : 40,
    head: [["Título", "Tarea", "Descripción", "Fecha"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [76, 175, 80] }
  });
  
  loading.value = false;
  doc.save("informe_notificaciones.pdf");
};

const eliminarNotificacioness = async () => {
  if (!notifications.value.length) {
    Notify.create({
      type: "warning",
      message: "No hay notificaciones para eliminar"
    });
    return;
  }

  try {
    loadingDelete.value = true;
    const userId = localStorage.getItem("userId");

    if (!userId) {
      throw new Error("No se encontró el ID de usuario");
    }

    const result = await deleteNotifications({ userId });

    notifications.value = [];
    adminStore.countNotifications = 0;
    adminStore.totalLeidoLocal = 0; 

    Notify.create({
      type: "positive",
      message: result.message || "Notificaciones eliminadas correctamente"
    });
    
  } catch (error) {
    console.error(error);
    Notify.create({
      type: "negative",
      message: "Error al eliminar las notificaciones"
    });
  } finally {
    loadingDelete.value = false;
  }
};
</script>

<style scoped>
@import url("../style/notify.css");


</style>

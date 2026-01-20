<template>
  <Layouts_main>
    <div class="title">
      <h1 :style="{ color: 'var(--oneColor--)' }" style="margin-left: 13%; margin-top: -1%; position: relative;">Notificaciones</h1>
     <!--  <button @click="cargarNotificaciones" class="btnRefresh">Actualizar</button> -->
    </div>

    <div class="mInfo">
      <b class="tInfo">Área: {{ user.area }}</b>
      <b class="tInfo">Rol: {{ user.rol }}</b>
    </div>
      <q-btn :loading="loading" style="background: var(--oneColor--); color: var(--white--); position: relative;  margin-left: 77%; margin-top: -5%;" @click="generarInforme" label="Descargar historial" icon="archive" />
      <q-btn style="background: var(--sevenColor--); color: var(--white--); position: relative;  margin-left: 60%; margin-top: -7.8%;" @click="eliminarNotificacioness" label="eliminar historial" icon="delete" />

    <div class="alerts" v-if="notifications.length">
      <div
        v-for="n in notifications"
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

    <p v-else class="noAlerts">No hay notificaciones</p>

  </Layouts_main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Layouts_main from "../layouts/layouts_main.vue";
import { Notify } from "quasar";
import { getUserById, getNotifications,deleteNotifications } from "../services/servicesComponent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const stateMap = {
   1: { label: "En Desarrollo", color: "blue" },
  2: { label: "En Revisión", color: "orange" },
  3: { label: "Completada", color: "green" },
  4: { label: "Rechazada", color: "red" },
  5: { label: "Vencida", color: "grey" }
};
const loading = ref(false)
const defaultColor = "#4CAF50";
const notifications = ref([]);
const user = ref({ rol: "", area: "" });
const roles = { 1: "Super Admin", 2: "Administrador", 3: "Usuario" };
let pollingInterval = null;
import { useAdminStore } from "../store/administrador.js";
const adminStore = useAdminStore();


// EXTRAE LOS NÚMEROS DEL TEXTO PARA EL COLOR

const getCardStyle = (n) => {
  // Buscamos el último número en la descripción (el estado nuevo)
  const matches = n.description.match(/\d+/g);
  const lastState = matches ? matches[matches.length - 1] : null;
  const color = stateMap[Number(lastState)]?.color || defaultColor;
  
  return {
    borderLeft: `8px solid ${color}`,
    borderLeftStyle: 'solid'
  };
};

// REEMPLAZA LOS NÚMEROS POR TEXTO EN LA DESCRIPCIÓN

const processDescription = (desc) => {
  if (!desc) return "";
  
  let newDesc = desc;
  // Buscamos todos los números y los reemplazamos por su etiqueta del mapa
  Object.keys(stateMap).forEach(id => {
    const regex = new RegExp(`\\b${id}\\b`, 'g');
    newDesc = newDesc.replace(regex, stateMap[id].label);
  });
  
  return newDesc;
};

const cargarNotificaciones = async () => {
  const rol = Number(localStorage.getItem("rol"));
  const userId = localStorage.getItem("userId");
  const areaId = localStorage.getItem("areaId");

  const params = { rol };

  if (rol === 3) params.userId = userId;
  if (rol === 2) params.areaId = areaId;

  notifications.value = await getNotifications(params);
};


onMounted(async () => {
  adminStore.countNotifications = 0;
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

onUnmounted(() => { if (pollingInterval) clearInterval(pollingInterval); });
const generarInforme = () => {
  loading.value = true;
  if (!notifications.value.length) {
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

  const tableData = notifications.value.map(n => [
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
  loading.value =false;

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
    const rol = String(localStorage.getItem("rol"));
    const userId = localStorage.getItem("userId");
    const areaId = localStorage.getItem("areaId");

    const params = { rol };
    if (rol === "3") params.userId = userId;
    if (rol === "2") params.areaId = areaId;

    await deleteNotifications(params);

    notifications.value = []; //  LIMPIA LA LISTA

    Notify.create({
      type: "positive",
      message: "Notificaciones eliminadas correctamente"
    });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: "Error al eliminar las notificaciones"
    });
  }
};


</script>

<style scoped>
@import url("../style/notify.css");
</style>
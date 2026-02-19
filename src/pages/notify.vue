<template>
  <Layouts_main>
    <div class="row items-center q-mb-lg q-col-gutter-sm">
      <div class="col-12 col-md">
        <h1 class="text-h5 text-weight-bold text-primary q-my-none">Centro de Notificaciones</h1>
        <div class="text-caption text-grey-7">Mantente al día con las actualizaciones de tus tareas.</div>
      </div>
      <div class="col-12 col-md-auto">
        <q-btn
          unelevated
          rounded
          dense
          :loading="loading"
          icon="download"
          label="Informe PDF"
          color="primary"
          class="q-px-md"
          @click="generarInforme"
        />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md bg-grey-1">
      <q-card-section class="q-py-sm">
        <q-input 
          v-model="filtroNombre" 
          dense 
          outlined 
          placeholder="Filtrar por actividad..." 
          bg-color="white"
          class="compact-search"
        >
          <template v-slot:prepend>
            <q-icon name="search" size="20px" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <div v-if="notificationsFiltradas.length" class="row q-col-gutter-md">
      <div
        v-for="n in notificationsFiltradas"
        :key="n._id"
        class="col-12 col-md-6"
      >
        <q-card flat bordered class="notification-item transition-all">
          <q-item dense class="q-py-md">
            <q-item-section avatar top>
              <q-avatar size="32px" :style="{ backgroundColor: getBadgeColor(n) }" text-color="white" icon="notifications" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-primary" style="font-size: 13px;">{{ n.title }}</q-item-label>
              <q-item-label class="text-weight-medium q-mt-xs" lines="1">{{ n.nameTask }}</q-item-label>
              <q-item-label caption lines="2" class="q-mt-xs text-grey-8">{{ processDescription(n.description) }}</q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-item-label caption class="text-weight-bold" style="font-size: 10px;">
                {{ formatNotifyDate(n.createdAt) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

    <div v-else class="column flex-center q-pa-xl text-grey-5 bg-white rounded-borders border-grey-3">
      <q-icon name="notifications_none" size="48px" />
      <div class="text-subtitle2 q-mt-sm">Sin actualizaciones pendientes</div>
    </div>

  </Layouts_main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Layouts_main from "../layouts/layouts_main.vue";
import { Notify } from "quasar";
import { getUserById, getNotifications } from "../services/servicesComponent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAdminStore } from "../store/administrador.js";

const adminStore = useAdminStore();

const filtroNombre = ref(""); 
const loading = ref(false);
const notifications = ref([]);
const user = ref({ rol: "", area: "" });
let pollingInterval = null;

const roles = { 1: "Super Admin", 2: "Administrador", 3: "Usuario" };

const stateMap = {
  1: { label: "En Desarrollo", color: "#2196F3" },
  2: { label: "En Revisión", color: "#FF9800" },
  3: { label: "Completada", color: "#39A900" },
  4: { label: "Rechazada", color: "#F44336" },
  5: { label: "Vencida", color: "#9E9E9E" }
};

const notificationsFiltradas = computed(() => {
  let result = notifications.value;
  if (filtroNombre.value.trim() !== "") {
    const search = filtroNombre.value.toLowerCase();
    result = result.filter(n => 
      n.nameTask?.toLowerCase().includes(search) || 
      n.title?.toLowerCase().includes(search)
    );
  }
  return result;
});

const getBadgeColor = (n) => {
  const matches = n.description.match(/\d+/g);
  const lastState = matches ? Number(matches[matches.length - 1]) : null;
  
  if (lastState && stateMap[lastState]) {
    return stateMap[lastState].color;
  }
  
  // Colores por palabras clave si no hay ID numérico
  const title = n.title.toLowerCase();
  if (title.includes('completada') || title.includes('aprobada')) return '#39A900';
  if (title.includes('rechazada')) return '#F44336';
  if (title.includes('revisión')) return '#FF9800';
  if (title.includes('asignada') || title.includes('creada')) return '#2196F3';
  
  return '#39A900'; // Default SENA Green
};

const formatNotifyDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    user.value.area = resUser.rol === 2 ? (resUser.areaAdminName || "Área General") : (resUser.areaName || "Área General");
    user.value.rol = roles[resUser.rol] || "Usuario";
    await cargarNotificaciones();
    pollingInterval = setInterval(cargarNotificaciones, 20000);
  } catch (error) {}
});

onUnmounted(() => { if (pollingInterval) clearInterval(pollingInterval); });

const generarInforme = () => {
  loading.value = true;
  const dataParaInforme = notificationsFiltradas.value;
  if (!dataParaInforme.length) {
    loading.value = false;
    return Notify.create({ type: "warning", message: "No hay datos para exportar" });
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(57, 169, 0);
  doc.text("Historial de Actividades - ODT", 14, 15);
  
  const tableData = dataParaInforme.map(n => [
    n.title,
    n.nameTask,
    processDescription(n.description),
    formatNotifyDate(n.createdAt)
  ]);

  autoTable(doc, {
    startY: 25,
    head: [["Acción", "Tarea", "Descripción", "Fecha"]],
    body: tableData,
    headStyles: { fillColor: [57, 169, 0] },
    styles: { fontSize: 8 }
  });
  
  loading.value = false;
  doc.save(`Notificaciones_ODT.pdf`);
};
</script>

<style scoped>
.notification-item {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: #fbfcfa;
  border-color: var(--q-primary);
}

.compact-search {
  max-width: 300px;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>

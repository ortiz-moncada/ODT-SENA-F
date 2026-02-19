<template>
  <layouts_main>
    <div class="q-pa-md">
      <!-- CABECERA DEL DASHBOARD -->
      <div class="q-mb-lg">
        <h1 class="text-h5 text-weight-bold text-primary q-my-none">Panel de Control</h1>
        <div class="text-caption text-grey-7">Visualiza el estado global de tus actividades y navega por el sistema.</div>
      </div>

      <!-- SECCIÓN 1: CARTAS DE NAVEGACIÓN (ICONOS) -->
      <div class="row q-col-gutter-md q-mb-xl">
        <div
          v-for="(area, index) in filteredAreas"
          :key="index"
          class="col-12 col-sm-4"
        >
          <q-card
            flat
            bordered
            class="navigation-card cursor-pointer transition-all"
            @click="iRuta(area)"
          >
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col-auto">
                <q-avatar color="green-1" text-color="primary" size="48px">
                  <q-icon :name="area.icon" size="28px" />
                </q-avatar>
              </div>
              <div class="col q-ml-md">
                <div class="text-subtitle1 text-weight-bold text-grey-9">{{ area.nombre }}</div>
                <div class="text-caption text-grey-6 text-weight-medium">Acceder al módulo</div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="primary" size="20px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- SECCIÓN 2: ESTADÍSTICAS Y RENDIMIENTO -->
      <div class="row q-col-gutter-lg">
        <!-- MÉTRICAS PRINCIPALES -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-lg full-height bg-white stat-card">
            <div class="text-subtitle2 text-weight-bold text-grey-7 q-mb-md uppercase">Resumen de Gestión</div>
            
            <div class="column q-gutter-y-lg">
              <div class="row items-center justify-between">
                <div class="column">
                  <span class="text-caption text-grey-6">Tareas Hechas</span>
                  <span class="text-h4 text-weight-bold text-positive">{{ stats.completed }}</span>
                </div>
                <q-icon name="task_alt" color="positive" size="32px" />
              </div>

              <q-separator flat />

              <div class="row items-center justify-between">
                <div class="column">
                  <span class="text-caption text-grey-6">Tareas Rechazadas</span>
                  <span class="text-h4 text-weight-bold text-negative">{{ stats.rejected }}</span>
                </div>
                <q-icon name="error_outline" color="negative" size="32px" />
              </div>

              <div class="q-mt-md">
                <div class="row justify-between text-caption text-weight-bold q-mb-xs">
                  <span class="text-primary">Efectividad Operativa</span>
                  <span class="text-grey-7">{{ stats.efficiency }}%</span>
                </div>
                <q-linear-progress
                  :value="stats.efficiency / 100"
                  color="primary"
                  track-color="grey-2"
                  height="8px"
                  rounded
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- GRÁFICO DE LÍNEAS (APEXCHARTS) -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="q-pa-lg full-height bg-white stat-card">
            <div class="row items-center justify-between q-mb-md">
              <div class="column">
                <div class="text-subtitle2 text-weight-bold text-grey-7 uppercase">Tendencia de Cumplimiento</div>
                <div class="text-caption text-grey-5">Comparativa de flujo de trabajo semanal</div>
              </div>
              <q-btn flat dense round icon="filter_list" color="primary" />
            </div>

            <div class="q-mt-md">
              <apexchart
                type="line"
                height="300"
                :options="chartOptions"
                :series="series"
              ></apexchart>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </layouts_main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Layouts_main from "../layouts/layouts_main.vue";
import { useAdminStore } from "../store/administrador.js";
import api from "../services/api.js";
import apexchart from "vue3-apexcharts";

const router = useRouter();
const adminStore = useAdminStore();

const stats = ref({
  completed: 0,
  rejected: 0,
  inDevelopment: 0,
  inReview: 0,
  expired: 0,
  efficiency: 0
});

const fetchStats = async () => {
  try {
    const tasksRes = await api.get('/tasks/seeTasks');
    const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
    
    stats.value.inDevelopment = tasks.filter(t => Number(t.stateTask) === 1).length;
    stats.value.inReview = tasks.filter(t => Number(t.stateTask) === 2).length;
    stats.value.completed = tasks.filter(t => Number(t.stateTask) === 3).length;
    stats.value.rejected = tasks.filter(t => Number(t.stateTask) === 4).length;
    stats.value.expired = tasks.filter(t => Number(t.stateTask) === 5).length;
    
    const totalProcessed = stats.value.completed + stats.value.rejected;
    stats.value.efficiency = totalProcessed > 0 
      ? Math.round((stats.value.completed / (stats.value.completed + stats.value.rejected + stats.value.expired)) * 100) 
      : 0;
  } catch (error) {
    console.warn("Error cargando estadísticas");
  }
};

onMounted(fetchStats);

const areas = [
  { nombre: "Usuarios", icon: "people", ruta: "/users", roles: [1, 2] },
  { nombre: "Áreas", icon: "business", ruta: "/Areas", roles: [1] },
  { nombre: "Tareas", icon: "assignment", ruta: "/task", roles: [1, 2, 3] },
];

const filteredAreas = computed(() => {
  const rol = Number(localStorage.getItem("rol")) || 0;
  return areas.filter((a) => a.roles.includes(rol));
});

function iRuta(area) {
  router.push(area.ruta);
}

// ✅ CONFIGURACIÓN DE LA GRÁFICA CON TODOS LOS ESTADOS
const series = computed(() => [
  { name: "Desarrollo", data: [0, Math.floor(stats.value.inDevelopment / 2), stats.value.inDevelopment] },
  { name: "Revisión", data: [0, Math.floor(stats.value.inReview / 2), stats.value.inReview] },
  { name: "Completadas", data: [0, Math.floor(stats.value.completed / 2), stats.value.completed] },
  { name: "Rechazadas", data: [0, Math.floor(stats.value.rejected / 2), stats.value.rejected] },
  { name: "Vencidas", data: [0, Math.floor(stats.value.expired / 2), stats.value.expired] }
]);

const chartOptions = {
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    zoom: { enabled: false }
  },
  colors: ['#2196F3', '#FF9800', '#39A900', '#F44336', '#9E9E9E'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: ['Inicio', 'Semana Anterior', 'Estado Actual'],
    labels: { style: { colors: '#9e9e9e', fontWeight: 500 } }
  },
  yaxis: {
    labels: { style: { colors: '#9e9e9e' } },
    min: 0
  },
  legend: { 
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '12px'
  },
  markers: { size: 5, strokeWidth: 2, hover: { size: 7 } },
  grid: { borderColor: '#f1f1f1' }
};
</script>

<style scoped>
.navigation-card {
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  background: #ffffff;
}

.navigation-card:hover {
  border-color: var(--q-primary);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(57, 169, 0, 0.05) !important;
}

.stat-card {
  border-radius: 16px;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.uppercase {
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>

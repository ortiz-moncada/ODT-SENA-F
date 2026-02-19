<template>
  <q-layout
    view="hHh Lpr lff"
    container
    style="min-height: 100vh"
    class="shadow-2 rounded-borders"
  >
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white" height-hint="64">
      <q-toolbar class="q-px-md shadow-1">
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" class="q-mr-sm" />
        
        <q-toolbar-title class="row items-center no-wrap">
          <div class="column justify-center">
            <div class="text-h6 text-weight-bolder leading-tight">ODT</div>
            <div class="text-caption text-weight-medium" style="margin-top: -4px; font-size: 10px;">ORGANIZADOR DE TAREAS</div>
          </div>
        </q-toolbar-title>

        <q-space />

        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            round
            icon="notifications"
            @click="passNotify"
          >
            <q-badge v-if="adminStore.countNotifications > 0" color="negative" floating>
              {{ adminStore.countNotifications > 9 ? '9+' : adminStore.countNotifications }}
            </q-badge>
          </q-btn>

          <q-separator vertical inset dark class="q-mx-sm" />

          <img src="../IMG/logo-sena-blanco.png" alt="logoSena" style="height: 32px" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- DRAWER (Menú lateral) -->
    <q-drawer
      v-model="drawer"
      :width="260"
      :breakpoint="500"
      bordered
      class="bg-grey-1 shadow-1"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-uppercase text-weight-bold text-grey-7" style="font-size: 11px; letter-spacing: 1px;">Navegación</q-item-label>
          
          <q-item
            v-for="(item, index) in menuItems"
            :key="index"
            clickable
            v-ripple
            :to="item.to"
            active-class="text-primary bg-green-1"
            class="q-ma-xs rounded-borders"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="22px" />
            </q-item-section>
            <q-item-section class="text-weight-medium">
              {{ item.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- PERFIL FIJO EN BOTTOM - SIN AVATAR CIRCULAR -->
      <div class="absolute-bottom bg-white border-top">
        <q-separator />
        <q-item clickable v-ripple @click="perfil" class="q-py-md">
          <q-item-section avatar>
            <q-icon name="account_circle" color="secondary" size="32px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ user.names || 'Usuario' }}</q-item-label>
            <q-item-label caption lines="1">{{ user.rol || 'Sin asignar' }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="settings" size="18px" />
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container class="bg-grey-2">
      <q-page padding>
        <div class="container-wrapper">
          <slot />
        </div>
      </q-page>
    </q-page-container>

    <!-- MODAL PERFIL - FLAT/BORDERED CON AVATAR CIRCULAR (Único permitido) -->
    <q-dialog v-model="modalPerfil" transition-show="scale" transition-hide="scale">
      <q-card flat bordered style="width: 350px; border-radius: 8px;">
        <q-card-section class="bg-primary text-white text-center q-pb-xl">
          <div class="text-h6 text-weight-bold">Mi Perfil</div>
        </q-card-section>

        <q-card-section class="text-center" style="margin-top: -40px">
          <q-avatar size="100px" class="bg-white shadow-1">
            <q-avatar size="88px" color="secondary" text-color="white">
              {{ user.names ? user.names.charAt(0).toUpperCase() : 'U' }}
            </q-avatar>
          </q-avatar>

          <div class="q-mt-md">
            <div class="text-h6 text-weight-bold">{{ user.names }}</div>
            <div class="text-subtitle2 text-grey-7">{{ user.gmail }}</div>
            <q-chip outline color="primary" icon="badge" class="q-mt-sm rounded-borders">
              {{ user.rol }}
            </q-chip>
          </div>
        </q-card-section>

        <q-separator inset class="q-my-md" />

        <q-card-actions align="center" class="q-pb-lg">
          <q-btn
            unelevated
            rounded
            label="Cerrar Sesión"
            color="negative"
            icon="logout"
            class="q-px-lg"
            @click="cerrarSesion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAdminStore } from "../store/administrador.js";
const passNotify = () => {
  adminStore.totalLeidoLocal += adminStore.countNotifications;
  adminStore.countNotifications = 0;
  router.push("/notify");
};


const $q = useQuasar();
const router = useRouter();
const adminStore = useAdminStore();

const drawer = ref(false);
const modalPerfil = ref(false);
const contador = ref(0);

const nuevaNotificacion = () => {
  contador.value++
}
/* ===== MENÚ POR ROLES ===== */
const menuItems = computed(() => {
  const rol = adminStore.user?.rol;

  const items = [
    { to: "/dashboard", icon: "home", label: "Zona de control", roles: [1, 2, 3] },
    { to: "/Users", icon: "people", label: "Usuarios", roles: [1, 2] },
    { to: "/Areas", icon: "domain", label: "Áreas", roles: [1] },
    { to: "/task", icon: "task", label: "Tareas", roles: [1, 2, 3] },
  ];

  return items.filter((item) => item.roles.includes(rol));
});

/* ===== PERFIL ===== */
const user = computed(() => {
  if (adminStore.user) {
    return {
      names: adminStore.user.names || "Usuario",
      gmail: adminStore.user.gmail || "correo@ejemplo.com",
      rol: getRolName(adminStore.user.rol),
    };
  }
  return { names: "Cargando...", gmail: "", rol: "" };
});

const getRolName = (rol) => {
  switch (rol) {
    case 1: return "Super Administrador";
    case 2: return "Administrador";
    case 3: return "Trabajador";
    default: return "Sin asignar";
  }
};

/* ===== AUTENTICACIÓN ===== */
onMounted(async () => {
  if (!adminStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    if (!adminStore.user) await adminStore.fetchUserData();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error al cargar datos del usuario",
      position: "top",
    });
    router.push("/login");
  }
});

const perfil = () => (modalPerfil.value = true);

const cerrarSesion = () => {
  adminStore.logout();
  $q.notify({
    type: "positive",
    message: "Sesión cerrada correctamente",
    position: "top",
  });
  router.push("/login");
};
</script>

<style scoped>
.leading-tight {
  line-height: 1.1;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.container-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

:deep(.q-drawer) {
  background-color: #f8f9fa;
}

:deep(.q-item.q-router-link--active) {
  background-color: #e8f5e9;
  color: var(--q-primary);
  font-weight: 700;
}
</style>

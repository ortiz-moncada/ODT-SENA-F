<template>
  <q-layout
    view="hHh Lpr lff"
    container
    style="min-height: 100vh"
    class="shadow-2 rounded-borders"
  >
    <!-- HEADER -->
    <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>
          <h1 class="name">ODT</h1>
        </q-toolbar-title>
      
         <P class="Ncom">ORGANIZADOR DE TAREAS</P>
         
         <q-btn
  flat
  round
  icon="notifications_none"
  style="position: absolute; margin-left: 94%;"
  @click="passNotify"
>
  <q-badge v-if="adminStore.countNotifications > 0" color="red" floating>
    {{ adminStore.countNotifications > 9 ? '9+' : adminStore.countNotifications }}
  </q-badge>
</q-btn>
  <span v-if="contador > 0" class="badge">
    {{ contador > 9 ? '9+' : contador }}
  </span>
        

        <img class="LSB" src="../IMG/logo-sena-blanco.png" alt="logoSena" />
      </q-toolbar>
    </q-header>

    <!-- DRAWER (Menú lateral) — IGUAL AL EJEMPLO -->
    <q-drawer
      v-model="drawer"
      :width="200"
      :breakpoint="500"
      overlay
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- MENÚ FILTRADO POR ROL -->
          <q-item
            v-for="(item, index) in menuItems"
            :key="index"
            clickable
            v-ripple
            :to="item.to"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" style="color: var(--oneColor--)" />
            </q-item-section>
            <q-item-section style="color: var(--oneColor--)">
              {{ item.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- PERFIL FIJO -->
      <div style="position: absolute; bottom: 0; width: 100%;">
        <q-separator />
        <q-item clickable v-ripple @click="perfil">
          <q-item-section avatar>
            <q-avatar style="background: var(--twoColor--)" text-color="white">
              {{ user.names ? user.names.charAt(0).toUpperCase() : 'U' }}
            </q-avatar>
          </q-item-section>
          <q-item-section style="color: var(--oneColor--)">
            Perfil
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <q-page padding>
        <slot />
      </q-page>
    </q-page-container>

    <!-- MODAL PERFIL -->
    <q-dialog v-model="modalPerfil" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items">
          <div class="text-h6">Perfil del Usuario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="perfilModal"><br>
            <q-avatar class="iconP" size="900%">
              {{ user.names ? user.names.charAt(0).toUpperCase() : 'U' }}
            </q-avatar>

            <br /><br />
            <div align="center">
              <div class="text-subtitle1">
                {{ user.names || 'Usuario' }}
              </div>
              <div class="text-subtitle2">
                {{ user.gmail || 'correo@ejemplo.com' }}
              </div>
              <div class="text-subtitle2">
                {{ user.rol || 'Sin asignar' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center">
          <q-btn
            flat
            label="Cerrar sesión"
            color="negative"
            icon="logout"
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
@import url("../style/layouts_main.css");
</style>

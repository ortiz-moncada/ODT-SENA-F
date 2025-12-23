<template>
  <layouts_main>
    <div class="q-pa-md">
      <div class="contemC">
        <q-btn
          v-for="(area, index) in filteredAreas"
          :key="index"
          class="box col-3"
          @click="iRuta(area)"
          flat
          bordered
        >
          <div class="encabesado">
            <h2 class="nombreA">{{ area.nombre }}</h2>
          </div>
          <img class="IMGP" :src="area.imagen" :alt="area.nombre" />
        </q-btn>
      </div>
    </div>
  </layouts_main>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import Layouts_main from "../layouts/layouts_main.vue";
import { useAdminStore } from "../store/administrador.js";

const router = useRouter();
const adminStore = useAdminStore();

// ✅ Todas las áreas disponibles
const areas = [

  {
    nombre: "Usuarios",
    imagen: "https://cdn-icons-png.flaticon.com/128/921/921347.png",
    ruta: "/users",
    roles: [1,2], // Super Admin y Admin
  },
  {
    nombre: "Áreas",
    imagen: "https://cdn-icons-png.flaticon.com/128/1865/1865706.png",
    ruta: "/Areas",
    roles: [1], // Solo Super Admin
  },
  {
    nombre: "Tareas",
    imagen: "https://cdn-icons-png.flaticon.com/128/7891/7891841.png",
    ruta: "/task",
    roles: [1, 2, 3], // Super Admin y Admin
  },
];

// ✅ Filtrar las áreas según el rol del usuario
const filteredAreas = computed(() => {
  const rol = adminStore.user?.rol || 0;
  return areas.filter((a) => a.roles.includes(rol));
});

// ✅ Navegación al hacer clic
function iRuta(area) {
  router.push(area.ruta);
}
</script>

<style scoped>
@import url("../style/Dashboard.css");
</style>

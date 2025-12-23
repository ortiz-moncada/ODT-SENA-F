<template>
  <Layouts_main>
    <div class="inf">
      <div>
      <h1 style="margin-left: 20%; margin-top: -1%;" :style="{ color: 'var(--oneColor--)' }">Notificaciones</h1></div>
      <div class="mInfo">
      <b class="tInfo">Área: {{ user.area }}</b>
      <b class="tInfo">Rol: {{ user.rol }}</b>
    </div>
    </div>

    <div class="contemAlerts">

   <div v-if="notifications.length">
  <div
    v-for="n in notifications"
    :key="n._id"
    class="alertCard"
  >
    <h4>{{ n.title }}</h4> 
    <small class="date">
      {{ new Date(n.createdAt).toLocaleString() }}
    </small>
    <h3>{{ n.nameTask }}</h3>
    <p>{{ n.description }}</p>
    
  </div>
</div>

<p v-else class="noAlerts">
  No hay notificaciones
</p>

    </div>

  </Layouts_main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Layouts_main from "../layouts/layouts_main.vue";
import { Notify } from "quasar";
import { getUserById } from "../services/servicesComponent";
import { getNotifications } from "../services/servicesComponent";

const notifications = ref([]);
const user = ref({
  rol: "",
  area: ""
});

const roles = {
  1: "Super Admin",
  2: "Administrador",
  3: "Usuario"
};

onMounted(async () => {
  try {
    // USUARIO
    const id = localStorage.getItem("userId");
    if (!id) throw new Error("No existe el ID del usuario");

    const res = await getUserById(id);

    user.value.rol = roles[res.rol] || "Sin rol";
    if (res.rol === 2) {
      user.value.area = res.areaAdminName || "Sin área administrada";
    } else {
      user.value.area = res.areaName || "Sin área";
    }

    //  NOTIFICACIONES
    notifications.value = await getNotifications();

  } catch (error) {
    Notify.create({
      position: "top",
      type: "negative",
      message: "Error al cargar datos"
    });

    console.error(error);
  }
});

</script>

<style scoped>
@import url("../style/notify.css");
</style>

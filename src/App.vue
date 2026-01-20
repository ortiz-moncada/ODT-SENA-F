<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { getNotifications } from "./services/servicesComponent";
import audioFile from "../src/Audio/audio3.mp3"; 
import { useAdminStore } from "./store/administrador.js";

const adminStore = useAdminStore();
const notificationSound = new Audio(audioFile);
const lastCount = ref(null); 
let globalPolling = null;

const checkNotifications = async () => {
  const userId = localStorage.getItem("userId");
  const rol = Number(localStorage.getItem("rol"));
  const areaId = localStorage.getItem("areaId");

  if (!userId) return;

  const params = { rol };
  if (rol === 3) params.userId = userId;
  if (rol === 2) params.areaId = areaId;

try {
    const data = await getNotifications(params);
    const totalEnServidor = data.length;

    // Calculamos el número real para la campana:
    // Es el total del servidor MENOS lo que el usuario ya marcó como visto localmente
    const nuevasParaMostrar = totalEnServidor - adminStore.totalLeidoLocal;

    // Actualizamos el contador de la campana (asegurando que no sea negativo)
    adminStore.countNotifications = nuevasParaMostrar > 0 ? nuevasParaMostrar : 0;

    // SONIDO: Solo si el total del servidor aumentó desde la última vez que revisamos
    if (lastCount.value !== null && totalEnServidor > lastCount.value) {
       notificationSound.currentTime = 0;
       notificationSound.play().catch(e => console.warn("Sonido bloqueado"));
    }

    // Guardamos este total para la siguiente comparación de sonido
    lastCount.value = totalEnServidor;

  } catch (error) {
    console.error("Error en polling:", error);
  }
};

onMounted(() => {
  checkNotifications();
  globalPolling = setInterval(checkNotifications, 20000);
});

onUnmounted(() => {
  adminStore.countNotifications = 0;
  if (globalPolling) clearInterval(globalPolling);
});
</script>
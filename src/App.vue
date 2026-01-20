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
  
  if (!userId) return;
  
  const params = { rol, userId };

  try {
    const data = await getNotifications(params);
    const totalEnServidor = data.length;
    
    if (totalEnServidor === 0) {
      adminStore.totalLeidoLocal = 0;
      adminStore.countNotifications = 0;
      lastCount.value = 0;
      return;
    }
    
    const nuevasParaMostrar = totalEnServidor - adminStore.totalLeidoLocal;
    adminStore.countNotifications = nuevasParaMostrar > 0 ? nuevasParaMostrar : 0;
    
    if (lastCount.value !== null && totalEnServidor > lastCount.value) {
       notificationSound.currentTime = 0;
       notificationSound.play().catch(e => console.warn("Sonido bloqueado"));
    }
    
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
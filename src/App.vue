<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { getNotifications } from "./services/servicesComponent";
import audioFile from "../src/Audio/audio3.mp3"; 

const notificationSound = new Audio(audioFile);
const lastCount = ref(null); // Empezamos en null para saber si es la primera carga
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
    const currentCount = data.length;

    // LÓGICA DEL SONIDO:
    // 1. Si lastCount es null, es la primera vez que entramos (no suena)
    if (lastCount.value === null) {
      lastCount.value = currentCount;
      return;
    }

    // 2. Si el número actual es mayor al que teníamos guardado, hay algo nuevo
    if (currentCount > lastCount.value) {
      notificationSound.currentTime = 0; // Reinicia el audio por si acaso
      notificationSound.play().catch(e => {
        console.warn("Sonido bloqueado hasta que el usuario haga clic en la app.");
      });
      console.log("¡Nueva notificación detectada!");
    }

    // Siempre actualizamos el contador al final
    lastCount.value = currentCount;

  } catch (error) {
    console.error("Error en polling global:", error);
  }
};

onMounted(() => {
  // Ejecutamos la primera vez inmediatamente
  checkNotifications();
  
  // Revisar cada 20 segundos
  globalPolling = setInterval(checkNotifications, 20000);
});

onUnmounted(() => {
  if (globalPolling) clearInterval(globalPolling);
});
</script>
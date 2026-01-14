<template>
  <div class="container">
    <div class="contemLogin">
      <div class="design">
        <h1 class="titleImportant">ODT</h1>
        <P class="Ncom">ORGANIZADOR DE TAREAS</P>
      </div>

      <div class="questions">
        <img class="LS" src="../IMG/logosena.png" alt="logoSena" />
        <br />
        <h2 class="title">LOGIN</h2>

        <!-- Usuario -->
        <q-input class="inpt" filled v-model="gmail" label="Tu Usuario"  />
        <br />

        <!-- Contraseña -->
        <q-input class="inpt2" v-model="password" filled :type="isPwd ? 'password' : 'text' " label="Tu Contraseña">
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>
        <br />

        <p class="RC" @click="abrirModal()">¿Olvidaste tu contraseña?</p>

        <q-btn :loading="adminStore.loading" class="button" @click="pasarUsuario" label="Ingresar" />
      </div>
    </div>

    <!-- MODAL RESTABLECER CONTRASEÑA -->
    <div v-if="modalRecuperar" class="overlay"></div>
    <div v-if="modalRecuperar" class="modal">
      <div class="modal-header">
        <h2 style="text-align: start;">RESTABLECIMIENTO DE CONTRASEÑA</h2>
        <img class="logoSena" src="../IMG/logo-sena-blanco.png" alt="SENA" />
      </div>

      <div class="modal-body">
        <h3>Ingrese su correo electrónico</h3>
        <p class="textInfo">
          Para restablecer tu contraseña te enviaremos un correo electrónico.
        </p>
        <q-input filled v-model="correoRecuperar" label="Correo electrónico" type="email" clearable class="input-modal" />
      </div>

      <div class="modal-actions">
        <q-btn flat class="closeBTN" label="CERRAR" @click="cerrarModal" />
        <q-btn class="openBTN" label="SIGUIENTE" icon-right="arrow_forward" :loading="loading" @click="enviarCorreo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router"; 
import { useAdminStore } from "../store/administrador.js";
import { Notify } from "quasar";
import api from '../services/api.js'; 

const router = useRouter();
const adminStore = useAdminStore();

const gmail = ref("");
const password = ref("");
const isPwd = ref(true);
const correoRecuperar = ref("");
const modalRecuperar = ref(false);
const loading = ref(false);

// Manejo de teclado
const handleEnter = (event) => {
  if (event.key === "Enter") pasarUsuario();
};

onMounted(() => window.addEventListener("keydown", handleEnter));
onBeforeUnmount(() => window.removeEventListener("keydown", handleEnter));

/**
 * ENVIAR CORREO
 */
const enviarCorreo = async () => {
  if (!correoRecuperar.value) {
    return Notify.create({ position: "top", type: "warning", message: "Ingrese su correo electrónico" });
  }

  loading.value = true;
  try {
    await api.post('/api/email/restablecer', {
      to: correoRecuperar.value,
      subject: "Restablecimiento de contraseña",
    });

    Notify.create({ position: "top", type: "positive", message: "Correo enviado correctamente" });
    cerrarModal();
  } catch (error) {
    Notify.create({ position: "top", type: "negative", message: "Error al enviar el correo" });
  } finally {
    loading.value = false;
  }
};

/**
 * LOGIN PRINCIPAL
 */
async function pasarUsuario() {
  if (!gmail.value || !password.value) {
    return Notify.create({ position: "top", type: "negative", message: "Complete todos los campos" });
  }

  try {
    // El Store debe estar usando la instancia 'api' internamente
    const response = await adminStore.inicio(gmail.value.trim(), password.value.trim());
    
    const user = response?.data?.user;
    if (!user) throw new Error("Respuesta inválida del servidor");

    // Validar estado
    if (user.state !== 1) {
      const msg = user.state === 2 ? "Usuario inactivo" : "Estado inválido";
      Notify.create({ position: "top", type: "negative", message: msg, icon: "block" });
      limpiarFormulario();
      return;
    }

    // Guardar en LocalStorage
    const areaId = user.area_id || user.areaId || "";
    localStorage.setItem("token", response.data.token || "");
    localStorage.setItem("userId", user._id || "");
    localStorage.setItem("rol", user.rol?.toString() || "");
    localStorage.setItem("names", user.names || "");
    localStorage.setItem("areaId", areaId);

    Notify.create({ 
      position: "top", 
      type: "positive", 
      message: "Bienvenido " + user.names,
      timeout: 2000 
    });

    limpiarFormulario();
    router.push({ name: "dashboard" });

  } catch (error) {
    console.error("❌ Error Login:", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || "Error de conexión con el servidor";
    
    Notify.create({ position: "top", type: "negative", message: errorMessage });
  }
}

const limpiarFormulario = () => { password.value = ""; gmail.value = ""; };
const abrirModal = () => modalRecuperar.value = true;
const cerrarModal = () => { modalRecuperar.value = false; correoRecuperar.value = ""; };
</script>

<style scoped>
@import url("../style/login.css");
</style>
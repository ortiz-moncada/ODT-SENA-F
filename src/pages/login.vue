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
import router from "../router/index.js";
import { useAdminStore } from "../store/administrador.js";
import axios from "axios";
import { Notify } from "quasar";

const adminStore = useAdminStore();

const gmail = ref("");
const password = ref("");
const state = ref("");
const isPwd = ref(true);
const correoRecuperar = ref("");
const modalRecuperar = ref(false);
const loading = ref(false);

onMounted(() => {
  window.addEventListener("keydown", handleEnter);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEnter);
});

function handleEnter(event) {
  if (event.key === "Enter") {
    pasarUsuario();
  }
}

const enviarCorreo = async () => {
  if (!correoRecuperar.value) {
    Notify.create({
      position: "top",
      type: "warning",
      message: "Por favor ingrese su correo electrónico",
    });
    return;
  }

  loading.value = true;

  try {
    await axios.post("http://localhost:4000/api/email/restablecer", {
      to: correoRecuperar.value,
      subject: "Restablecimiento de contraseña",
    });

    Notify.create({
      position: "top",
      type: "positive",
      message: "Correo de restablecimiento enviado correctamente",
    });

    cerrarModal();
  } catch (error) {
    Notify.create({
      position: "top",
      type: "negative",
      message: "Error al enviar el correo",
    });
  } finally {
    loading.value = false;
  }
};

async function pasarUsuario() {
  try {
    if (!gmail.value || !password.value) {
      Notify.create({
        position: "top",
        type: "negative",
        message: "Por favor complete todos los campos",
      });
      return;
    }

    const cleanGmail = gmail.value.trim();
    const cleanPassword = password.value.trim();

    const response = await adminStore.inicio(cleanGmail, cleanPassword);

    if (!response?.data?.user) {
      Notify.create({
        position: "top",
        type: "negative",
        message: "Error en la respuesta del servidor",
      });
      return;
    }

    const user = response.data.user;
    console.log("👤 Usuario recibido del backend:", user);

    // ✅ VALIDACIÓN DE USUARIO INACTIVO
    if (user.state === 2) {
      console.warn("⚠️ Usuario inactivo intentando iniciar sesión:", user.names);
      
      Notify.create({
        position: "top",
        type: "negative",
        message: "Usuario inactivo. Contacte al administrador para activar su cuenta.",
        timeout: 4000,
        icon: "block",
        color: "negative"
      });

      limpiarFormulario();
      return; // Detener el proceso de login
    }

    // ✅ VALIDACIÓN ADICIONAL: Si state no es 1 (activo)
    if (user.state !== 1) {
      console.warn("⚠️ Usuario con estado inválido:", user.state);
      
      Notify.create({
        position: "top",
        type: "warning",
        message: "Estado de usuario inválido. Contacte al administrador.",
        timeout: 4000,
        icon: "warning"
      });

      limpiarFormulario();
      return;
    }

    // ✅ Usuario ACTIVO - Continuar con el login normal
    console.log("✅ Usuario activo, procediendo con el login");

    // GUARDAR ÁREA CORRECTAMENTE (soporta ambos campos)
    const areaId = user.area_id || user.areaId || "";
    console.log("📍 AreaId a guardar:", areaId);

    localStorage.setItem("areaId", areaId);
    localStorage.setItem("token", response.data.token || "");
    localStorage.setItem("userId", user._id || "");
    localStorage.setItem("rol", user.rol?.toString() || "");
    localStorage.setItem("names", user.names || "");
    localStorage.setItem("state", user.state?.toString() || "1");

    console.log("💾 Datos guardados en localStorage:");
    console.log("  - areaId:", localStorage.getItem("areaId"));
    console.log("  - userId:", localStorage.getItem("userId"));
    console.log("  - rol:", localStorage.getItem("rol"));
    console.log("  - state:", localStorage.getItem("state"));

    Notify.create({
      position: "top",
      type: "positive",
      message: "Bienvenido " + user.names,
      icon: "check_circle",
      timeout: 2000
    });

    limpiarFormulario();

    router.push({ name: "dashboard" });

  } catch (error) {
    console.error("❌ Error completo:", error);
    
    // Manejar error específico de usuario inactivo desde el backend
    if (error.response?.data?.error === "Usuario inactivo") {
      Notify.create({
        position: "top",
        type: "negative",
        message: "Usuario inactivo. Contacte al administrador para activar su cuenta.",
        timeout: 4000,
        icon: "block"
      });
      limpiarFormulario();
      return;
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error al iniciar sesión. Verifica tus credenciales.";

    Notify.create({
      position: "top",
      type: "negative",
      message: errorMessage,
    });
  }
}

const limpiarFormulario = () => {
  password.value = "";
  gmail.value = "";
};

function abrirModal() {
  modalRecuperar.value = true;
}

function cerrarModal() {
  modalRecuperar.value = false;
  correoRecuperar.value = "";
}
</script>

<style scoped>
@import url("../style/login.css");
</style>
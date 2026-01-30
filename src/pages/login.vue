<template>
  <div class="container">
    <div class="contemLogin">
      <div class="design">
        <h1 class="titleImportant">ODT</h1>
        <p class="Ncom">ORGANIZADOR DE TAREAS</p>
      </div>

      <div class="questions">
        <img class="LS" src="../IMG/logosena.png" alt="logoSena" />
        <br />
        <h2 class="title">LOGIN</h2>

        <q-input class="inpt" filled v-model="gmail" label="Tu Usuario" @keydown.enter="pasarUsuario" />
        <br />

        <q-input 
          class="inpt2" 
          v-model="password" 
          filled 
          :type="isPwd ? 'password' : 'text'" 
          label="Tu Contraseña"
          @keydown.enter="pasarUsuario"
        >
          <template v-slot:append>
            <q-icon 
              :name="isPwd ? 'visibility_off' : 'visibility'" 
              class="cursor-pointer" 
              @click="isPwd = !isPwd" 
            />
          </template>
        </q-input>
        <br />

        <p class="RC" @click="abrirModal()">¿Olvidaste tu contraseña?</p>

        <q-btn 
          :loading="adminStore.loading" 
          class="button" 
          @click="pasarUsuario" 
          label="Ingresar" 
        />
      </div>
    </div>

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
        <q-input 
          filled 
          v-model="correoRecuperar" 
          label="Correo electrónico" 
          type="email" 
          clearable 
          class="input-modal" 
        />
      </div>

      <div class="modal-actions">
        <q-btn flat class="closeBTN" label="CERRAR" @click="cerrarModal" />
        <q-btn 
          class="openBTN" 
          label="SIGUIENTE" 
          icon-right="arrow_forward" 
          :loading="loading" 
          @click="enviarCorreo" 
        />
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
import { getCorreo } from "../services/servicesComponent.js";

const router = useRouter();
const adminStore = useAdminStore();

const gmail = ref("");
const password = ref("");
const isPwd = ref(true);
const correoRecuperar = ref("");
const modalRecuperar = ref(false);
const loading = ref(false);

// Manejo de teclado (opcional si ya usas @keydown.enter en q-input)
const handleEnter = (event) => {
  if (event.key === "Enter") pasarUsuario();
};

onMounted(() => window.addEventListener("keydown", handleEnter));
onBeforeUnmount(() => window.removeEventListener("keydown", handleEnter));



const enviarCorreo = async () => {
  if (!correoRecuperar.value) {
    return Notify.create({
      position: "top",
      type: "warning",
      message: "Ingrese su correo electrónico"
    });
  }

  loading.value = true;

  try {
    await getCorreo(correoRecuperar.value);

    Notify.create({
      position: "top",
      type: "positive",
      message: "Correo enviado correctamente"
    });

    cerrarModal();
  } catch (error) {
    Notify.create({
      position: "top",
      type: "negative",
      message: "Error al enviar el correo"
    });
  } finally {
    loading.value = false;
  }
};

async function pasarUsuario() {
  if (!gmail.value || !password.value) {
    return Notify.create({ position: "top", type: "negative", message: "Complete todos los campos" });
  }

  try {
    // 1. Llamar al login
    const response = await adminStore.inicio({
      gmail: gmail.value.trim(),
      password: password.value.trim()
    });
    
    // 2. Extraer datos de la respuesta (ajustar según la estructura de tu backend)
    const token = response.token;
    const user = response.user;

    if (!token || !user) throw new Error("Respuesta inválida del servidor");

    // 3. Validar estado (1 = Activo)
    if (Number(user.state) !== 1) {
      Notify.create({ 
        position: "top", 
        type: "negative", 
        message: "Usuario inactivo. Contacte al administrador.", 
        icon: "block" 
      });
      limpiarFormulario();
      return;
    }

    // 4. GUARDAR TODO EN LOCALSTORAGE (Importante el orden)
    localStorage.setItem("token", token);
    localStorage.setItem("userId", user._id || "");
    localStorage.setItem("rol", user.rol?.toString() || "");
    localStorage.setItem("names", user.names || "");
    localStorage.setItem("areaId", user.area_id || "");

    Notify.create({ 
      position: "top", 
      type: "positive", 
      message: "Bienvenido " + user.names,
      timeout: 2000 
    });

    limpiarFormulario();
    
    // 5. Redirigir
    router.push({ name: "dashboard" });

  } catch (error) {
    console.error("❌ Error Login:", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || "Error al iniciar sesión";
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
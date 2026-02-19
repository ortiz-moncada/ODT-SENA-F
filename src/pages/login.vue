<template>
  <div class="login-page flex flex-center bg-grey-2">
    <q-card flat bordered class="login-card shadow-1">
      <q-card-section class="bg-white text-center q-pt-xl q-pb-md">
        <q-img src="../IMG/logosena.png" style="width: 70px" class="q-mb-md" />
        <div class="text-h5 text-weight-bold text-primary">ODT - ACCESO</div>
        <div class="text-caption text-grey-7 uppercase text-weight-bold" style="letter-spacing: 1px;">Organizador de Tareas</div>
      </q-card-section>

      <q-card-section class="q-px-xl q-pb-xl">
        <q-form @submit="pasarUsuario" class="q-gutter-y-md q-mt-md">
          <q-input
            v-model="gmail"
            label="Correo Electrónico"
            outlined
            dense
            lazy-rules
            :rules="[val => !!val || 'Campo obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" size="20px" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            label="Contraseña"
            outlined
            dense
            lazy-rules
            :rules="[val => !!val || 'Campo obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" size="20px" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
                size="20px"
              />
            </template>
          </q-input>

          <div class="row justify-center">
            <q-btn
              flat
              dense
              color="primary"
              label="¿Olvidó su clave?"
              class="text-caption text-weight-bold"
              @click="abrirModal"
              no-caps
            />
          </div>

          <q-btn
            :loading="adminStore.loading"
            class="full-width q-mt-lg"
            color="primary"
            label="Iniciar Sesión"
            type="submit"
            unelevated
            rounded
          />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- MODAL RECUPERAR CONTRASEÑA -->
    <q-dialog v-model="modalRecuperar" persistent>
      <q-card flat bordered style="min-width: 350px; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-primary">Recuperar Clave</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="cerrarModal" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-body2 text-grey-8 q-mb-md">
            Se enviará un enlace de restablecimiento al correo electrónico vinculado a su cuenta.
          </div>
          <q-input
            outlined
            dense
            v-model="correoRecuperar"
            label="Correo electrónico"
            type="email"
            autofocus
          >
            <template v-slot:prepend>
              <q-icon name="alternate_email" color="primary" size="20px" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-7" @click="cerrarModal" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Enviar Enlace"
            :loading="loading"
            @click="enviarCorreo"
            rounded
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"; 
import { useAdminStore } from "../store/administrador.js";
import { Notify } from "quasar";
import { getCorreo } from "../services/servicesComponent.js";

const router = useRouter();
const adminStore = useAdminStore();

const gmail = ref("");
const password = ref("");
const isPwd = ref(true);
const correoRecuperar = ref("");
const modalRecuperar = ref(false);
const loading = ref(false);

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
    const response = await adminStore.inicio({
      gmail: gmail.value.trim(),
      password: password.value.trim()
    });
    
    const token = response.token;
    const user = response.user;

    if (!token || !user) throw new Error("Respuesta inválida del servidor");

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
.login-page {
  height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
</style>

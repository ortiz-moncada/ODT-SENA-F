<template>
  <div class="reset-page flex flex-center bg-grey-2">
    <q-card flat bordered class="reset-card shadow-1">
      <q-card-section class="bg-white text-center q-pt-xl q-pb-md">
        <q-img src="../IMG/logosena.png" style="width: 70px" class="q-mb-md" />
        <div class="text-h5 text-weight-bold text-primary">ODT - RESTABLECER</div>
        <div class="text-caption text-grey-7 uppercase text-weight-bold" style="letter-spacing: 1px;">Gestión de Seguridad</div>
      </q-card-section>

      <q-card-section class="q-px-xl q-pb-xl">
        <div class="text-center q-mb-lg">
          <p class="text-body2 text-grey-7">Ingrese su nueva contraseña de acceso para recuperar el ingreso a su cuenta.</p>
        </div>

        <q-form @submit="cambiarPassword" class="q-gutter-y-md">
          <q-input
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            label="Nueva Contraseña"
            outlined
            dense
            hint="Mínimo 6 caracteres"
            lazy-rules
            :rules="[val => !!val || 'Campo obligatorio', val => val.length >= 6 || 'Mínimo 6 caracteres']"
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

          <div class="q-mt-xl">
            <q-btn
              :loading="loading"
              class="full-width"
              color="primary"
              label="Actualizar Clave"
              type="submit"
              unelevated
              rounded
            />
            <q-btn
              flat
              color="grey-7"
              label="Regresar al Inicio"
              class="full-width q-mt-md"
              to="/login"
              no-caps
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import api from "../services/api.js";

const route = useRoute();
const router = useRouter();
const password = ref("");
const isPwd = ref(true);
const loading = ref(false);

const cambiarPassword = async () => {
  if (!password.value || password.value.length < 6) {
    return Notify.create({
      type: "warning",
      message: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  loading.value = true;

  try {
    const token = route.params.token;

    await api.post("/users/reset-password-update", {
      token,
      newPassword: password.value,
    });

    Notify.create({
      type: "positive",
      message: "Contraseña actualizada correctamente. Proceda a iniciar sesión.",
      position: "top",
    });

    router.push("/login");
  } catch (error) {
    Notify.create({
      type: "negative",
      message: error.response?.data?.message || "El enlace ha expirado o es inválido",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-page {
  height: 100vh;
}

.reset-card {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
}
</style>

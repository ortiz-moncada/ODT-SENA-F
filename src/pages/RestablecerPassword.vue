<template>
  <div class="q-pa-xl flex flex-center">
    <q-card style="width: 400px">
      <q-card-section>
        <h5 class="text-center">Restablecer contraseña</h5>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="password"
          type="password"
          label="Nueva contraseña"
          outlined
          hint="Mínimo 6 caracteres"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          color="primary"
          label="Actualizar Contraseña"
          :loading="loading"
          @click="cambiarPassword"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import api from "../services/api.js"; // Asegúrate de que apunte a tu axios

const route = useRoute();
const router = useRouter();
const password = ref("");
const loading = ref(false);

const cambiarPassword = async () => {
  // 1. Validaciones básicas
  if (!password.value || password.value.length < 6) {
    return Notify.create({
      type: "warning",
      message: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  loading.value = true;

  try {
    // 2. Extraer el token de la URL (el :token que pusimos en el router)
    const token = route.params.token;

    // 3. Petición al backend
    // Ajusta la URL '/users/reset-password-update' según tu backend
    await api.post("/users/reset-password-update", {
      token: token,
      newPassword: password.value,
    });

    Notify.create({
      type: "positive",
      message: "Contraseña actualizada correctamente. Inicia sesión.",
      position: "top",
    });

    // 4. Redirigir al login
    router.push("/login");

  } catch (error) {
    console.error("Error al restablecer:", error);
    Notify.create({
      type: "negative",
      message: error.response?.data?.message || "Token inválido o expirado",
    });
  } finally {
    loading.value = false;
  }
};
</script>
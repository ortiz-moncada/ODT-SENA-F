<template>
  <div class="containerS">
    <div class="reset-card">
      <div class="imgContainer">
        <img src="../IMG/compu.png" style="max-height: 400px; margin-top: 100px;" alt="compu">
      </div>
      <div class="cardInfo">

        <!-- HEADER -->
        <div class="reset-header">
          <h5>Restablecer contraseña</h5>
          <img class="LSB" src="../IMG/logosena.png" alt="logoSena">
        </div>

        <!-- BODY -->
        <q-card-section class="q-pa-lg">
          <q-input v-model="password" type="password" label="Nueva contraseña" outlined dense
            hint="Mínimo 6 caracteres" />
        </q-card-section>

        <!-- ACTIONS -->
        <q-card-actions align="center" class="q-pb-lg">
          <q-btn class="full-width" style="background: var(--oneColor--); color: var(--white--);"
            label="ACTUALIZAR CONTRASEÑA" :loading="loading" @click="cambiarPassword" />
        </q-card-actions>
      </div>
    </div>
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
      message: "Contraseña actualizada correctamente. Inicia sesión.",
      position: "top",
    });

    router.push("/login");
  } catch (error) {
    Notify.create({
      type: "negative",
      message: error.response?.data?.message || "Token inválido o expirado",
    });
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.reset-card {
  background: var(--white--);
  width: 80%;
  height: 90vh;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 50% 50%;
  box-shadow: rgb(9, 120, 9) 0px 0px 20px 5px;
}


.reset-header {
  color: var(--oneColor--);
}

.LSB {
  position: absolute;
  width: 90px;
  height: auto;
  margin-top: -200px;
  margin-left: -3%;
}

.containerS {
  background-image:url(../IMG/fondo.png);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.imgContainer{
  background: var(--oneColor--);
  border-radius: 10px 0px 0px 10px;
}
.cardInfo{
  text-align: center;
  padding-top: 30%;
}

</style>

<template>
  <div class="contenedorRestablecer">

    <header class="encabezado">
      <h1>RESTABLECIMIENTO DE CONTRASEÑA</h1>
      <img class="imgLS" src="../IMG/logo-sena-blanco.png" alt="logo sena" />
    </header>


    <section class="buscarCorreo">
      <h2>Ingrese su correo electrónico</h2>
      <div class="inputBuscar">
        <i class="icono fas fa-envelope"></i>
        <input v-model="gmail" type="email" placeholder="Correo electrónico" />
        <q-btn :loading="loading" class="btnBuscar" @click="buscarCorreo">BUSCAR</q-btn>
      </div>
    </section>


    <div class="contenedorCajas">

      <div class="cajaUsuario">
        <h2>Datos del Usuario</h2>

        <div class="campo">
          <i class="fas fa-user"></i>
          <input type="text" :value="usuario.names ? usuario.names : 'Nombre de usuario'" disabled />
          <i class="fas fa-lock candado"></i>
        </div>

        <div class="campo">
          <i class="fas fa-id-card"></i>
          <input type="text" :value="usuario.identification ? usuario.identification : 'Numero de identificación'" disabled />
          <i class="fas fa-lock candado"></i>
        </div>

        <div class="campo">
          <i class="fas fa-phone"></i>
          <input type="text" :value="usuario.phone ? usuario.phone : 'Phone' " disabled />
          <i class="fas fa-lock candado"></i>
        </div>

        <div class="campo">
          <i class="fas fa-cube"></i>
          <input type="text" :value="usuario.rol === 3 ? 'Trabajador' : usuario.rol === 2 ? 'Admin' : usuario.rol === 1 ? 'Super Admin': 'Rol del usuario' " disabled />
          <i class="fas fa-lock candado"></i>
        </div>
      </div>


      <div class="cajaNueva">
        <h2>Nueva contraseña</h2>
        <p>
          Por favor, ingresa tu nueva contraseña de usuario para completar el proceso de restablecimiento.
        </p>

        <div class="campo">
          <i class="fas fa-key"></i>
          <input v-model="nuevaContrasena" type="password" placeholder="Nueva contraseña" />
        </div>

        <div class="campo">
          <i class="fas fa-eye-slash"></i>
          <input v-model="confirmarContrasena" type="password" placeholder="Confirmar contraseña" />
        </div>

        <div class="botones">
          <button @click="closeRC" class="btnCerrar">CERRAR</button>
          <q-btn :loading="loading" @click="restablecerContrasena" class="btnRestablecer">RESTABLECER</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import router from "../router";
import { getCorreo, resetPassword } from "../services/servicesComponent.js";
import { Notify } from 'quasar'

const gmail = ref("");
const usuario = ref("");
const nuevaContrasena = ref("");
const confirmarContrasena = ref("");
const loading = ref(false);

async function buscarCorreo() {
  try {
    loading.value = true;
    usuario.value = " ";

    if (!gmail.value) {
      Notify.create({
        position:"top",
        type: 'negative',
        message: 'Por favor complete todos los campos'
      })
      return;
    }else{
       Notify.create({
      position:"top",
      type: 'positive',
      message: 'Usuario encontrado con exito'
    })
    }
    loading.value = false;
    const data = await getCorreo(gmail.value);
    usuario.value = data;
  } catch (error) {
     Notify.create({
        position:"top",
        type: 'negative',
        message: 'No se encontro un usuario con ese correo'
      })
    console.error("Error al buscar correo:", error);
  }
}

// RESTABLECER CONTRASEÑA 
async function restablecerContrasena() {

  if (!nuevaContrasena.value || !confirmarContrasena.value) {
    Notify.create({
        position:"top",
        type: 'negative',
        message: 'Por favor complete todos los campos'
      })
    return;
  }
  
  if (nuevaContrasena.value !== confirmarContrasena.value) {
     Notify.create({
        position:"top",
        type: 'negative',
        message: 'Las contraseñas no coinsiden '
      })
    return;
  }
  
  if (nuevaContrasena.value.length < 6) {
    Notify.create({
        position:"top",
        type: 'negative',
        message: 'la contraseña debe tener almenos 6 caracteres'
      })
    return;
  }

  try {
    loading.value = true;
    console.log(" Restableciendo contraseña...");
    console.log(" Usuario ID:", usuario.value._id);
    

    await resetPassword(usuario.value._id, nuevaContrasena.value);
    
    console.log(" Contraseña restablecida exitosamente");
loading.value = false;
    Notify.create({
      position:"top",
      type: 'positive',
      message: 'Contraseña restablecida exitosamente'
    })
    
    router.push({ name: "login" });
    
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
     Notify.create({
        position:"top",
        type: 'negative',
        message: 'Error al restablecer contraseña'
      })
  }
}

function closeRC() {
  router.push({ name: "login" });
}
</script>

<style>
@import url(../style/RContraseña.css);
</style>
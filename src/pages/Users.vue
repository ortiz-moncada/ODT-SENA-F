<template>
  <!-- ================= OVERLAY ================= -->
  <div v-if="showCreate || showEditModal || showDetails" class="overlay"></div>

  <!-- ================= MODAL CREAR USUARIO ================= -->
  <div v-if="showCreate" class="modal">

    <div class="modal-header">
      <h2>Crear Usuario</h2>
    </div>

    <div class="modal-body">
      <div class="form-grid">

        <!-- COLUMNA IZQUIERDA -->
        <div class="form-col">
          <q-input filled v-model="name" label="Nombre de usuario" />
          <q-input filled v-model="identification" label="Cédula" />
          <q-input filled v-model="phone" label="Celular" />
          <q-input filled v-model="gmail" label="Correo electrónico" />
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="form-col">
          <q-select filled v-model="model" :options="Rol" label="Rol" />
          <q-input filled v-model="password" type="password" label="Contraseña" />
          <q-input filled v-model="confirmPassword" type="password" label="Confirmar contraseña" />

          <q-select
            v-if="model && model.value === 3 && userLog?.rol !== 2"
            filled
            v-model="selectedArea"
            :options="areas"
            option-label="label"
            option-value="value"
            label="Área"
            clearable
          />
        </div>

      </div>
    </div>

    <div class="modal-footer">
      <q-btn
        :loading="loading"
        label="CREAR"
        style="background: var(--oneColor--); color: white"
        @click="crearUser"
      />
      <q-btn
        flat
        label="CANCELAR"
        style="background: var(--sevenColor--); color: white"
        @click="cerrarModal"
      />
    </div>

  </div>

  <!-- ================= MODAL EDITAR USUARIO ================= -->
  <div v-if="showEditModal" class="modal">

    <div class="modal-header">
      <h2>Editar Usuario</h2>
    </div>

    <div class="modal-body">
      <div class="form-grid">

        <div class="form-col">
          <q-input filled v-model="editForm.names" label="Nombre" />
          <q-input filled v-model="editForm.identification" label="Cédula" />
          <q-input filled v-model="editForm.phone" label="Celular" />
        </div>

        <div class="form-col">
          <q-select filled v-model="editForm.rol" :options="RolEdit" label="Rol" />
          <q-input filled v-model="editForm.gmail" label="Correo" />
          <q-input
            filled
            v-model="editForm.password"
            type="password"
            label="Nueva contraseña (opcional)"
          />

          <q-select
            v-if="editForm.rol && editForm.rol.value === 3 && userLog?.rol !== 2"
            filled
            v-model="editForm.selectedArea"
            :options="areas"
            label="Área"
            clearable
          />
        </div>

      </div>
    </div>

    <div class="modal-footer">
      <q-btn
        :loading="loading"
        label="ACTUALIZAR"
        style="background: var(--oneColor--); color: white"
        @click="actualizarUsuario"
      />
      <q-btn
        flat
        label="CERRAR"
        style="background: var(--sevenColor--); color: white"
        @click="cerrarModalEditar"
      />
    </div>
  </div>

  <!-- ================= MODAL DETALLES ================= -->
  <div v-if="showDetails" class="modal-details">

    <div class="modal-header-details">
      <h2>Detalles del Usuario</h2>
    </div>

    <div class="modal-body-details">
      <div class="details-grid">

        <!-- INFO PERSONAL -->
        <div class="card">
          <h3 class="card-title">
            Información Personal
            <img src="https://cdn-icons-png.flaticon.com/128/8237/8237612.png" />
          </h3>
          <p><span>Nombre:</span> {{ selectedUser.names }}</p>
          <p><span>Cédula:</span> {{ selectedUser.identification }}</p>
        </div>

        <!-- CONTACTO -->
        <div class="card">
          <h3 class="card-title">
            Contacto
            <img src="https://cdn-icons-png.flaticon.com/128/4350/4350908.png" />
          </h3>
          <p><span>Correo:</span> {{ selectedUser.gmail }}</p>
          <p><span>Teléfono:</span> {{ selectedUser.phone }}</p>
        </div>

        <!-- INFO LABORAL -->
        <div class="card">
          <h3 class="card-title">
            Información Laboral
            <img src="https://cdn-icons-png.flaticon.com/128/9901/9901586.png" />
          </h3>
          <p><span>Área:</span> {{ selectedUser.areaName || 'Sin área' }}</p>
          <p><span>Rol:</span> {{ getRolName(selectedUser.rol) }}</p>

          <div class="estado">
            <span>Estado:</span>
            <q-chip
              :label="stateMap[selectedUser.state]?.label"
              :color="stateMap[selectedUser.state]?.color"
              text-color="white"
              size="sm"
            />
          </div>
        </div>

      </div>
    </div>

    <div class="modal-footer-details">
      <q-btn
        label="CERRAR"
        style="background: var(--sevenColor--); color: white"
        @click="showDetails = false"
      />
    </div>

  </div>

  <!-- ================= LISTADO ================= -->
  <Layouts_main>
    <h1 style="text-align: center;" :style="{ color: 'var(--oneColor--)' }">USUARIOS</h1>
    <hr><br>

    <div class="header-principal">
      <q-input
        v-model="search"
        dense
        outlined
        style="max-width: 400px"
        label="BUSCAR USUARIO"
      >
        <template v-slot:append>
          <q-btn flat dense round>
            <img
              src="https://upload.wikimedia.org/wikipedia/meta/thumb/7/7e/Vector_search_icon.svg/1890px-Vector_search_icon.svg.png"
              style="width: 18px"
            />
          </q-btn>
        </template>
      </q-input>

      <q-btn-dropdown :label="ordenarLabel">
        <q-list>
          <q-item clickable v-close-popup @click="setOrden('asc', 'A → Z')">
            <q-item-section>A → Z</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="setOrden('desc', 'Z → A')">
            <q-item-section>Z → A</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn-dropdown :label="estadoLabel">
        <q-list>
          <q-item clickable v-close-popup @click="setEstado(1, 'Activos')">
            <q-item-section>Activos</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="setEstado(2, 'Inactivos')">
            <q-item-section>Inactivos</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn
        :style="{ backgroundColor: 'var(--twoColor--)', color: 'white' }"
        label="CREAR +"
        @click="abrirModal"
      />
    </div>

    <div class="q-pa-md">
      <q-table
        flat
        bordered
        :rows="filteredUsers"
        :columns="columns"
        row-key="_id"
        v-model:pagination="pagination"
        :rows-per-page-options="[0]"
        :no-data-label="' '"
      >

        <template v-slot:body-cell-opcions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              size="sm"
              :color="props.row.state === 1 ? 'negative' : 'green'"
              :icon="props.row.state === 1 ? 'close' : 'check'"
              round dense
              @click="toggleEstado(props.row)"
            />
            <q-btn size="sm" color="primary" icon="edit" round dense
              @click="editarUsuario(props.row)" />
            <q-btn size="sm" color="secondary" icon="visibility" round dense
              @click="verDetalles(props.row)" />
          </q-td>
        </template>

        <template v-slot:body-cell-state="props">
          <q-td :props="props">
            <q-chip
              :label="stateMap[props.row.state]?.label"
              :color="stateMap[props.row.state]?.color"
              text-color="white"
              size="sm"
            />
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width column flex-center text-grey-7 q-pa-lg">
            <img src="../IMG/pregunta (1).png" style="max-width: 15%" />
            <h5 v-if="userData.length === 0">No hay usuarios registrados</h5>
            <h5 v-else>No hay usuarios con los filtros aplicados</h5>
          </div>
        </template>

      </q-table>
    </div>

  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { onMounted, ref, watch, computed } from 'vue'
import { registerUser, getUser, putUserAll, getArea } from '../services/servicesComponent.js'
import { Notify } from 'quasar'

const fromUsers = ref(false)
const showDetails = ref(false)
const showEditModal = ref(false)
const selectedUser = ref({})
const userLog = ref(null)
const dense = ref(true)
const isPwd = ref(true)
const isPwdEdit = ref(true)
const name = ref('')
const model = ref(null)
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const identification = ref('')
const gmail = ref('')
const search = ref('')
const userData = ref([])
const areas = ref([])
const selectedArea = ref(null)
const refreshKey = ref(0)
const filtroEstado = ref(null)
const orden = ref("asc")
const ordenarLabel = ref('Ordenar')
const estadoLabel = ref("Estado")
const loading = ref(false)
const showCreate = ref(false)

const setOrden = (valor, texto) => {
  orden.value = valor
  ordenarLabel.value = texto

}
const setEstado = (valor, texto) => {
  filtroEstado.value = valor
  estadoLabel.value = texto

}

// Formulario de edición
const editForm = ref({
  _id: '',
  names: '',
  identification: '',
  gmail: '',
  phone: '',
  password: '',
  rol: null,
  selectedArea: null,
  state: 1
})

const stateMap = {
  1: { label: "Activo", color: "green" },
  2: { label: "Inactivo", color: "red" }
}

const Rol = computed(() => {
  if (userLog.value?.rol === 2) {
    return [{ label: "Trabajador", value: 3 }]
  }
  return [
    { label: "Administrador", value: 2 },
    { label: "Trabajador", value: 3 }
  ]
})

const RolEdit = computed(() => {
  if (userLog.value?.rol === 2) {
    return [{ label: "Trabajador", value: 3 }]
  }
  return [
    { label: "Administrador", value: 2 },
    { label: "Trabajador", value: 3 }
  ]
})


const filteredUsers = computed(() => {
  let lista = userData.value;

  if (search.value) {
    const term = search.value.toLowerCase();
    lista = lista.filter(user => {
      return (
        user.names?.toLowerCase().includes(term) ||
        user.identification?.toString().toLowerCase().includes(term) ||
        user.phone?.toString().toLowerCase().includes(term) ||
        user.gmail?.toLowerCase().includes(term)
      );
    });
  }

  if (filtroEstado.value) {
    lista = lista.filter(user => user.state === filtroEstado.value);
  }

  lista.sort((a, b) => {
    const A = a.names.toLowerCase();
    const B = b.names.toLowerCase();
    return orden.value === "asc" ? A.localeCompare(B) : B.localeCompare(A);
  })
  return lista;
});

const pagination = ref({
  rowsPerPage: 0
})

onMounted(async () => {
  userLog.value = JSON.parse(localStorage.getItem("user"));
  console.log("👉 Usuario logueado:", userLog.value);

  try {
    const resAreas = await getArea();
    areas.value = resAreas.map((area) => ({
      label: area.name,
      value: area._id
    }));

    const res = await getUser();
    console.log("📦 Datos recibidos del backend:", res);

    let usuarios = res.map((user, index) => ({
      ...user,
      index: index + 1,
      areaName: user.areaName || 'Sin área',
      areaDescription: user.areaDescription || 'Sin descripción'
    }));

    console.log("✅ Usuarios procesados:", usuarios);

    if (userLog.value?.rol === 2) {
      usuarios = usuarios.filter(u => u.areaId === userLog.value.areaId);
    }

    userData.value = usuarios;
  } catch (error) {
    Notify.create({
      position: "top",
      type: 'negative',
      message: 'Error al cargar usuarios'
    });
    console.error("Error al cargar usuarios:", error);
  }
});

watch(model, (newValue) => {
  if (!newValue || newValue.value !== 3) {
    selectedArea.value = null
  }
})

watch(() => editForm.value.rol, (newValue) => {
  if (!newValue || newValue.value !== 3) {
    editForm.value.selectedArea = null
  }
})

const abrirModal = () => {
  fromUsers.value = true
  showCreate.value = true;
}

const cerrarModal = () => {
  limpiarFormulario()
  fromUsers.value = false
  showCreate.value = false;
}

const cerrarModalEditar = () => {
  showEditModal.value = false
  limpiarFormularioEditar()
  showCreate.value = false;
}

const crearUser = async () => {
  try {
    if (!name.value || !gmail.value || !phone.value || !password.value || !identification.value) {
      Notify.create({ position: "top", type: 'negative', message: 'Por favor completa todos los campos obligatorios' });
      return;
    }

    if (password.value !== confirmPassword.value) {
      Notify.create({ position: "top", type: 'negative', message: 'Las contraseñas no coinciden' });
      return;
    }

    if (!model.value) {
      Notify.create({ position: "top", type: 'negative', message: 'Por favor seleccione un rol' });
      return;
    }

    if (model.value.value === 3) {
      if (userLog.value?.rol === 2 && !userLog.value.areaId) {
        Notify.create({ position: "top", type: 'negative', message: 'Error: el admin no tiene área asignada' });
        return;
      } else if (userLog.value?.rol !== 2 && !selectedArea.value?.value) {
        Notify.create({ position: "top", type: 'negative', message: 'Por favor seleccionar un área' });
        return;
      }
    }

    loading.value = true;

    const payload = {
      data: {
        names: name.value.trim(),
        identification: identification.value.trim(),
        gmail: gmail.value.trim(),
        phone: String(phone.value), 
        password: password.value,
        rol: model.value.value,
        state: 1
      }
    };

    if (model.value.value === 3) {
      payload.data.areaId = userLog.value?.rol === 2 
        ? userLog.value.areaId 
        : selectedArea.value.value;
    }


    console.log("Enviando a registro:", payload);
    await registerUser(payload);

    Notify.create({
      position: "top",
      type: 'positive',
      message: 'Usuario creado con éxito'
    });

    const res = await getUser();
    userData.value = res.map((user, index) => ({
      ...user,
      index: index + 1,
      areaName: user.areaName || 'Sin área'
    }));

    refreshKey.value++;
    cerrarModal(); 

  } catch (error) {
    console.error("Error al crear usuario:", error.response?.data);

    const errorMsg = error.response?.data?.errors?.[0]?.msg || 
                     error.response?.data?.errors?.[0]?.mensaje || 
                     'Error al crear usuario';

    Notify.create({
      position: "top",
      type: 'negative',
      message: errorMsg
    });
  } finally {
    loading.value = false;
  }
}

const editarUsuario = (usuario) => {
  showCreate.value = true;
  console.log("📝 Editando usuario:", usuario);

  let areaActual = null;
  if (usuario.areaId && areas.value.length > 0) {
    areaActual = areas.value.find(a => a.value === usuario.areaId);
  }

  let rolActual = null;
  if (usuario.rol === 2) {
    rolActual = { label: "Administrador", value: 2 };
  } else if (usuario.rol === 3) {
    rolActual = { label: "Trabajador", value: 3 };
  }

  editForm.value = {
    _id: usuario._id,
    names: usuario.names,
    identification: usuario.identification,
    gmail: usuario.gmail,
    phone: usuario.phone,
    password: '',
    rol: rolActual,
    selectedArea: areaActual,
    state: usuario.state
  };

  showEditModal.value = true;
}

const actualizarUsuario = async () => {
  try {
    loading.value = true;
    if (!editForm.value.names || !editForm.value.gmail || !editForm.value.phone || !editForm.value.identification) {
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Por favor completa todos los campos obligatorios'
      });
      return;
    }

    if (!editForm.value.rol) {
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Por favor seleccione un rol'
      });
      return;
    }

    if (editForm.value.rol.value === 3) {
      if (userLog.value?.rol === 2) {
        if (!userLog.value.areaId) {
          Notify.create({
            position: "top",
            type: 'negative',
            message: 'Error: el admin no tiene área asignada'
          });
          return;
        }
      } else {
        if (!editForm.value.selectedArea?.value) {
          Notify.create({
            position: "top",
            type: 'negative',
            message: 'Por favor seleccionar un área'
          });
          return;
        }
      }
    }

    const dataUpdate = {
      names: editForm.value.names.trim(),
      identification: editForm.value.identification.trim(),
      gmail: editForm.value.gmail.trim(),
      phone: Number(editForm.value.phone),
      rol: editForm.value.rol.value,
      state: editForm.value.state
    };

    if (editForm.value.password && editForm.value.password.trim() !== '') {
      dataUpdate.password = editForm.value.password;
    }

    if (editForm.value.rol.value === 3) {
      if (userLog.value?.rol === 2) {
        dataUpdate.areaId = userLog.value.areaId;
      } else {
        dataUpdate.areaId = editForm.value.selectedArea.value;
      }
    } else {
      dataUpdate.areaId = null;
    }

    console.log("📤 Datos a actualizar:", dataUpdate);

    await putUserAll(editForm.value._id, dataUpdate);

    Notify.create({
      position: "top",
      type: 'positive',
      message: 'Usuario actualizado con éxito'
    });

    const res = await getUser();
    userData.value = res.map((user, index) => ({
      ...user,
      index: index + 1,
      areaName: user.areaName || 'Sin área',
      areaDescription: user.areaDescription || 'Sin descripción'
    }));

    if (userLog.value?.rol === 2) {
      userData.value = userData.value.filter(u => u.areaId === userLog.value.areaId);
    }
    loading.value = false;

    refreshKey.value++;
    cerrarModalEditar();

  } catch (error) {
    Notify.create({
      position: "top",
      type: 'negative',
      message: error.response?.data?.error || 'Error al actualizar usuario'
    });
    console.error("Error al actualizar usuario:", error);
  }
}

const getRolName = (rol) => {
  switch (rol) {
    case 1: return 'Super Administrador';
    case 2: return 'Administrador';
    case 3: return 'Trabajador';
    default: return 'Desconocido';
  }
}

// ✅ FUNCIÓN CORREGIDA: Solo envía el campo "state"
const toggleEstado = async (usuario) => {
  try {
    const nuevoEstado = usuario.state === 1 ? 2 : 1;

    console.log(`🔄 Cambiando estado de ${usuario.names} de ${usuario.state} a ${nuevoEstado}`);

    // ✅ SOLO ENVIAR EL ESTADO - NO TODA LA DATA DEL USUARIO
    const dataUpdate = {
      state: nuevoEstado
    };

    await putUserAll(usuario._id, dataUpdate);

    // Actualizar localmente
    usuario.state = nuevoEstado;

    Notify.create({
      position: "top",
      type: 'positive',
      message: `Usuario ${usuario.names} ahora está ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}`
    });

    refreshKey.value++;

  } catch (error) {
    console.error("❌ Error al cambiar estado:", error);
    Notify.create({
      position: "top",
      type: 'negative',
      message: 'Error al actualizar el estado'
    });
  }
}

const verDetalles = (usuario) => {
  selectedUser.value = usuario;
  showDetails.value = true;
}

const limpiarFormulario = () => {
  name.value = '';
  model.value = null;
  phone.value = '';
  password.value = '';
  confirmPassword.value = '';
  identification.value = '';
  gmail.value = '';
  selectedArea.value = null;
}

const limpiarFormularioEditar = () => {
  editForm.value = {
    _id: '',
    names: '',
    identification: '',
    gmail: '',
    phone: '',
    password: '',
    rol: null,
    selectedArea: null,
    state: 1
  };
}

const columns = [
  { name: 'index', label: '#', field: (row) => row.index, align: 'center' },
  { name: 'names', label: 'Nombre', field: 'names', align: 'center', sortable: true },
  { name: 'identification', label: 'Documento', field: 'identification', align: 'center', sortable: true },
  { name: 'gmail', label: 'Correo', field: 'gmail', sortable: true },
  { name: 'phone', label: 'Teléfono', field: 'phone' },
  { name: 'area', label: 'Área', field: 'areaName', align: 'center' },
  { name: 'rol', label: 'Rol', field: (row) => getRolName(row.rol) },
  { name: 'state', label: 'Estado' },
  { name: 'opcions', label: 'Opciones' }
]
</script>

<style scoped>
@import url(../style/Users.css);
</style>
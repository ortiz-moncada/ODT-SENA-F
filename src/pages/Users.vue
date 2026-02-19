<template>
  <Layouts_main>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-weight-bold text-primary q-my-none">GESTIÓN DE USUARIOS</h1>
        <div class="text-caption text-grey-7">Administra los accesos y roles del personal vinculado.</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="person_add"
          label="Nuevo Usuario"
          @click="abrirModal"
          unelevated
          rounded
        />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-4">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Buscar por nombre, documento o correo..."
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" size="20px" />
            </template>
          </q-input>
        </div>

        <div class="col-6 col-sm-3">
          <q-btn-dropdown
            outline
            color="grey-7"
            :label="ordenarLabel"
            class="full-width"
            icon="sort_by_alpha"
          >
            <q-list dense>
              <q-item clickable v-close-popup @click="setOrden('asc', 'Nombre: A → Z')">
                <q-item-section>A → Z</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setOrden('desc', 'Nombre: Z → A')">
                <q-item-section>Z → A</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <div class="col-6 col-sm-3">
          <q-btn-dropdown
            outline
            color="grey-7"
            :label="estadoLabel"
            class="full-width"
            icon="filter_list"
          >
            <q-list dense>
              <q-item clickable v-close-popup @click="setEstado(null, 'Todos los Estados')">
                <q-item-section>Ver Todos</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setEstado(1, 'Solo Activos')">
                <q-item-section>Solo Activos</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setEstado(2, 'Solo Inactivos')">
                <q-item-section>Solo Inactivos</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="filteredUsers"
      :columns="columns"
      row-key="_id"
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 50, 0]"
      class="q-mb-md"
      :loading="loading"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="40px" color="primary" />
        </q-inner-loading>
      </template>

      <template v-slot:body-cell-opcions="props">
        <q-td :props="props" class="q-gutter-xs text-center">
          <q-btn
            size="sm"
            flat
            round
            :color="props.row.state === 1 ? 'negative' : 'positive'"
            :icon="props.row.state === 1 ? 'person_off' : 'person_add'"
            @click="toggleEstado(props.row)"
          >
            <q-tooltip>{{ props.row.state === 1 ? 'Inhabilitar' : 'Habilitar' }}</q-tooltip>
          </q-btn>
          <q-btn
            size="sm"
            flat
            round
            color="primary"
            icon="edit"
            @click="editarUsuario(props.row)"
          >
            <q-tooltip>Editar Datos</q-tooltip>
          </q-btn>
          <q-btn
            size="sm"
            flat
            round
            color="secondary"
            icon="visibility"
            @click="verDetalles(props.row)"
          >
            <q-tooltip>Ver Ficha Técnica</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-state="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :label="stateMap[props.row.state]?.label"
            :color="stateMap[props.row.state]?.color"
            text-color="white"
            size="sm"
            class="text-weight-bold"
            dense
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width column flex-center text-grey-7 q-pa-xl">
          <q-icon name="person_search" size="64px" color="grey-4" />
          <div class="text-h6 q-mt-md text-weight-regular">
            {{ userData.length === 0 ? 'No hay usuarios en la base de datos' : 'Sin resultados para la búsqueda' }}
          </div>
        </div>
      </template>
    </q-table>

    <!-- MODAL CREAR / EDITAR USUARIO -->
    <q-dialog v-model="showCreateOrEdit" persistent transition-show="scale" transition-hide="scale">
      <q-card flat bordered style="width: 700px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="bg-white text-primary row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ isEditing ? 'Actualizar Información' : 'Registro de Nuevo Usuario' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="cerrarModal" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input outlined v-model="form.names" label="Nombre completo" class="q-mb-sm" dense />
              <q-input outlined v-model="form.identification" label="Número de documento" class="q-mb-sm" dense />
              <q-input outlined v-model="form.phone" label="Número telefónico" class="q-mb-sm" dense />
              <q-input outlined v-model="form.gmail" label="Correo institucional" class="q-mb-sm" dense />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                outlined
                v-model="form.rol"
                :options="RolOptions"
                label="Asignar Perfil/Rol"
                class="q-mb-sm"
                dense
              />
              <q-input
                outlined
                v-model="form.password"
                :type="isPwd ? 'password' : 'text'"
                label="Clave de acceso"
                class="q-mb-sm"
                dense
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <q-input
                v-if="!isEditing"
                outlined
                v-model="confirmPassword"
                :type="isPwd ? 'password' : 'text'"
                label="Repetir clave"
                class="q-mb-sm"
                dense
              />

              <q-select
                v-if="form.rol && form.rol.value === 3 && userLog?.rol !== 2"
                outlined
                v-model="form.selectedArea"
                :options="areas"
                label="Vincular a Dependencia"
                class="q-mb-sm"
                clearable
                dense
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-7" @click="cerrarModal" v-close-popup />
          <q-btn
            unelevated
            :label="isEditing ? 'Actualizar' : 'Guardar Registro'"
            color="primary"
            :loading="loading"
            @click="isEditing ? actualizarUsuario() : crearUser()"
            rounded
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL DETALLES - SIN AVATAR CIRCULAR -->
    <q-dialog v-model="showDetails">
      <q-card flat bordered style="width: 450px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-md">
          <div class="text-h6 text-weight-bold text-primary">Ficha de Usuario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-px-xl q-pb-lg">
          <div class="column items-center q-mb-lg">
            <q-icon name="account_box" size="64px" color="primary" class="q-mb-sm" />
            <div class="text-h5 text-weight-bold text-grey-9 text-center">{{ selectedUser.names }}</div>
            <div class="text-caption text-weight-bold text-primary text-uppercase">{{ getRolName(selectedUser.rol) }}</div>
          </div>

          <q-list separator class="rounded-borders border-grey-3">
            <q-item class="q-py-md">
              <q-item-section avatar><q-icon name="badge" color="primary" size="20px" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-uppercase text-weight-bold" style="font-size: 10px;">Identificación</q-item-label>
                <q-item-label class="text-weight-medium">{{ selectedUser.identification }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section avatar><q-icon name="email" color="primary" size="20px" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-uppercase text-weight-bold" style="font-size: 10px;">Correo</q-item-label>
                <q-item-label class="text-weight-medium text-lowercase">{{ selectedUser.gmail }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section avatar><q-icon name="phone" color="primary" size="20px" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-uppercase text-weight-bold" style="font-size: 10px;">Teléfono</q-item-label>
                <q-item-label class="text-weight-medium">{{ selectedUser.phone }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section avatar><q-icon name="business" color="primary" size="20px" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-uppercase text-weight-bold" style="font-size: 10px;">Dependencia</q-item-label>
                <q-item-label class="text-weight-medium">{{ selectedUser.areaName || 'Sin área asignada' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row justify-center q-mt-lg">
            <q-chip
              :label="stateMap[selectedUser.state]?.label"
              :color="stateMap[selectedUser.state]?.color"
              text-color="white"
              class="text-weight-bold q-px-md"
            />
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-lg">
          <q-btn flat label="Cerrar ventana" color="primary" v-close-popup class="q-px-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { onMounted, ref, computed } from 'vue'
import { registerUser, getUser, putUserAll, getArea } from '../services/servicesComponent.js'
import { Notify } from 'quasar'

const showDetails = ref(false)
const showCreateOrEdit = ref(false)
const isEditing = ref(false)
const selectedUser = ref({})
const userLog = ref(null)
const isPwd = ref(true)
const confirmPassword = ref('')
const search = ref('')
const userData = ref([])
const areas = ref([])
const filtroEstado = ref(null)
const orden = ref("asc")
const ordenarLabel = ref('Ordenar Nombre')
const estadoLabel = ref("Filtrar por Estado")
const loading = ref(false)

const form = ref({
  names: '',
  identification: '',
  gmail: '',
  phone: '',
  password: '',
  rol: null,
  selectedArea: null,
  state: 1
})

const setOrden = (valor, texto) => {
  orden.value = valor
  ordenarLabel.value = texto
}

const setEstado = (valor, texto) => {
  filtroEstado.value = valor
  estadoLabel.value = texto
}

const stateMap = {
  1: { label: "Activo", color: "positive" },
  2: { label: "Inactivo", color: "negative" }
}

const RolOptions = computed(() => {
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
  rowsPerPage: 10
})

onMounted(async () => {
  userLog.value = JSON.parse(localStorage.getItem("user"));
  await refreshUsers();
});

const abrirModal = () => {
  isEditing.value = false;
  limpiarFormulario();
  showCreateOrEdit.value = true;
}

const cerrarModal = () => {
  showCreateOrEdit.value = false;
  limpiarFormulario();
}

const crearUser = async () => {
  try {
    if (!form.value.names || !form.value.gmail || !form.value.phone || !form.value.password || !form.value.identification) {
      Notify.create({ position: "top", type: 'negative', message: 'Complete todos los campos obligatorios' });
      return;
    }

    if (form.value.password !== confirmPassword.value) {
      Notify.create({ position: "top", type: 'negative', message: 'Las contraseñas no coinciden' });
      return;
    }

    if (!form.value.rol) {
      Notify.create({ position: "top", type: 'negative', message: 'Seleccione un rol' });
      return;
    }

    loading.value = true;

    const payload = {
      data: {
        names: form.value.names.trim(),
        identification: form.value.identification.trim(),
        gmail: form.value.gmail.trim(),
        phone: String(form.value.phone), 
        password: form.value.password,
        rol: form.value.rol.value,
        state: 1
      }
    };

    if (form.value.rol.value === 3) {
      payload.data.areaId = userLog.value?.rol === 2 
        ? userLog.value.areaId 
        : form.value.selectedArea?.value;
    }

    await registerUser(payload);
    Notify.create({ position: "top", type: 'positive', message: 'Usuario registrado con éxito' });
    
    await refreshUsers();
    cerrarModal(); 

  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Error al procesar el registro';
    Notify.create({ position: "top", type: 'negative', message: errorMsg });
  } finally {
    loading.value = false;
  }
}

const editarUsuario = (usuario) => {
  isEditing.value = true;
  form.value = {
    _id: usuario._id,
    names: usuario.names,
    identification: usuario.identification,
    gmail: usuario.gmail,
    phone: usuario.phone,
    password: '',
    rol: usuario.rol === 2 ? { label: "Administrador", value: 2 } : { label: "Trabajador", value: 3 },
    selectedArea: areas.value.find(a => a.value === usuario.areaId),
    state: usuario.state
  };
  showCreateOrEdit.value = true;
}

const actualizarUsuario = async () => {
  try {
    loading.value = true;
    const dataUpdate = {
      names: form.value.names.trim(),
      identification: form.value.identification.trim(),
      gmail: form.value.gmail.trim(),
      phone: Number(form.value.phone),
      rol: form.value.rol.value,
      state: form.value.state
    };

    if (form.value.password) dataUpdate.password = form.value.password;
    if (form.value.rol.value === 3) {
      dataUpdate.areaId = userLog.value?.rol === 2 ? userLog.value.areaId : form.value.selectedArea?.value;
    }

    await putUserAll(form.value._id, dataUpdate);
    Notify.create({ position: "top", type: 'positive', message: 'Datos actualizados correctamente' });
    
    await refreshUsers();
    cerrarModal();

  } catch (error) {
    Notify.create({ position: "top", type: 'negative', message: 'Error al actualizar información' });
  } finally {
    loading.value = false;
  }
}

const refreshUsers = async () => {
  try {
    loading.value = true;
    const resAreas = await getArea();
    areas.value = resAreas.map((area) => ({
      label: area.name,
      value: area._id
    }));

    const res = await getUser();
    let usuarios = res.map((user, index) => ({
      ...user,
      index: index + 1,
      areaName: user.areaName || 'Sin área'
    }));

    if (userLog.value?.rol === 2) {
      usuarios = usuarios.filter(u => u.areaId === userLog.value.areaId);
    }

    userData.value = usuarios;
  } finally {
    loading.value = false;
  }
}

const toggleEstado = async (usuario) => {
  try {
    const nuevoEstado = usuario.state === 1 ? 2 : 1;
    await putUserAll(usuario._id, { state: nuevoEstado });
    usuario.state = nuevoEstado;
    Notify.create({ 
      position: "top", 
      type: 'positive', 
      message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'inhabilitado'} exitosamente` 
    });
  } catch (error) {
    Notify.create({ position: "top", type: 'negative', message: 'Error al cambiar estado de acceso' });
  }
}

const verDetalles = (usuario) => {
  selectedUser.value = usuario;
  showDetails.value = true;
}

const getRolName = (rol) => {
  switch (rol) {
    case 1: return 'Super Administrador';
    case 2: return 'Administrador';
    case 3: return 'Trabajador';
    default: return 'Perfil No Definido';
  }
}

const limpiarFormulario = () => {
  form.value = { names: '', identification: '', gmail: '', phone: '', password: '', rol: null, selectedArea: null, state: 1 };
  confirmPassword.value = '';
}

const columns = [
  { name: 'names', label: 'NOMBRE COMPLETO', field: 'names', align: 'left', sortable: true },
  { name: 'identification', label: 'DOCUMENTO', field: 'identification', align: 'center' },
  { name: 'gmail', label: 'CORREO ELECTRÓNICO', field: 'gmail', align: 'left' },
  { name: 'area', label: 'DEPENDENCIA', field: 'areaName', align: 'center' },
  { name: 'state', label: 'ESTADO', align: 'center' },
  { name: 'opcions', label: 'ACCIONES', align: 'center' }
]
</script>

<style scoped>
</style>

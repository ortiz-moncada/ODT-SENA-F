<template>
  <Layouts_main>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-weight-bold text-primary q-my-none">ÁREAS</h1>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Crear Área"
          @click="abrirModalCrear"
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
            placeholder="Buscar área..."
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
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
            <q-list>
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
            <q-list>
              <q-item clickable v-close-popup @click="setEstado(null, 'Todos los Estados')">
                <q-item-section>Todos</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setEstado(1, 'Activas')">
                <q-item-section>Activas</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setEstado(2, 'Inactivas')">
                <q-item-section>Inactivas</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="filteredAreas"
      :columns="columns"
      row-key="_id"
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 50, 0]"
      :loading="loading"
      loading-label="Cargando información de áreas..."
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
            :icon="props.row.state === 1 ? 'block' : 'check_circle'"
            @click="toggleEstado(props.row)"
          >
            <q-tooltip>{{ props.row.state === 1 ? 'Desactivar' : 'Activar' }}</q-tooltip>
          </q-btn>
          <q-btn
            size="sm"
            flat
            round
            color="primary"
            icon="edit"
            @click="editarArea(props.row)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            size="sm"
            flat
            round
            color="secondary"
            icon="visibility"
            @click="verDetalles(props.row)"
          >
            <q-tooltip>Ver Detalles</q-tooltip>
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
          <q-icon name="business" size="64px" color="grey-4" />
          <div class="text-h6 q-mt-md text-weight-regular">
            {{ areasData.length === 0 ? 'No hay áreas registradas' : 'No se encontraron áreas' }}
          </div>
        </div>
      </template>
    </q-table>

    <!-- MODAL CREAR / EDITAR ÁREA -->
    <q-dialog v-model="showCreateOrEdit" persistent transition-show="scale" transition-hide="scale">
      <q-card flat bordered style="width: 600px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="bg-white text-primary row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ isEditing ? 'Actualizar Área' : 'Nueva Área de Trabajo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="cerrarModal" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form class="row q-col-gutter-md">
            <div class="col-12">
              <q-input outlined v-model="form.name" label="Nombre de la Dependencia" class="q-mb-sm" dense />
              <q-input outlined v-model="form.description" type="textarea" label="Descripción de Funciones" class="q-mb-sm" dense autogrow />
              <q-select
                outlined
                v-model="form.admin"
                :options="admins"
                option-label="names"
                option-value="_id"
                label="Encargado de Área"
                emit-value
                map-options
                class="q-mb-sm"
                dense
              >
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">Sin administradores disponibles</q-item-section></q-item>
                </template>
              </q-select>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-7" @click="cerrarModal" v-close-popup />
          <q-btn
            unelevated
            :label="isEditing ? 'Actualizar' : 'Guardar Área'"
            color="primary"
            :loading="loading"
            @click="isEditing ? actualizarArea() : crearArea()"
            rounded
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL DETALLES - SIN AVATARES CIRCULARES -->
    <q-dialog v-model="showDetails">
      <q-card flat bordered style="width: 500px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-md">
          <div class="text-h6 text-weight-bold">Información de Área</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-px-xl q-pb-lg">
          <div class="column items-center q-mb-lg">
            <q-icon name="business" size="64px" color="primary" class="q-mb-sm" />
            <div class="text-h5 text-weight-bold text-center">{{ selectedArea.name }}</div>
            <div class="text-body2 text-grey-7 text-center q-mt-xs">{{ selectedArea.description }}</div>
          </div>

          <q-list separator class="rounded-borders border-grey-3">
            <q-item class="q-py-md">
              <q-item-section avatar><q-icon name="person" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-uppercase text-weight-bold" style="font-size: 10px;">Líder de Área</q-item-label>
                <q-item-label class="text-weight-medium">{{ selectedArea.admin?.names || 'Pendiente por asignar' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section avatar><q-icon name="groups" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-uppercase text-weight-bold" style="font-size: 10px;">Personal Vinculado</q-item-label>
                <q-item-label class="text-weight-medium">
                  <span v-if="selectedArea.worker && selectedArea.worker.length">
                    {{ selectedArea.worker.map(w => w.names).join(', ') }}
                  </span>
                  <span v-else class="text-italic text-grey">Sin trabajadores registrados</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row justify-center q-mt-lg">
            <q-chip
              :label="stateMap[selectedArea.state]?.label"
              :color="stateMap[selectedArea.state]?.color"
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
import { ref, onMounted, computed } from 'vue'
import { postArea, getArea, getUser, putArea } from '../services/servicesComponent.js'
import { Notify } from 'quasar'
import api from '../services/api.js'

const showDetails = ref(false)
const showCreateOrEdit = ref(false)
const isEditing = ref(false)
const selectedArea = ref({})
const search = ref('')
const areasData = ref([])
const pagination = ref({ page: 1, rowsPerPage: 10 })
const admins = ref([])
const filtroEstado = ref(null)
const orden = ref("asc")
const ordenarLabel = ref('Ordenar')
const estadoLabel = ref('Filtrar Estado')
const loading = ref(false)

const form = ref({ _id: '', name: '', description: '', admin: null, state: 1 })

const setEstado = (valor, texto) =>{ filtroEstado.value = valor; estadoLabel.value = texto }
const setOrden = (valor, texto ) => { orden.value = valor; ordenarLabel.value = texto }

const stateMap = {
  1: { label: "Activa", color: "positive" },
  2: { label: "Inactiva", color: "negative" }
}

const filteredAreas = computed(() => {
  let lista = [...areasData.value]
  if (filtroEstado.value) lista = lista.filter(area => area.state === filtroEstado.value)
  if (search.value) {
    const term = search.value.toLowerCase().trim()
    lista = lista.filter(area => area.name?.toLowerCase().includes(term))
  }
  lista.sort((a, b) => {
    const A = a.name.toLowerCase(); const B = b.name.toLowerCase()
    return orden.value === "asc" ? A.localeCompare(B) : B.localeCompare(A)
  })
  return lista
})

const obtenerAdmins = async () => {
  try {
    const response = await api.get('/users/seeUsers')
    admins.value = response.data.filter(user => user.rol === 2 && user.state === 1)
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al cargar encargados' })
  }
}

const abrirModalCrear = () => {
  isEditing.value = false;
  limpiarFormulario();
  showCreateOrEdit.value = true;
}

const crearArea = async () => {
  try {
    if (!form.value.name || !form.value.description || !form.value.admin) {
      return Notify.create({ type: 'negative', message: 'Complete todos los campos' })
    }
    loading.value = true;
    await postArea({ name: form.value.name, description: form.value.description, admin: form.value.admin })
    Notify.create({ type: 'positive', message: 'Área creada con éxito' })
    await recargarAreas()
    cerrarModal()
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al crear área' })
  } finally {
    loading.value = false;
  }
}

const editarArea = (area) => {
  isEditing.value = true;
  form.value = {
    _id: area._id,
    name: area.name,
    description: area.description,
    admin: area.admin?._id || area.admin,
    state: area.state
  }
  showCreateOrEdit.value = true
}

const actualizarArea = async () => {
  try {
    if (!form.value.name || !form.value.admin) {
      return Notify.create({ type: 'negative', message: 'Nombre y Encargado obligatorios' })
    }
    loading.value = true;
    await putArea(form.value._id, form.value)
    Notify.create({ type: 'positive', message: 'Área actualizada' })
    await recargarAreas()
    cerrarModal()
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al actualizar' })
  } finally {
    loading.value = false;
  }
}

const cerrarModal = () => { showCreateOrEdit.value = false; limpiarFormulario() }
const limpiarFormulario = () => { form.value = { _id: '', name: '', description: '', admin: null, state: 1 } }

const recargarAreas = async () => {
  try {
    const res = await getArea()
    const users = await getUser()
    areasData.value = res.map((area, index) => ({
      ...area,
      index: index + 1,
      worker: users.filter(u => String(u.areaId) === String(area._id))
    }))
  } catch (error) {}
}

const verDetalles = (area) => { selectedArea.value = area; showDetails.value = true }

const toggleEstado = async (area) => {
  try {
    const nuevoEstado = area.state === 1 ? 2 : 1
    await putArea(area._id, { ...area, admin: area.admin?._id || area.admin, state: nuevoEstado })
    area.state = nuevoEstado
    Notify.create({ type: 'positive', message: `Área ${nuevoEstado === 1 ? 'activada' : 'desactivada'}` })
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'admin', label: 'Encargado', field: row => row.admin?.names || 'Sin asignar', align: 'left' },
  { name: 'worker', label: 'Trabajadores', field: row => row.worker?.length || 0, align: 'center' },
  { name: 'state', label: 'Estado', align: 'center' },
  { name: 'opcions', label: 'Acciones', align: 'center' }
]

onMounted(async () => {
  await obtenerAdmins()
  await recargarAreas()
})
</script>

<style scoped>
</style>

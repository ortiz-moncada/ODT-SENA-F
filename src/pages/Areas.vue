<template>
  <div v-if="fromAreas" class="overlay"></div>

  <div v-if="fromAreas" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Crear Área</h2>
    </div>

    <div class="imputsComtem">
      <q-input filled v-model="name" label="Nombre del Área" />
      <q-input filled v-model="description" type="textarea" label="Descripción del Área" />
      <q-select filled v-model="admin" :options="admins" option-label="names" option-value="_id" label="Encargado"
        emit-value map-options>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No hay administradores disponibles
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <button class="create-btn" @click="crearArea">CREAR</button>
    <button class="close-btn-m" @click="fromAreas = false">CERRAR</button>
  </div>

  <div v-if="showEditModal" class="overlay"></div>
  <div v-if="showEditModal" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Editar Área</h2>
    </div>

    <div class="imputsComtem">
      <q-input filled v-model="editForm.name" label="Nombre del Área" />
      <q-input filled v-model="editForm.description" type="textarea" label="Descripción del Área" />
      <q-select filled v-model="editForm.admin" :options="admins" option-label="names" option-value="_id" label="Encargado"
        emit-value map-options>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No hay administradores disponibles
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <button class="create-btn" @click="actualizarArea">ACTUALIZAR</button>
    <button class="close-btn-m" @click="cerrarModalEditar">CERRAR</button>
  </div>

  <div v-if="showDetails" class="overlay"></div>
  <div v-if="showDetails" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Detalles del Área</h2>
    </div>
    <div class="contemInputs">
      <div class="infoN">
        <h3 style="font-weight:800;">
          Información del area
          <img style="position: absolute; max-width: 35px; margin-top: 4px; margin-left: 2%;"
            src="https://cdn-icons-png.flaticon.com/512/263/263164.png"/> 
        </h3>
        <p><b>Titulo del área: </b>{{ selectedArea.name }}</p>
        <p><b>Descripción: </b>{{ selectedArea.description }}</p>
        <p><b>Estado: </b>
          <q-chip :label="stateMap[selectedArea.state]?.label" :color="stateMap[selectedArea.state]?.color"
            text-color="white" size="sm" class="q-mx-sm" />
        </p>
      </div><br>
      <div class="infoA">
        <h3 style="font-weight:800;">
          Encargado y trabajadores
          <img style="position: absolute; max-width: 40px; margin-top: 4px; margin-left: 2%;"
            src="https://cdn-icons-png.flaticon.com/512/50/50645.png"/> 
        </h3>
        <p><b>Encargado: </b>{{ selectedArea.admin?.names || 'Sin asignar' }}</p>
        <p><b>Trabajadores: </b>
          <span v-if="selectedArea.worker && selectedArea.worker.length > 0">
            {{selectedArea.worker.map(w => w.names).join(', ')}}
          </span>
          <span v-else> Sin trabajadores asignados </span>
        </p>
      </div>
    </div>
    <button class="close-btn" @click="showDetails = false">CERRAR</button>
  </div>

  <Layouts_main>
    <h1 style="text-align: center;" :style="{ color: 'var(--oneColor--)' }">AREAS</h1>
    <hr><br>

    <q-input v-model="search" dense outlined style="max-width: 400px; margin-left: 2%;" label="INGRESE NOMBRE DEL ÁREA">
      <template v-slot:append>
        <q-btn flat dense round>
          <img src="https://upload.wikimedia.org/wikipedia/meta/thumb/7/7e/Vector_search_icon.svg/1890px-Vector_search_icon.svg.png"
            style="width: 18px; height: 18px;" />
        </q-btn>
      </template>
    </q-input>

    <q-btn :style="{ backgroundColor: 'var(--twoColor--)', color: 'white' }" label="CREAR +"
      style="position: absolute; margin-left: 80%; margin-top: -2.7%;" @click="fromAreas = !fromAreas" />

    <q-btn-dropdown class="LP" :label="ordenarLabel">
      <q-list>
        <q-item clickable v-close-popup @click="setOrden('asc','A → Z')">
          <q-item-section>A → Z</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="setOrden('desc','Z → A')">
          <q-item-section>Z → A</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn-dropdown class="IA" :label="estadoLabel">
      <q-list>
        <q-item clickable v-close-popup @click="setEstado(1,'Activas')">Activas</q-item>
        <q-item clickable v-close-popup @click="setEstado(2,'Inactivas')">Inactivas</q-item>
      </q-list>
    </q-btn-dropdown>

    <br>
    <div class="q-pa-md">
      <q-table style="text-align: center; height: 400px; width: 97%; margin-left: 1%;" flat bordered
        :rows="filteredAreas" :columns="columns" row-key="_id" v-model:pagination="pagination"
        :rows-per-page-options="[0]" :no-data-label="' '">
        
        <template v-slot:body-cell-opcions="props">
          <q-td :props="props" class="text-center">
            <q-btn size="sm" :color="props.row.state === 1 ? 'negative' : 'green'"
              :icon="props.row.state === 1 ? 'close' : 'check'" round dense class="q-ml-sm"
              @click="toggleEstado(props.row)" />
            <q-btn size="sm" color="primary" icon="edit" round dense class="q-ml-sm" @click="editarArea(props.row)" />
            <q-btn size="sm" color="secondary" icon="visibility" round dense class="q-ml-sm"
              @click="verDetalles(props.row)" />
          </q-td>
        </template>

        <template v-slot:body-cell-state="props">
          <q-td :props="props">
            <q-chip :label="stateMap[props.row.state]?.label" :color="stateMap[props.row.state]?.color"
              text-color="white" size="sm" class="q-mx-sm" />
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width column flex-center text-grey-7 q-pa-lg">
            <img src="../IMG/pregunta (1).png" alt="Sin datos" style="max-width: 15%; margin-bottom: 10px;" />
            <h5 v-if="areasData.length === 0"> No hay areas registradas </h5>
            <h5 v-else> No hay areas con los filtros aplicados </h5>
          </div>
        </template>
      </q-table>
    </div>
  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { ref, onMounted, computed } from 'vue'
import { postArea, getArea, getUser, putArea } from '../services/servicesComponent.js'
import { Notify } from 'quasar'
// ✅ Importamos 'api' que ya tiene configurado el baseURL y los interceptores
import api from '../services/api.js'

const fromAreas = ref(false)
const showDetails = ref(false)
const showEditModal = ref(false)
const selectedArea = ref({})
const name = ref('')
const description = ref('')
const admin = ref(null)
const search = ref('')
const areasData = ref([])
const pagination = ref({ page: 1, rowsPerPage: 10 })
const admins = ref([])
const filtroEstado = ref(null)
const orden = ref("asc")
const ordenarLabel = ref('Ordenar')
const estadoLabel = ref('Estado')

const editForm = ref({ _id: '', name: '', description: '', admin: null, state: 1 })

const setEstado = (valor, texto) =>{ filtroEstado.value = valor; estadoLabel.value = texto }
const setOrden = (valor, texto ) => { orden.value = valor; ordenarLabel.value = texto }

const stateMap = {
  1: { label: "Activas", color: "green" },
  2: { label: "Inactivas", color: "red" }
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

// ✅ FUNCIÓN CORREGIDA: Usamos el endpoint correcto y la instancia 'api'
const obtenerAdmins = async () => {
  try {
    // La ruta correcta para ver usuarios es /users/seeUsers
    const response = await api.get('/users/seeUsers')
    
    // Filtramos los que son Administradores (rol 2) y están activos (state 1)
    admins.value = response.data.filter(user => user.rol === 2 && user.state === 1)
    
    console.log('👥 Admins disponibles:', admins.value.length)
  } catch (error) {
    console.error('❌ Error al cargar administradores:', error)
    Notify.create({ type: 'negative', message: 'Error al cargar encargados', position: 'top' })
  }
}

const crearArea = async () => {
  try {
    if (!name.value || !description.value || !admin.value) {
      return Notify.create({ type: 'negative', message: 'Complete todos los campos', position: 'top' })
    }
    await postArea({ name: name.value, description: description.value, admin: admin.value })
    Notify.create({ type: 'positive', message: 'Área creada con éxito', position: 'top' })
    
    await recargarAreas()
    name.value = ''; description.value = ''; admin.value = null; fromAreas.value = false
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al crear área', position: 'top' })
  }
}

const editarArea = (area) => {
  editForm.value = {
    _id: area._id,
    name: area.name,
    description: area.description,
    admin: area.admin?._id || area.admin,
    state: area.state
  }
  showEditModal.value = true
}

const actualizarArea = async () => {
  try {
    if (!editForm.value.name || !editForm.value.admin) {
      return Notify.create({ type: 'negative', message: 'Nombre y Encargado obligatorios', position: 'top' })
    }
    await putArea(editForm.value._id, editForm.value)
    Notify.create({ type: 'positive', message: 'Área actualizada', position: 'top' })
    await recargarAreas()
    cerrarModalEditar()
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al actualizar', position: 'top' })
  }
}

const cerrarModalEditar = () => { showEditModal.value = false }

const recargarAreas = async () => {
  try {
    const res = await getArea()
    const users = await getUser()
    areasData.value = res.map((area, index) => ({
      ...area,
      index: index + 1,
      worker: users.filter(u => String(u.areaId) === String(area._id))
    }))
  } catch (error) {
    console.error("❌ Error al recargar áreas:", error)
  }
}

const verDetalles = (area) => { selectedArea.value = area; showDetails.value = true }

const toggleEstado = async (area) => {
  try {
    const nuevoEstado = area.state === 1 ? 2 : 1
    await putArea(area._id, { ...area, admin: area.admin?._id || area.admin, state: nuevoEstado })
    area.state = nuevoEstado
    Notify.create({ 
      type: 'positive', 
      message: `Área ${nuevoEstado === 1 ? 'activada' : 'desactivada'}`, 
      position: 'top' 
    })
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al cambiar estado', position: 'top' })
  }
}

const columns = [
  { name: 'index', label: '#', field: row => row.index, align: 'center' },
  { name: 'name', label: 'Nombre', field: 'name', align: 'center', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'center' },
  { name: 'admin', label: 'Encargado', field: row => row.admin?.names || 'Sin asignar', align: 'center' },
  { name: 'worker', label: 'Trabajadores', field: row => row.worker?.map(w => w.names).join(', ') || 'Sin trabajadores', align: 'center' },
  { name: 'state', label: 'Estado' },
  { name: 'opcions', label: 'Opciones' }
]

onMounted(async () => {
  await obtenerAdmins()
  await recargarAreas()
})
</script>

<style scoped>
@import url(../style/Areas.css);
</style>
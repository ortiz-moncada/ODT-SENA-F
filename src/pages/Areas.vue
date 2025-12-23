<template>
  <!-- FONDO OSCURO MODAL CREAR -->
  <div v-if="fromAreas" class="overlay"></div>

  <!-- MODAL CREAR ÁREA -->
  <div v-if="fromAreas" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Crear Área</h2>
    </div>

    <div class="imputsComtem">
      <q-input filled v-model="name" :dense="dense" label="Nombre del Área" />
      <q-input filled v-model="description" :dense="dense" type="textarea" label="Descripción del Área" />
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

  <!-- MODAL EDITAR ÁREA -->
  <div v-if="showEditModal" class="overlay"></div>
  <div v-if="showEditModal" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Editar Área</h2>
    </div>

    <div class="imputsComtem">
      <q-input 
        filled 
        v-model="editForm.name" 
        :dense="dense" 
        label="Nombre del Área" 
      />
      <q-input 
        filled 
        v-model="editForm.description" 
        :dense="dense" 
        type="textarea" 
        label="Descripción del Área" 
      />
      <q-select 
        filled 
        v-model="editForm.admin" 
        :options="admins" 
        option-label="names" 
        option-value="_id" 
        label="Encargado"
        emit-value 
        map-options
      >
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

  <!-- MODAL VER DETALLES -->
  <div v-if="showDetails" class="overlay"></div>
  <div v-if="showDetails" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Detalles del Área</h2>
    </div>
    <div class="contemInputs">
      <div class="infoN">
        <h3 style="font-weight:800;">
          Información del area
          <img
            style="position: absolute; max-width: 35px; margin-top: 4px; margin-left: 2%;"
            src="https://cdn-icons-png.flaticon.com/512/263/263164.png"/> 
        </h3>
          <p><b>Titulo del área: </b>{{ selectedArea.name }}</p>
          <p><b>Descripción: </b>{{ selectedArea.description }}</p>
          <p><b>Estado: </b>
          <q-chip
          :label="stateMap[selectedArea.state]?.label"
          :color="stateMap[selectedArea.state]?.color"
          text-color="white"
          size="sm"
          class="q-mx-sm"
          /></p>
      </div><br>
      <div class="infoA">
        <h3 style="font-weight:800;">
          Encargado y trabajadores
          <img
            style="position: absolute; max-width: 40px; margin-top: 4px; margin-left: 2%;"
            src="https://cdn-icons-png.flaticon.com/512/50/50645.png"/> 
        </h3>
        <p><b>Encargado: </b>{{ selectedArea.admin?.names || 'Sin asignar' }}</p>
        <p><b>Trabajadores: </b>
          <span v-if="selectedArea.worker && selectedArea.worker.length > 0">
            {{selectedArea.worker.map(w => w.names).join(', ')}}
          </span>
          <span v-else>
            Sin trabajadores asignados
          </span>
        </p>
      </div>
    </div>
    <button class="close-btn" @click="showDetails = false">CERRAR</button>
  </div>

  <!-- CONTENIDO PRINCIPAL -->
  <Layouts_main>
    <h1 style="text-align: center;" :style="{ color: 'var(--oneColor--)' }">AREAS</h1>
    <hr><br>

    <!-- Input de búsqueda -->
    <q-input v-model="search" dense outlined style="max-width: 400px; margin-left: 2%;" label="INGRESE NOMBRE DEL ÁREA">
      <template v-slot:append>
        <q-btn flat dense round>
          <img
            src="https://upload.wikimedia.org/wikipedia/meta/thumb/7/7e/Vector_search_icon.svg/1890px-Vector_search_icon.svg.png"
            style="width: 18px; height: 18px;" />
        </q-btn>
      </template>
    </q-input>

    <!-- Botón de crear -->
    <q-btn :style="{ backgroundColor: 'var(--twoColor--)', color: 'white' }" label="CREAR +"
      style="position: absolute; margin-left: 80%; margin-top: -2.7%;" @click="fromAreas = !fromAreas" />

    <q-btn-dropdown class="LP" :label="ordenarLabel">
      <q-list>
        <q-item clickable v-close-popup @click="setOrden('asc','A → Z')">
          <q-item-section>
            <q-item-label>A → Z</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="setOrden('desc','Z → A')">
          <q-item-section>
            <q-item-label>Z → A</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn-dropdown class="IA" :label="estadoLabel">
      <q-list>
        <q-item clickable v-close-popup @click="setEstado(1,'Activas')">Activas</q-item>
        <q-item clickable v-close-popup @click="setEstado(2,'Inactivas')">Inactivas</q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- Tabla --> <br>
    <div class="q-pa-md">
      <q-table 
      style="text-align: center; height: 400px; width: 97%; margin-left: 1%;" 
      flat bordered
      :rows="filteredAreas" 
      :columns="columns" row-key="index"  
      v-model:pagination="pagination"
      :rows-per-page-options="[0]" 
      :key="refreshKey" 
      :no-data-label="' '"
      >
        <template v-slot:body-cell-opcions="props">
          <q-td :props="props" class="text-center">
            <q-btn size="sm" :color="props.row.state === 1 ? 'negative' : 'green'"
              :icon="props.row.state === 1 ? 'close' : 'check'" round dense class="q-ml-sm"
              @click="toggleEstado(props.row)" />
            <q-btn size="sm" color="primary" icon="edit" round dense class="q-ml-sm" @click="editarArea(props.row)" />
            <q-btn size="sm" color="secondary" icon="visibility" round dense class="q-ml-sm"
              @click="verDetalles(props.row)" />
          </q-td>
<!--           <q-td :props="props">
      {{ props.row.description.length > 50
        ? props.row.description.substring(0, 50) + '...'
        : props.row.description }}
    </q-td> -->

        </template>

        <template v-slot:body-cell-state="props">
          <q-td :props="props">
           <q-chip 
           :label="stateMap[props.row.state]?.label"
           :color="stateMap[props.row.state]?.color"
           text-color="white"
           size="sm"
           class="q-mx-sm"
           
           />
          </q-td>
        </template>

        <template v-slot:no-data>
  <div class="full-width column flex-center text-grey-7 q-pa-lg">
    
    <img
      src="../IMG/pregunta (1).png"
      alt="Sin datos"
      style="max-width: 15%; margin-bottom: 10px;"
    />

    <!-- NO HAY TAREAS -->
    <h5 v-if="areasData.length === 0">
      No hay areas registradas
    </h5>

    <!-- HAY TAREAS PERO NO COINCIDEN LOS FILTROS -->
    <h5 v-else>
      No hay areas con los filtros aplicados
    </h5>

  </div>
</template>
      </q-table>
    </div>

  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { postArea, getArea, getUser, putArea } from '../services/servicesComponent.js'
import { Notify } from 'quasar'

const fromAreas = ref(false)
const showDetails = ref(false)
const showEditModal = ref(false)
const selectedArea = ref({})
const dense = ref(true)
const name = ref('')
const description = ref('')
const admin = ref(null)
const search = ref('')
const areasData = ref([])
const pagination = ref({ page: 1, rowsPerPage: 10 })
const admins = ref([])
const filtroSeleccionado = ref('name')
const refreshKey = ref(0)
const filtroEstado = ref(null)
const orden = ref("asc")
const ordenarLabel = ref('Ordenar')
const estadoLabel = ref('Estado')

// Formulario de edición
const editForm = ref({
  _id: '',
  name: '',
  description: '',
  admin: null,
  state: 1
})

const setEstado = (valor, texto) =>{
  filtroEstado.value = valor
  estadoLabel.value = texto
}

const setOrden = (valor, texto ) => {
  orden.value = valor 
  ordenarLabel.value = texto
}


const stateMap = {
  1: { label: "Activas", color: "green" },
  2: { label: "Inactivas", color: "red" }
}

const filteredAreas = computed(() => {
  let lista = [...areasData.value];

  if (filtroEstado.value) {
    lista = lista.filter(area => area.state === filtroEstado.value);
  }

  if (search.value) {
    const searchTerm = search.value.toLowerCase().trim();
    const field = filtroSeleccionado.value;

    lista = lista.filter(area => {
      if (field === "name") {
        return area.name?.toLowerCase().includes(searchTerm);
      }
      if (field === "admin") {
        return area.admin?.names?.toLowerCase().includes(searchTerm);
      }
      return true;
    });
  }

  lista.sort((a, b) => {
    const A = a.name.toLowerCase();
    const B = b.name.toLowerCase();
    return orden.value === "asc" ? A.localeCompare(B) : B.localeCompare(A);
  });

  return lista;
});

// Función para obtener el token del localStorage
const getToken = () => {
  let token = localStorage.getItem('token')
  if (!token) {
    token = sessionStorage.getItem('token')
  }

  console.log('Token obtenido:', token ? 'Sí existe' : 'No existe')
  return token
}

const obtenerAdmins = async () => {
  try {
    const token = getToken()

    if (!token) {
      console.error('❌ No hay token disponible')
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Sesión expirada. Por favor inicie sesión nuevamente.'
      })
      return
    }

    const response = await axios.get('http://localhost:4000/users/seeUsers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('✅ Usuarios recibidos:', response.data.length)

    admins.value = response.data.filter(user => {
      return user.rol === 2 && user.state === 1
    })

    console.log('👥 Admins disponibles:', admins.value.length)

    if (admins.value.length === 0) {
      console.warn('⚠️ No se encontraron administradores activos')
    }
  } catch (error) {
    console.error('❌ Error al cargar administradores:', error)

    if (error.response?.status === 401) {
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Token inválido o expirado. Por favor inicie sesión nuevamente.'
      })
    } else {
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Error al cargar administradores'
      })
    }
  }
}

const crearArea = async () => {
  try {
    if (!name.value || !description.value || !admin.value) {
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Por favor complete todos los campos'
      })
      return
    }

    console.log('📤 Datos a enviar:', {
      name: name.value,
      description: description.value,
      admin: admin.value
    })

    const newArea = {
      name: name.value,
      description: description.value,
      admin: admin.value
    }

    await postArea(newArea)

    Notify.create({
      position: "top",
      type: 'positive',
      message: 'Área creada con éxito'
    })

    // Recargar áreas
    await recargarAreas()

    // Limpiar formulario
    name.value = ''
    description.value = ''
    admin.value = null
    fromAreas.value = false

  } catch (error) {
    console.error("❌ Error al crear área:", error)
    Notify.create({
      position: "top",
      type: 'negative',
      message: error.response?.data?.error || 'Error al crear área'
    })
  }
}

// NUEVA FUNCIÓN: Editar Área
const editarArea = (area) => {
  console.log('📝 Editando área:', area)

  editForm.value = {
    _id: area._id,
    name: area.name,
    description: area.description,
    admin: area.admin?._id || null,
    state: area.state
  }

  showEditModal.value = true
}

// NUEVA FUNCIÓN: Actualizar Área
const actualizarArea = async () => {
  try {
    if (!editForm.value.name || !editForm.value.description || !editForm.value.admin) {
      Notify.create({
        position: "top",
        type: 'negative',
        message: 'Por favor complete todos los campos'
      })
      return
    }

    console.log('📤 Actualizando área con ID:', editForm.value._id)
    console.log('📋 Datos a actualizar:', {
      name: editForm.value.name,
      description: editForm.value.description,
      admin: editForm.value.admin
    })

    const dataUpdate = {
      name: editForm.value.name,
      description: editForm.value.description,
      admin: editForm.value.admin,
      state: editForm.value.state
    }

    await putArea(editForm.value._id, dataUpdate)

    Notify.create({
      position: "top",
      type: 'positive',
      message: 'Área actualizada con éxito'
    })

    // Recargar áreas
    await recargarAreas()

    // Cerrar modal
    cerrarModalEditar()

  } catch (error) {
    console.error("❌ Error al actualizar área:", error)
    Notify.create({
      position: "top",
      type: 'negative',
      message: error.response?.data?.error || 'Error al actualizar área'
    })
  }
}

// NUEVA FUNCIÓN: Cerrar Modal de Edición
const cerrarModalEditar = () => {
  showEditModal.value = false
  editForm.value = {
    _id: '',
    name: '',
    description: '',
    admin: null,
    state: 1
  }
}

// NUEVA FUNCIÓN: Recargar Áreas
const recargarAreas = async () => {
  try {
    const res = await getArea()
    const users = await getUser()

    areasData.value = res.map((area, index) => ({
      ...area,
      index: index + 1,
      worker: users.filter(u => u.areaId === area._id)
    }))

    refreshKey.value++
    console.log('✅ Áreas recargadas:', areasData.value.length)
  } catch (error) {
    console.error("❌ Error al recargar áreas:", error)
  }
}

const verDetalles = (area) => {
  selectedArea.value = area
  showDetails.value = true
}

const toggleEstado = async (area) => {
  try {
    const nuevoEstado = area.state === 1 ? 2 : 1

    console.log(`🔄 Cambiando estado del área "${area.name}" de ${area.state} a ${nuevoEstado}`)

    const dataUpdate = {
      name: area.name,
      description: area.description,
      admin: area.admin?._id || area.admin,
      state: nuevoEstado
    }

    await putArea(area._id, dataUpdate)

    // Actualizar localmente
    area.state = nuevoEstado

    Notify.create({
      position: "top",
      type: 'positive',
      message: `Área "${area.name}" ahora está ${nuevoEstado === 1 ? 'Activa' : 'Inactiva'}`
    })

    refreshKey.value++

  } catch (error) {
    console.error("❌ Error al cambiar estado:", error)
    Notify.create({
      position: "top",
      type: 'negative',
      message: 'Error al actualizar el estado'
    })
  }
}

const columns = [
  { name: 'index', label: '#', field: (row) => row.index, align: 'center' },
  { name: 'name', label: 'Nombre', field: 'name', align: 'center', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'center', sortable: true },
  { name: 'admin', label: 'Encargado', field: (row) => row.admin?.names || 'Sin asignar', align: 'center' },
  { name: 'worker', label: 'Trabajadores', field: (row) => row.worker?.map(w => w.names).join(', ') || 'Sin trabajadores', align: 'center' },
  { name: 'state', label: 'Estado' },
  { name: 'opcions', label: 'Opciones' }
]

onMounted(async () => {
  try {
    await obtenerAdmins()
    await recargarAreas()
  } catch (error) {
    console.error("❌ Error al inicializar:", error)
  }
})

</script>

<style scoped>
@import url(../style/Areas.css);
</style>
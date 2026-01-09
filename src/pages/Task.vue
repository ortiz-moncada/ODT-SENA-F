<template>
  <div v-if="showCreate" class="overlay"></div>

  <!-- MODAL ENTREGAR TAREA -->
  <div v-if="showEntrega" class="overlay"></div>

  <div v-if="showEntrega" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">ENTREGAR TAREA</h2>
    </div>

    <div style="padding: 15px;">
      <p><b>Nombre:</b> {{ selectedTask.name }}</p>
      <p><b>Descripción:</b> {{ selectedTask.description }}</p>

      <q-input filled v-model="entregaComentario" type="textarea" label="Comentario (opcional)" />

      <br />

      <q-btn color="primary" class="q-mr-sm" @click="subirArchivoEntrega">
        Adjuntar archivo
      </q-btn>

      <q-btn color="primary" @click="agregarLinkEntrega">
        Adjuntar enlace
      </q-btn>

      <div v-if="entregaArchivo" style="margin-top:10px;">
        <b>Archivo:</b> {{ entregaArchivo.name }}
      </div>

      <div v-if="entregaLink" style="margin-top:10px;">
        <b>Link:</b> {{ entregaLink }}
      </div>
    </div>

    <button class="create-btn" @click="entregarTarea">ENTREGAR</button>
    <button class="close-btn-m" @click="showEntrega = false">CERRAR</button>
  </div>

  <!-- MODAL CREAR TAREA -->
  <div v-if="showCreate" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Crear Tarea</h2>
    </div>

    <div class="imputsComtem">
      <div class="box">
        <q-input class="Task" filled v-model="name" :dense="dense" label="Nombre de la tarea" />
        <q-input :min="hoy" class="Date" filled v-model="date" :dense="dense" type="date" label="Fecha de entrega" />
        <q-select class="Workers" filled v-model="workers" :options="workersList" option-label="names"
          option-value="_id" label="Trabajadores asignados" emit-value map-options multiple use-chips>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay trabajadores disponibles
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select v-if="workers.length > 1" filled v-model="leader"
          :options="workersList.filter(w => workers.includes(w._id))" option-label="names" option-value="_id"
          label="Líder de la tarea" emit-value map-options class="q-mt-md" />
        <q-toggle v-model="isMonthly" label="Tarea mensual" />
        <q-input v-if="isMonthly" type="number" min="1" max="28" v-model="monthlyDay" label="Día del mes" />

      </div>
      <div class="box1">
        <q-input class="Description" filled v-model="description" :dense="dense" type="textarea" label="Descripción" />
      </div>


      <div class="vistaInfo">
        <q-btn title="Adjuntar archivo" class="Arch" @click="subirArchivoCrear">
          <img style="width: 10px;" src="https://images.icon-icons.com/1856/PNG/512/attach-file_117217.png" alt="">
        </q-btn>


        <div v-if="crearArchivo" style="margin-top:10px;">
          <b>Archivo:</b> {{ crearArchivo.name }}
        </div>

        <div v-if="crearLink" style="margin-top:10px;">
          <b>Link:</b> {{ crearLink }}
        </div>

      </div>


    </div>

    <button class="create-btn" @click="crearTarea">CREAR</button>
    <button class="close-btn-m" @click="showCreate = false">CERRAR</button>
  </div>

  <!-- MODAL EDITAR TAREA -->
  <div v-if="showEdit" class="overlay"></div>
  <div v-if="showEdit" class="modal">
    <div class="headed">
      <h2 style="text-align: center;">Editar Tarea</h2>
    </div>

    <div class="imputsComtem">
      <q-input filled v-model="editName" :dense="dense" label="Nombre de la tarea" />
      <q-input filled v-model="editDescription" :dense="dense" type="textarea" label="Descripción" />
      <q-input filled v-model="editDate" :dense="dense" type="date" label="Fecha de entrega" />
      <q-select filled v-model="editWorkers" :options="workersList" option-label="names" option-value="_id"
        label="Trabajadores asignados" emit-value map-options multiple use-chips />


    </div>
    <q-select filled v-model="editState" :options="[
      { label: 'En Desarrollo', value: 1 },
      { label: 'En Revisión', value: 2 },
      { label: 'Completada', value: 3 },
      { label: 'Rechazada', value: 4 },
      { label: 'Vencida', value: 5 },
    ]" label="Estado de la tarea" emit-value map-options />


    <button class="create-btn" @click="actualizarTarea">ACTUALIZAR</button>
    <button class="close-btn-m" @click="showEdit = false">CERRAR</button>
  </div>

  <!-- MODAL DETALLES -->
  <div v-if="showDetails" class="overlay"></div>
  <div v-if="showDetails" class="modal1">
    <div class="headed">
      <h2 style="text-align: center;">Detalles de la Tarea</h2>
    </div>

    <div class="contemInputs">

      <div class="infoT">
        <h3 style="font-weight:800;">
          Información de la tarea
          <img style="position: absolute; max-width: 40px; margin-top: 4px; margin-left: 5px;"
            src="https://cdn-icons-png.flaticon.com/128/6389/6389264.png" />

        </h3>
        <p><b>Nombre</b> {{ selectedTask.name }}</p>
        <p><b>Descripción</b> {{ selectedTask.description }}</p>
        <p><b>Código</b> {{ selectedTask.tribute_id }}</p>
        <p><b>Estado:</b>
          <q-chip :label="stateMap[selectedTask.stateTask]?.label" :color="stateMap[selectedTask.stateTask]?.color"
            text-color="white" size="sm" class="q-mx-sm" />
        </p>
      </div>

      <div class="asignasion">
        <h3 style="font-weight:800;">
          Encargado
          <img style="position: absolute; max-width: 40px; margin-top: 4px; margin-left: 5px;"
            src="https://cdn-icons-png.flaticon.com/128/8237/8237612.png" />
        </h3>
        <p><b>Trabajadores:</b> {{selectedTask.workers?.map(w => w.names).join(', ')}}</p>
      </div>

      <div class="fecha">
        <h3 style="font-weight:800;">
          Fecha
          <img style="position: absolute; max-width: 40px; margin-top: 4px; margin-left: 5px;"
            src="https://cdn-icons-png.flaticon.com/128/8302/8302434.png" />
        </h3>
        <p><b>Fecha entrega:</b> {{ formatDate(selectedTask.delivery_date) }}</p>
      </div>
    </div>
    <br>
    <div class="archivos1">
      <h3 style="font-weight:800;">
        Archivos Adjuntos
        <!--  <img
      style=" max-width: 40px; margin-top: 4px; margin-left: 5px;"
      src="https://cdn-icons-png.flaticon.com/512/304/304579.png"
    /> -->
      </h3>

      <div class="archivos">
        <div v-if="selectedTask.attached_files?.length">
          <div v-for="(file, index) in selectedTask.attached_files" :key="index">
            <a :href="file.url" target="_blank" style="color: blue; text-decoration: underline;">
              {{ file.name || ('Archivo ' + (index + 1)) }}
            </a>
          </div>
        </div>

        <p v-else>Sin archivos adjuntos</p>
      </div>
    </div>
    <button class="close-btn" @click="showDetails = false">CERRAR</button>
  </div>

  <!-- MODAL ENTREGAR TAREA (TRABAJADOR) -->
  <div v-if="showEntregaWorker" class="overlay"></div>
  <div v-if="showEntregaWorker" class="modal">
    <div class="headed">
      <h2 style="text-align:center;">ENTREGAR TAREA</h2>
    </div>

    <div style="padding: 20px;">
      <h2>Tarea</h2>
      <p>{{ tareaEntrega?.name }}</p>
      <p>{{ tareaEntrega?.description }}</p>
      <q-btn color="primary" icon="attach_file" label="Adjuntar archivo" @click="seleccionarArchivoEntrega" />

      <div v-if="entregaFile" style="margin-top: 10px;">
        <b>Archivo:</b> {{ entregaFile.name }}
      </div>
    </div>

    <button class="create-btn" @click="entregarTareaWorker">
      ENTREGAR
    </button>

    <button class="close-btn-m" @click="showEntregaWorker = false">
      CERRAR
    </button>
  </div>


  <!-- CONTENIDO PRINCIPAL -->
  <Layouts_main>
    <h1 style="text-align: center;" :style="{ color: 'var(--oneColor--)' }">TAREAS</h1>
    <hr><br>

    <!-- Input búsqueda -->
    <q-input v-model="search" dense outlined style="max-width: 400px; margin-left: 2%;" label="BUSCAR TAREA POR NOMBRE">
      <template v-slot:append>
        <q-btn flat dense round>
          <img
            src="https://upload.wikimedia.org/wikipedia/meta/thumb/7/7e/Vector_search_icon.svg/1890px-Vector_search_icon.svg.png"
            style="width: 18px; height: 18px;" />
        </q-btn>
      </template>
    </q-input>

    <q-btn-dropdown class="Az" :label="ordenLabel">
      <q-list>
        <q-item clickable v-close-popup @click="setOrden('asc', 'A → Z')">
          <q-item-section>A → Z</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="setOrden('desc', 'Z → A')">
          <q-item-section>Z → A</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn-dropdown class="Es" :label="estadoLabel">
      <q-list>
        <q-item clickable v-close-popup @click="setEstado(1, 'En Desarrollo')">
          <q-item-section>En Desarrollo</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="setEstado(2, 'En Revisión')">
          <q-item-section>En Revisión</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="setEstado(3, 'Completada')">
          <q-item-section>Completada</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="setEstado(4, 'Rechazada')">
          <q-item-section>Rechazada</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="setEstado(5, 'Vencida')">
          <q-item-section>Vencida</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>


    <q-btn v-if="rol !== 3" :style="{ backgroundColor: 'var(--twoColor--)', color: 'white' }" label="CREAR +"
      style="position: absolute; margin-left: 30%; margin-top: -2.7%;" @click="showCreate = !showCreate" />
    <!-- Tabla -->
    <div class="q-pa-md">
      <q-table style="text-align: center; height: 400px; width: 97%; margin-left: 1%;" flat bordered
        :rows="filteredTasks" :columns="columns" row-key="_id" v-model:pagination="pagination"
        :rows-per-page-options="[0]" :no-data-label="' '">

        <!-- Columna opciones -->
        <template v-slot:body-cell-opcions="props">
          <q-td :props="props" class="text-center">


            <q-btn v-if="rol != 3" size="sm" color="primary" icon="edit" round dense class="q-ml-sm"
              @click="abrirEditar(props.row)" />

            <q-btn v-if="rol === 3 && esLider(props.row)" size="sm" color="green" icon="upload" round dense
              class="q-ml-sm" @click="abrirEntregaWorker(props.row)" />
            <q-btn size="sm" color="secondary" icon="visibility" round dense class="q-ml-sm"
              @click="verDetalles(props.row)" />
          </q-td>
        </template>

        <!-- Estado color -->
        <template v-slot:body-cell-stateTask="props">
          <q-td :props="props">
            <q-chip :label="stateMap[props.row.stateTask]?.label" :color="stateMap[props.row.stateTask]?.color"
              text-color="white" size="sm" class="q-mx-sm" />
          </q-td>
        </template>

        <template v-slot:body-cell-isMonthly="props">
  <q-td :props="props" class="text-center">
    {{ props.row.isMonthly ? 'Sí' : 'No' }}
  </q-td>
</template>


        <template v-slot:body-cell-attached_files="props">
          <q-td :props="props">
            <div v-if="props.row.attached_files?.length">
              <div v-for="(file, index) in props.row.attached_files" :key="index">
                <a :href="file.url || `http://localhost:4000/${file.path}`" target="_blank"
                  style="color: blue; cursor: pointer;">
                  {{ file.name || `Archivo ${index + 1}` }}
                </a>
              </div>
            </div>
            <span v-else>Sin archivos</span>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width column flex-center text-grey-7 q-pa-lg">

            <img src="../IMG/pregunta (1).png" alt="Sin datos" style="max-width: 15%; margin-bottom: 10px;" />

            <!-- NO HAY TAREAS -->
            <h5 v-if="tasks.length === 0">
              No hay tareas registradas
            </h5>

            <!-- HAY TAREAS PERO NO COINCIDEN LOS FILTROS -->
            <h5 v-else>
              No hay tareas con los filtros aplicados
            </h5>

          </div>
        </template>

        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            {{
              props.row.description && props.row.description.length > 60
                ? props.row.description.substring(0, 60) + '...'
                : props.row.description
            }}
          </q-td>
        </template>

      </q-table>
    </div>
  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'
import { postTasks, getTasks as svcGetTasks, putTasks, createNotification } from '../services/servicesComponent'


const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const rol = Number(localStorage.getItem('rol'))
const areaId = localStorage.getItem('areaId')


const showEntrega = ref(false)
const entregaComentario = ref('')
const entregaArchivo = ref(null)
const entregaLink = ref('')
const showCreate = ref(false)
const showEdit = ref(false)
const showDetails = ref(false)
const selectedTask = ref({})
const filterStated = ref(null)
const search = ref('')
const name = ref('')
const description = ref('')
const date = ref('')
const workers = ref([])
const crearArchivo = ref(null)
const crearLink = ref('')
const editId = ref('')
const editName = ref('')
const editDescription = ref('')
const editDate = ref('')
const editWorkers = ref([])
const editState = ref(null);
const tasks = ref([])
const workersList = ref([])
const orden = ref("asc")
const tributeId = ref('')
const showEntregaWorker = ref(false)
const entregaFile = ref(null)
const tareaEntrega = ref(null)
const ordenLabel = ref('Ordenar')
const estadoLabel = ref('Estado')
const leader = ref(null)
const userId = localStorage.getItem('userId')

const isMonthly = ref(false)
const monthlyDay = ref(null)

const esLider = (tarea) => {
  if (!tarea || !tarea.leader) return false

  // Si leader viene como objeto (populate)
  if (typeof tarea.leader === 'object') {
    return String(tarea.leader._id) === String(userId)
  }

  // Si leader viene como string
  return String(tarea.leader) === String(userId)
}


watch(workers, (newWorkers) => {
  // si solo hay uno → líder automático
  if (newWorkers.length === 1) {
    leader.value = newWorkers[0]
  }

  // si no hay workers → limpiar líder
  if (newWorkers.length === 0) {
    leader.value = null
  }

  // si el líder ya no está en workers → reset
  if (leader.value && !newWorkers.includes(leader.value)) {
    leader.value = null
  }
})


const pagination = ref({ page: 1, rowsPerPage: 10 })

// COLUMNAS
const columns = [
  { name: 'index', label: '#', field: (row) => row.index, align: 'center' },
  { name: 'name', label: 'Nombre', field: 'name', align: 'center', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'center', sortable: true },
  { name: 'workers', label: 'Trabajadores', field: row => row.workers?.map(w => w.names).join(', ') || 'Sin asignar', align: 'center' },
  { name: 'attached_files', label: 'Archivos' },
  { name: 'delivery_date', label: 'Fecha Entrega', field: (row) => formatDate(row.delivery_date), align: 'center' },
  { name: 'isMonthly', label: 'Mensual', align: 'center' },
  { name: 'stateTask', label: 'Estado' },
  { name: 'opcions', label: 'Opciones' }
]

const abrirEntregaWorker = (task) => {
  tareaEntrega.value = task
  entregaFile.value = null
  showEntregaWorker.value = true
}

const seleccionarArchivoEntrega = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.docx,.png,.jpg,.jpeg'
  input.onchange = e => {
    entregaFile.value = e.target.files[0]
  }
  input.click()
}
const entregarTareaWorker = async () => {
  try {
    // 1 Validar archivo
    if (!entregaFile.value) {
      return Notify.create({
        type: 'negative',
        message: 'Debe adjuntar un archivo'
      })
    }

    // Crear FormData
    const formData = new FormData()

    //  AQUÍ VA ESTO
    formData.append("file", entregaFile.value)

    // (opcional) si luego agregas comentario
    // formData.append("comentario", comentario.value)

    // Enviar al backend
    await axios.post(
      `http://localhost:4000/tasks/entregar/${tareaEntrega.value._id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      }
    )

    //  Éxito
    Notify.create({
      type: 'positive',
      message: 'Tarea entregada correctamente'
    })

    showEntregaWorker.value = false
    obtenerTareas()

  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'Error al entregar la tarea'
    })
  }
}


// FILTRO POR ESTADO (CON NÚMEROS)
const setOrden = (valor, texto) => {
  orden.value = valor
  ordenLabel.value = texto
}

const setEstado = (valor, texto) => {
  filterStated.value = valor
  estadoLabel.value = texto
}


const stateMap = {
  1: { label: "En Desarrollo", color: "blue" },
  2: { label: "En Revisión", color: "orange" },
  3: { label: "Completada", color: "green" },
  4: { label: "Rechazada", color: "red" },
  5: { label: "Vencida", color: "grey" }
};


const hoy = new Date().toISOString().slice(0, 10);


const filteredTasks = computed(() => {
  let lista = tasks.value

  // FILTRO POR BUSQUEDA
  if (search.value.trim() !== "") {
    const term = search.value.toLowerCase()

    lista = lista.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.workers?.map(w => w.names).join(', ').toLowerCase().includes(term)
    )
  }

  // FILTRO POR ESTADO NUMÉRICO
  if (filterStated.value !== null) {
    lista = lista.filter(t => Number(t.stateTask) === Number(filterStated.value))
  }

  lista.sort((a, b) => {
    const A = a.name.toLowerCase();
    const B = b.name.toLowerCase();
    return orden.value === "asc" ? A.localeCompare(B) : B.localeCompare(A);
  })
  return lista
})

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  const f = new Date(date)
  return `${f.getDate().toString().padStart(2, '0')}/${(f.getMonth() + 1)
    .toString().padStart(2, '0')}/${f.getFullYear()}`
}


// CREAR TAREA
const subirArchivoCrear = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.png,.jpg,.jpeg,.docx'
  input.onchange = e => crearArchivo.value = e.target.files[0]
  input.click()
}

const crearTarea = async () => {
  try {
    if (!name.value || !description.value || workers.value.length === 0) {
      return Notify.create({
        type: 'negative',
        message: 'Complete todos los campos obligatorios'
      })
    }

    if (!isMonthly.value && !date.value) {
      return Notify.create({
        type: 'negative',
        message: 'Debe seleccionar una fecha de entrega'
      })
    }

    if (isMonthly.value && !monthlyDay.value) {
      return Notify.create({
        type: 'negative',
        message: 'Debe indicar el día del mes (1-28)'
      })
    }

    if (workers.value.length > 1 && !leader.value) {
      return Notify.create({
        type: 'negative',
        message: 'Debe seleccionar un líder',
        position: 'top'
      })
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      return Notify.create({
        type: 'negative',
        message: 'No se encontró el usuario logueado',
        position: 'top'
      })
    }

    const payload = {
      name: name.value,
      description: description.value,
      workers: workers.value,
      area_id: areaId,
      tribute_id: userId,
      stateTask: 1,
      isMonthly: isMonthly.value
    }

    if (!isMonthly.value) {
      payload.delivery_date = date.value
    }

    if (isMonthly.value) {
      payload.monthlyDay = Number(monthlyDay.value) // ✅ Convertir a número
    }

    if (workers.value.length > 1) {
      payload.leader = leader.value
    }

    console.log('📤 Payload a enviar:', payload)

    const respuesta = await postTasks(payload)
    const tareaCreada = respuesta.task || respuesta

    console.log("Tarea creada:", tareaCreada)

    for (const workerId of workers.value) {
      try {
        const notifData = {
          title: "Nueva tarea asignada",
          nameTask: name.value,
          description: `Se te ha asignado una nueva tarea: ${description.value}`,
          deliveryDate: isMonthly.value ? null : date.value,
          task_id: tareaCreada._id,
          user_id: workerId,
          area_id: areaId
        }

        await createNotification(notifData)
      } catch (notifError) {
        console.error("Error al crear notificación para trabajador:", workerId, notifError)
      }
    }

    Notify.create({
      type: 'positive',
      message: 'Tarea creada correctamente',
      position: 'top'
    })

    showCreate.value = false
    name.value = ''
    description.value = ''
    date.value = ''
    leader.value = null
    workers.value = []
    crearArchivo.value = null
    crearLink.value = ''
    isMonthly.value = false
    monthlyDay.value = null

    obtenerTareas()

  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'Error al crear tarea',
      position: 'top'
    })
  }
}


// EDITAR
const abrirEditar = (task) => {
  editId.value = task._id
  editName.value = task.name
  editDescription.value = task.description
  editDate.value = task.delivery_date?.split('T')[0]
  editWorkers.value = Array.isArray(task.workers)
    ? task.workers.map(w => w._id)
    : []

  editState.value = task.stateTask

  showEdit.value = true
}

const verDetalles = (task) => {
  selectedTask.value = task
  showDetails.value = true
}

const actualizarTarea = async () => {
  try {
    const updated = {
      name: editName.value,
      description: editDescription.value,
      workers: editWorkers.value,
      delivery_date: editDate.value,
      stateTask: editState.value
    }

    await putTasks(editId.value, updated)
    Notify.create({ type: 'positive', message: 'Tarea actualizada', position: 'top' })
    showEdit.value = false
    obtenerTareas()

  } catch (error) {
    console.log(error)
    Notify.create({ type: 'negative', message: 'Error al actualizar', position: 'top' })
  }
}

const obtenerTareas = async () => {
  try {
    const rolActual = Number(localStorage.getItem('rol'))
    const userId = localStorage.getItem('userId')
    const areaIdActual = localStorage.getItem('areaId')

    let endpoint = ''
    let filtrarPorArea = false

    if (rolActual === 1) {
      endpoint = 'http://localhost:4000/tasks/seeTasks'
    } else if (rolActual === 2) {
      endpoint = 'http://localhost:4000/tasks/seeTasks'
      filtrarPorArea = true
    } else if (rolActual === 3) {
      endpoint = `http://localhost:4000/tasks/byWorker/${userId}`
    }

    const res = await axios.get(endpoint, getAuthHeaders())

    let lista = res.data

    if (filtrarPorArea) {
      lista = lista.filter(t => String(t.area_id) === String(areaIdActual))
    }

    tasks.value = lista.map((t, i) => ({
      ...t,
      index: i + 1
    }))

  } catch (error) {
    console.log(error)
  }
}


const obtenerTrabajadores = async () => {
  try {
    const res = await axios.get('http://localhost:4000/users/seeUsers', getAuthHeaders())

    if (rol === 1) {
      workersList.value = res.data.filter(u => u.rol === 3 && u.state === 1)
    } else {
      workersList.value = res.data.filter(u =>
        u.rol === 3 && u.state === 1 && String(u.area_id) === String(areaId)
      )
    }

  } catch (error) {
    console.log(error)
  }
}


onMounted(() => {
  obtenerTareas()
  obtenerTrabajadores()
})

</script>

<style scoped>
@import url(../style/Task.css);
</style>
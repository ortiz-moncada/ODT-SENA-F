<template>
  <div v-if="showCreate" class="overlay"></div>
 <div v-if="showCreate" class="modal">
  <div class="modal-header">
    <h2>Crear tarea</h2>
  </div>

  <div class="modal-body">
    <div class="form-grid">
      <div class="form-col">
        <q-input filled v-model="name" label="Nombre de la tarea" />
        
        <q-input 
          v-if="!isMonthly" 
          filled 
          v-model="date" 
          type="date" 
          :min="hoy" 
          label="Fecha de entrega" 
        />

        <q-select filled v-model="workers" :options="workersList" option-label="names" option-value="_id"
          label="Trabajadores asignados" emit-value map-options multiple use-chips />

        <q-select v-if="workers.length > 1" filled v-model="leader"
          :options="workersList.filter(w => workers.includes(w._id))" option-label="names" option-value="_id"
          label="Líder de la tarea" emit-value map-options />

        <q-toggle v-model="isMonthly" label="Tarea mensual" />
      </div>

      <div class="form-col">
        <q-input filled v-model="description" type="textarea" label="Descripción" autogrow />

        <div class="file-box">
          <q-btn dense flat icon="attach_file" @click="subirArchivoCrear" />
          <span>Adjuntar archivo</span>
          <div v-if="crearArchivo"><b>Archivo:</b> {{ crearArchivo.name }}</div>
          <div v-if="crearLink"><b>Link:</b> {{ crearLink }}</div>
        </div>

        <div v-if="isMonthly" class="q-gutter-y-sm">
          <q-input filled v-model.number="monthlyDay" type="number" min="1" max="28" label="Día del mes (1-28)" />
          <q-input 
            filled 
            v-model.number="monthlyPlazo" 
            type="number" 
            min="1" 
            label="Plazo de repetición (Meses)" 
            hint="¿Cuántos meses se debe generar esta tarea?" 
          />
        </div>
      </div>
    </div>
  </div>

  <div class="modal-footer">
    <q-btn :loading="loading" label="Crear tarea" style="background: var(--oneColor--); color: var(--white--);"
      @click="crearTarea" />
    <q-btn flat label="Cancelar" @click="showCreate = false"
      style="background: var(--sevenColor--); color: var(--white--);" />
  </div>
</div>

  <div v-if="showEdit" class="overlay"></div>
  <div v-if="showEdit" class="modal-edit">

    <div class="modal-header-edit">
      <h2>Editar Tarea</h2>
    </div>

    <div class="modal-body-edit">
      <div class="form-grid-edit">
        <!-- COLUMNA IZQUIERDA -->
        <div class="form-col-edit">
          <q-input filled v-model="editName" label="Nombre de la tarea" />
          <q-input filled v-model="editDate" type="date" label="Fecha de entrega" />
          <q-select filled v-model="editState" :options="[

            { label: 'Completada', value: 3 },
            { label: 'Rechazada', value: 4 },
          ]" label="Estado de la tarea" emit-value map-options />
        </div>
        <!-- COLUMNA DERECHA -->
        <div class="form-col-edit">
          <q-input filled v-model="editDescription" type="textarea" label="Descripción" autogrow />
          <q-select filled v-model="editWorkers" :options="workersList" option-label="names" option-value="_id"
            label="Trabajadores asignados" emit-value map-options multiple use-chips />

        </div>
      </div>
    </div>

    <div class="modal-footer-edit">
      <q-btn :loading="loading" style="background: var(--oneColor--); color: var(--white--);"
        @click="actualizarTarea">ACTUALIZAR
      </q-btn>

      <q-btn @click="showEdit = false" style="background: var(--sevenColor--); color: var(--white--);">CERRAR
      </q-btn>
    </div>

  </div>


  <div v-if="showDetails" class="overlay"></div>

<div v-if="showDetails" class="modal-details">
    <!-- HEADER -->
    <div class="modal-header-details">
      <h2>Detalles de la Tarea</h2>
    </div>

    <!-- BODY -->
    <div class="modal-body-details">

      <div class="details-grid">

        <!-- INFO TAREA -->
        <div class="card">
          <h3 class="card-title">
            Información de la tarea
            <img src="https://cdn-icons-png.flaticon.com/128/6389/6389264.png" />
          </h3>

          <p><span>Nombre:</span> {{ selectedTask.name }}</p>
          <p><span>Descripción:</span> {{ selectedTask.description }}</p>

          <p class="estado">
            <span>Estado:</span>
            <q-chip :label="stateMap[selectedTask.stateTask]?.label" :color="stateMap[selectedTask.stateTask]?.color"
              text-color="white" size="sm" />
          </p>
        </div>

        <!-- ENCARGADOS -->
        <div class="card">
          <h3 class="card-title">
            Encargado
            <img src="https://cdn-icons-png.flaticon.com/128/8237/8237612.png" />
          </h3>
          <p>
            <span>Trabajadores:</span>
            {{selectedTask.workers?.map(w => w.names).join(', ')}}
          </p>
        </div>

        <!-- FECHA -->
<div class="card">
  <h3 class="card-title">
    Fecha
    <img src="https://cdn-icons-png.flaticon.com/128/8302/8302434.png" />
  </h3>

  <p>
    <span>Fecha de creación:</span> 
    {{ selectedTask.createdAt ? formatDate(selectedTask.createdAt) : 'No disponible' }}
  </p>

  <template v-if="selectedTask.isMonthly">
    <p>
      <span>Recurrencia:</span>
      Todos los días {{ selectedTask.monthlyDay }} de cada mes
    </p>
    <p>
      <span>Plazo total:</span>
      {{ selectedTask.monthlyPlazo || 'Sin plazo definido' }} meses
    </p>
  </template>

  <p v-else>
    <span>Fecha de entrega:</span>
    {{ selectedTask.delivery_date ? formatDate(selectedTask.delivery_date) : 'Sin fecha' }}
  </p>
</div>

        <!-- ARCHIVOS -->
        <div class="card">
          <div class="card-archivos">
            <h3 class="card-title">Archivos Adjuntos 🖇️</h3>

            <div v-if="selectedTask.attached_files?.length" class="file-list">
              <a v-for="(file, index) in selectedTask.attached_files" :key="index" :href="file.url" target="_blank"
                class="file-item">
                {{ file.name || ('Archivo ' + (index + 1)) }}
              </a>
            </div>

            <p v-else class="empty">Sin archivos adjuntos</p>
          </div>
        </div>

      </div>

    </div>

    <div class="modal-footer-details">
 <div class="modal-footer-details">
  <div class="modal-footer-details">
  <template v-if="rol !== 3">
    <q-btn 
      class="approvedTask" 
      :loading="loading"
      style="background: var(--oneColor--); color: var(--white--);"
      @click="cambiarEstadoTarea(selectedTask._id, 3)"
    >Aprobar</q-btn>
  </template>
  
  <q-btn 
    class="close-btn" 
    style="background: var(--sevenColor--); color: var(--white--);"
    @click="showDetails = false"
  >CERRAR</q-btn>

  <template v-if="rol !== 3">
    <q-btn 
      class="denyTask" 
      :loading="loading"
      style="background: var(--nineColor--); color: var(--white--);"
      @click="cambiarEstadoTarea(selectedTask._id, 4)"
    >Rechazar</q-btn>
  </template>
</div>
</div>
    </div>

</div>


 <div v-if="showEntregaWorker" class="overlay"></div>

<div v-if="showEntregaWorker" class="modal">

  <!-- HEADER -->
  <div class="modal-header">
    <h1 style="font-weight: 600px;">Entregar tarea</h1>
  </div>

  <!-- BODY -->
  <div class="modal-body">

    <div class="deliver-info">
      <h3 class="section-title">Información de la tarea</h3>

      <p><span>Título:</span> {{ tareaEntrega?.name }}</p>
      <p class="deliver-description">
        <span>Descripción:</span> {{ tareaEntrega?.description }}
      </p>
    </div>

    <div class="deliver-actions">
      <q-btn
        color="primary"
        icon="attach_file"
        label="Adjuntar archivo"
        @click="seleccionarArchivoEntrega"
      />

      <div v-if="entregaFile" class="file-preview">
        <q-icon name="description" size="20px" />
        <span>{{ entregaFile.name }}</span>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="modal-footer">
    <q-btn
      :loading="loading"
      label="ENTREGAR"
      style="background: var(--oneColor--); color: white"
      @click="entregarTareaWorker"
    />
    <q-btn
      flat
      label="CERRAR"
      style="background: var(--sevenColor--); color: white"
      @click="showEntregaWorker = false"
    />
  </div>

</div>


  <Layouts_main>
    <h1 style="text-align: center;" :style="{ color: 'var(--oneColor--)' }">TAREAS</h1>
    <hr><br>
    <div class="header-principal">
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
    <q-item clickable v-close-popup @click="setOrden('desc', 'Más recientes')">
      <q-item-section>Más recientes</q-item-section>
    </q-item>
    <q-item clickable v-close-popup @click="setOrden('asc', 'Más antiguas')">
      <q-item-section>Más antiguas</q-item-section>
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
     @click="showCreate = !showCreate" />
    </div>

    <div class="q-pa-md">
      <q-table style="text-align: center; height: 400px; width: 97%; margin-left: 1%;" flat bordered
        :rows="filteredTasks" :columns="columns" row-key="_id" v-model:pagination="pagination"
        :rows-per-page-options="[0]" :no-data-label="' '">

        <template v-slot:body-cell-opcions="props">
          <q-td :props="props" class="text-center">
            <q-btn v-if="rol != 3" size="sm" color="primary" icon="edit" round dense class="q-ml-sm"
              @click="abrirEditar(props.row)" />

           <q-btn v-if="rol === 3 && esLider(props.row) && props.row.stateTask !== 2 && props.row.stateTask !== 3 && props.row.stateTask !== 5"
  size="sm" 
  color="green" 
  icon="upload" 
  round 
  dense 
  class="q-ml-sm"
  @click="abrirEntregaWorker(props.row)" 
/>

            <q-btn size="sm" color="secondary" icon="visibility" round dense class="q-ml-sm"
              @click="verDetalles(props.row)" />
          </q-td>
        </template>

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
    <div v-if="props.row.attached_files && props.row.attached_files.length">
      <div v-for="(file, index) in props.row.attached_files" :key="index" class="q-mb-xs">
        <q-icon name="insert_drive_file" size="xs" color="primary" />
        <a :href="file.url || `${API_URL}/${file.path}`" 
           target="_blank"
           style="color: #1976d2; text-decoration: none; font-weight: 500;">
          {{ file.name || `Archivo ${index + 1}` }}
        </a>
      </div>
    </div>
    <span v-else class="text-grey-6">Sin archivos</span>
  </q-td>
</template>

        <template v-slot:no-data>
          <div class="full-width column flex-center text-grey-7 q-pa-lg">
            <img src="../IMG/pregunta (1).png" alt="Sin datos" style="max-width: 15%; margin-bottom: 10px;" />
            <h5 v-if="tasks.length === 0"> No hay tareas registradas </h5>
            <h5 v-else> No hay tareas con los filtros aplicados </h5>
          </div>
        </template>

        <template v-slot:body-cell-description="props">
  <q-td :props="props">
    <div style="white-space: normal; line-height: 1.2;">
      {{ props.row.description && props.row.description.length > 50
        ? props.row.description.substring(0, 50) + '...'
        : props.row.description }}
    </div>
  </q-td>
</template>

<template v-slot:body-cell-name="props">
  <q-td :props="props">
    <span :title="props.row.name"> {{ props.row.name && props.row.name.length > 20
        ? props.row.name.substring(0, 20) + '...'
        : props.row.name }}
    </span>
  </q-td>
</template>

      </q-table>
    </div>
  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { Notify } from 'quasar'
import { postTasks, putTasks, createNotification } from '../services/servicesComponent'
import { useAdminStore } from '../store/administrador'
import api, { API_URL, getAuthHeaders } from '../services/api.js'

const store = useAdminStore()
const rol = Number(localStorage.getItem('rol'))
const areaId = store.getUserAreaId || localStorage.getItem('areaId')
const userId = localStorage.getItem('userId')

console.log(" Task.vue - areaId del store:", store.getUserAreaId)
console.log(" Task.vue - areaId del localStorage:", localStorage.getItem('areaId'))
console.log(" Task.vue - areaId final usado:", areaId)


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
const editState = ref(null)
const tasks = ref([])
const workersList = ref([])
const showEntregaWorker = ref(false)
const entregaFile = ref(null)
const tareaEntrega = ref(null)
const estadoLabel = ref('Estado')
const leader = ref(null)
const loading = ref(false)
const orden = ref("desc") // Recomendado iniciar con "desc" para ver las nuevas primero
const ordenLabel = ref('Más recientes') // Etiqueta inicial

const isMonthly = ref(false)
const monthlyDay = ref(null)
const monthlyPlazo = ref(null)

const esLider = (tarea) => {
  if (!tarea || !tarea.leader) return false
  const leaderId = typeof tarea.leader === 'object' ? tarea.leader._id : tarea.leader
  return String(leaderId) === String(userId)
}

watch(workers, (newWorkers) => {
  if (newWorkers.length === 1) leader.value = newWorkers[0]
  if (newWorkers.length === 0) leader.value = null
  if (leader.value && !newWorkers.includes(leader.value)) leader.value = null
})

const pagination = ref({ page: 1, rowsPerPage: 10 })

const columns = [
  { name: 'index', label: '#', field: (row) => row.index, align: 'center' },
  { name: 'name', label: 'Nombre', field: 'name', align: 'center', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'center', sortable: true },
  { name: 'workers', label: 'Trabajadores', field: row => row.workers?.map(w => w.names).join(', ') || 'Sin asignar', align: 'center' },
  { name: 'attached_files', label: 'Archivos' },
  { name: 'delivery_date', label: 'Fecha Entrega', field: (row) => formatDate(row.delivery_date), align: 'center' },
  { name: 'isMonthly', label: 'Mensual', align: 'center' },
  { name: 'delivery_date', label: 'Fecha Entrega', field: (row) => row.isMonthly ? `Día ${row.monthlyDay} (Mensual)` : formatDate(row.delivery_date),align: 'center' },
  { name: 'stateTask', label: 'Estado' },
  { name: 'opcions', label: 'Opciones' }
]

// Función para cambiar el estado desde los botones de Detalles
const cambiarEstadoTarea = async (taskId, nuevoEstado) => {
  try {
    loading.value = true;
    
    // El backend suele esperar un objeto con el campo stateTask
    const payload = {
      stateTask: nuevoEstado
    };

    await putTasks(taskId, payload);

    Notify.create({ 
      type: 'positive', 
      message: nuevoEstado === 3 ? 'Tarea aprobada' : 'Tarea rechazada' 
    });
    
    showDetails.value = false; // Cerramos el modal
    await obtenerTareas();     // Refrescamos la tabla
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    Notify.create({ type: 'negative', message: 'No se pudo cambiar el estado' });
  } finally {
    loading.value = false;
  }
};
const abrirEntregaWorker = (task) => {
  tareaEntrega.value = task
  entregaFile.value = null
  showEntregaWorker.value = true
}

const seleccionarArchivoEntrega = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.docx,.png,.jpg,.jpeg'
  input.onchange = e => { entregaFile.value = e.target.files[0] }
  input.click()
}

const entregarTareaWorker = async () => {
  try {
    if (!entregaFile.value) {
      return Notify.create({ type: 'negative', message: 'Adjunte un archivo' });
    }

    loading.value = true;
    const formData = new FormData();
    formData.append("file", entregaFile.value); // Coincide con req.files.file
    formData.append("userId", userId); // Backup por si el token falla

    // IMPORTANTE: Asegúrate que api.post sea el método correcto según tu router
    const response = await api.post(`/tasks/entregar/${tareaEntrega.value._id}`, formData, {
      headers: {
        ...getAuthHeaders().headers,
        "Content-Type": "multipart/form-data"
      }
    });

    Notify.create({ type: 'positive', message: 'Entrega enviada con éxito' });
    showEntregaWorker.value = false;
    entregaFile.value = null;
    await obtenerTareas();
    
  } catch (error) {
    console.error("Error entrega:", error);
    Notify.create({ type: 'negative', message: error.response?.data?.error || "Error en entrega" });
  } finally {
    loading.value = false;
  }
};

const setOrden = (valor, texto) => { orden.value = valor; ordenLabel.value = texto }
const setEstado = (valor, texto) => { filterStated.value = valor; estadoLabel.value = texto }

const stateMap = {
  1: { label: "En Desarrollo", color: "blue" },
  2: { label: "En Revisión", color: "orange" },
  3: { label: "Completada", color: "green" },
  4: { label: "Rechazada", color: "red" },
  5: { label: "Vencida", color: "grey" }
}

const hoy = new Date().toISOString().slice(0, 10)

const filteredTasks = computed(() => {
  let lista = [...tasks.value]

  if (search.value.trim() !== "") {
    const term = search.value.toLowerCase()
    lista = lista.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.workers?.map(w => w.names).join(', ').toLowerCase().includes(term)
    )
  }
  if (filterStated.value !== null) {
    lista = lista.filter(t => Number(t.stateTask) === Number(filterStated.value))
  }
  lista.sort((a, b) => {
    const fechaA = new Date(a.createdAt || 0).getTime()
    const fechaB = new Date(b.createdAt || 0).getTime()

    if (orden.value === "desc") {
      return fechaB - fechaA
    } else {
      return fechaA - fechaB
    }
  })

  return lista
})

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  const f = new Date(date)
  return `${f.getDate().toString().padStart(2, '0')}/${(f.getMonth() + 1).toString().padStart(2, '0')}/${f.getFullYear()}`
}

const subirArchivoCrear = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.png,.jpg,.jpeg,.docx'
  input.onchange = e => crearArchivo.value = e.target.files[0]
  input.click()
}

const crearTarea = async () => {
  try {
    // 1. Validaciones iniciales de seguridad
    if (!areaId || areaId === 'undefined' || areaId === 'null') {
      return Notify.create({ 
        type: 'negative', 
        message: 'No tienes un área asignada. No puedes crear tareas.' 
      });
    }

    if (!name.value || !description.value || workers.value.length === 0) {
      return Notify.create({ 
        type: 'negative', 
        message: 'Complete los campos obligatorios (Nombre, Descripción y Trabajadores)' 
      });
    }

    // 2. Validación específica para Tareas Mensuales
    if (isMonthly.value) {
      if (!monthlyDay.value || monthlyDay.value < 1 || monthlyDay.value > 28) {
        return Notify.create({ type: 'negative', message: 'Indique un día válido (1-28) para la tarea mensual' });
      }
      if (!monthlyPlazo.value || monthlyPlazo.value < 1) {
        return Notify.create({ type: 'negative', message: 'Indique cuántos meses se repetirá la tarea (Plazo)' });
      }
    } else {
      // Si no es mensual, la fecha de entrega es obligatoria
      if (!date.value) {
        return Notify.create({ type: 'negative', message: 'Seleccione una fecha de entrega' });
      }
    }

    loading.value = true;

    // 3. Construcción del FormData
    const formData = new FormData();
    formData.append("name", name.value.trim());
    formData.append("description", description.value.trim());
    formData.append("area_id", areaId);
    formData.append("tribute_id", userId);
    formData.append("isMonthly", isMonthly.value);
    
    // Convertir array de trabajadores a string JSON para el backend
    formData.append("workers", JSON.stringify(workers.value));
    
    // Definir líder: si hay varios usa el seleccionado, si hay uno solo usa ese
    const taskLeader = workers.value.length > 1 ? leader.value : workers.value[0];
    formData.append("leader", taskLeader);

    // 4. Lógica condicional de envío (Mensual vs Única)
    if (isMonthly.value) {
      formData.append("monthlyDay", Number(monthlyDay.value));
      formData.append("monthlyPlazo", Number(monthlyPlazo.value)); 
    } else {
      formData.append("delivery_date", date.value);
    }

    // Adjuntar archivo si existe
    if (crearArchivo.value) {
      formData.append("file", crearArchivo.value); 
    }

    // 5. Petición al servidor
    await postTasks(formData);
    
    // 6. Respuesta exitosa
    Notify.create({ 
      type: 'positive', 
      message: 'Tarea creada con éxito' 
    });
    
    showCreate.value = false;
    limpiarFormulario();
    await obtenerTareas(); // Recargar la tabla

  } catch (error) {
    console.error("❌ Error al crear la tarea:", error);
    
    // Capturar el mensaje de error que viene del backend o uno por defecto
    const mensajeError = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Error interno al procesar la tarea";
                         
    Notify.create({ 
      type: 'negative', 
      message: mensajeError 
    });
  } finally {
    loading.value = false;
  }
};

// Función auxiliar para limpiar el formulario
const limpiarFormulario = () => {
  name.value = '';
  description.value = '';
  date.value = '';
  workers.value = [];
  leader.value = null;
  crearArchivo.value = null;
  crearLink.value = '';
  isMonthly.value = false;
  monthlyDay.value = null;
  monthlyPlazo.value = null;
};

const abrirEditar = (task) => {
  editId.value = task._id; 
  editName.value = task.name; 
  editDescription.value = task.description
  editDate.value = task.delivery_date?.split('T')[0]
  editWorkers.value = Array.isArray(task.workers) ? task.workers.map(w => w._id) : []
  editState.value = task.stateTask
  showEdit.value = true
}

const verDetalles = (task) => { 
  console.log("Datos de la tarea seleccionada:", task);
  selectedTask.value = task; 
  showDetails.value = true 
}

const actualizarTarea = async () => {
  try {
    loading.value = true;
    
    // Obtenemos el estado que tenía antes de editar
    const estadoPrevio = tasks.value.find(t => t._id === editId.value)?.stateTask;

    const payload = {
      name: editName.value,
      description: editDescription.value,
      workers: editWorkers.value,
      delivery_date: editDate.value,
      stateTask: editState.value,
      estadoAnterior: estadoPrevio // <--- El backend lo usará para el correo
    };

    // Llamada al servicio
    await putTasks(editId.value, payload);

    Notify.create({ type: 'positive', message: 'Tarea actualizada correctamente' });
    showEdit.value = false;
    await obtenerTareas();

  } catch (error) {
    Notify.create({ type: 'negative', message: error.response?.data?.error || "Error al actualizar" });
  } finally {
    loading.value = false;
  }
};

const obtenerTareas = async () => {
  try {
    let endpoint = ''
    if (rol === 1 || rol === 2) {
      endpoint = `/tasks/seeTasks`
    } else if (rol === 3) {
      endpoint = `/tasks/byWorker/${userId}`
    }

    const res = await api.get(endpoint)
    let lista = Array.isArray(res.data) ? res.data : []

    // FILTRO PARA ADMINISTRADOR (ROL 2)
    if (rol === 2) {
      lista = lista.filter(t => {
        const tAreaId = t.area_id?._id || t.area_id;
        return tAreaId && String(tAreaId) === String(areaId);
      });
    }

    // Mapeamos para agregar el índice visual
    tasks.value = lista.map((t, i) => ({ 
      ...t, 
      index: i + 1,
      areaName: t.area_id?.name || 'Sin área'
    }))

  } catch (error) {
    console.error("Error al obtener tareas:", error)
    Notify.create({
      type: 'negative',
      message: 'No se pudieron cargar las tareas'
    })
  }
}

const obtenerTrabajadores = async () => {
  try {
    const res = await api.get(`/users/seeUsers`)
    const todosLosUsuarios = res.data
    
    const miAreaIdActual = areaId; // 
    const miRolActual = Number(localStorage.getItem('rol'));

    console.log("🔍 DEBUG -> Mi Rol:", miRolActual, "| Mi AreaID:", miAreaIdActual);

    if (miRolActual === 1) {
      workersList.value = todosLosUsuarios.filter(u => Number(u.rol) === 3);
      console.log(`✅ SuperAdmin: ${workersList.value.length} trabajadores cargados`);
    } else if (miRolActual === 2) {
      if (!miAreaIdActual || miAreaIdActual === 'undefined' || miAreaIdActual === 'null') {
        console.error("❌ ALERTA: El Admin no tiene AreaID");
        Notify.create({
          type: 'warning',
          message: 'Tu usuario no tiene un área asignada. Contacta al administrador.',
          timeout: 5000
        });
        workersList.value = [];
        return;
      }

      workersList.value = todosLosUsuarios.filter(u => {
        const userArea = u.area_id || u.areaId; 
        const userAreaId = userArea?._id ? String(userArea._id) : String(userArea);
        return Number(u.rol) === 3 && userAreaId === String(miAreaIdActual);
      });
      
      console.log(`Admin de Área: ${workersList.value.length} trabajadores de área ${miAreaIdActual}`);
    }
  } catch (error) {
    console.error("Error al obtener trabajadores:", error)
    Notify.create({
      type: 'negative',
      message: 'Error al cargar trabajadores'
    })
  }
}

//  VALIDACIÓN CRÍTICA AL MONTAR EL COMPONENTE
onMounted(() => {
  console.log(" Montando componente Task.vue...");
  console.log(" Datos en localStorage:");
  console.log(" userId:", userId);
  console.log(" rol:", rol);
  console.log(" areaId:", areaId);

  // Verificar que areaId existe y no es "undefined"
  if (!areaId || areaId === 'undefined' || areaId === 'null') {
    console.error('❌ ERROR CRÍTICO: No hay areaId válido en localStorage');
    
    Notify.create({
      type: 'negative',
      message: 'Error: No se ha asignado un área a tu usuario. Algunas funcionalidades estarán deshabilitadas. Contacta al administrador.',
      timeout: 8000,
      position: 'top'
    });
    
    // Aún así cargamos tareas y trabajadores para que el componente no quede vacío
    obtenerTareas();
    obtenerTrabajadores();
    return;
  }
  
  console.log('✅ areaId válido detectado');
  obtenerTareas();
  obtenerTrabajadores();
})
</script>

<style scoped>
@import url(../style/Task.css);
</style>
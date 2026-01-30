<template>
  <div v-if="showCreate" class="overlay"></div>
  <div v-if="showCreate" class="modal">

    <div class="modal-header">
      <h2>Crear tarea</h2>
    </div>

    <div class="modal-body">
      <div class="form-grid">
        <!-- COLUMNA IZQUIERDA -->
        <div class="form-col">
          <q-input filled v-model="name" label="Nombre de la tarea" />
          <q-input filled v-model="date" type="date" :min="hoy" label="Fecha de entrega" />

          <q-select filled v-model="workers" :options="workersList" option-label="names" option-value="_id"
            label="Trabajadores asignados" emit-value map-options multiple use-chips />

          <q-select v-if="workers.length > 1" filled v-model="leader"
            :options="workersList.filter(w => workers.includes(w._id))" option-label="names" option-value="_id"
            label="Líder de la tarea" emit-value map-options />

          <q-toggle v-model="isMonthly" label="Tarea mensual" />


        </div>

        <!-- COLUMNA DERECHA -->
        <div class="form-col">
          <q-input filled v-model="description" type="textarea" label="Descripción" autogrow />

          <div class="file-box">
            <q-btn dense flat icon="attach_file" @click="subirArchivoCrear" />
            <span>Adjuntar archivo</span>

            <div v-if="crearArchivo"><b>Archivo:</b> {{ crearArchivo.name }}</div>
            <div v-if="crearLink"><b>Link:</b> {{ crearLink }}</div>
          </div>
          <q-input v-if="isMonthly" type="number" min="1" max="28" v-model="monthlyDay" label="Día del mes" />
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
            { label: 'En Desarrollo', value: 1 },
            { label: 'En Revisión', value: 2 },
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
            <span>Entrega:</span>
            {{ formatDate(selectedTask.delivery_date) }}
          </p>
        </div>

        <!-- ARCHIVOS -->
        <div class="card">
          <div class="card-archivos">
            <h3 class="card-title">📎 Archivos Adjuntos</h3>

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
      <q-btn class="close-btn" style="background: var(--sevenColor--); color: var(--white--);"
        @click="showDetails = false">
        CERRAR
      </q-btn>
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

            <q-btn v-if="rol === 3 && esLider(props.row) && props.row.stateTask !== 3 && props.row.stateTask !== 5"
              size="sm" color="green" icon="upload" round dense class="q-ml-sm"
              @click="abrirEntregaWorker(props.row)" />

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
            <div v-if="props.row.attached_files?.length">
              <div v-for="(file, index) in props.row.attached_files" :key="index">
                <a :href="file.url || `${API_URL}/tasks/byWorker/${file.path}`" target="_blank"
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
            <h5 v-if="tasks.length === 0"> No hay tareas registradas </h5>
            <h5 v-else> No hay tareas con los filtros aplicados </h5>
          </div>
        </template>

        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            {{ props.row.description && props.row.description.length > 60
              ? props.row.description.substring(0, 60) + '...'
              : props.row.description }}
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
import api, { API_URL } from '../services/api.js'
import { postTasks, putTasks, createNotification } from '../services/servicesComponent'
import { useAdminStore } from '../store/administrador'

const store = useAdminStore()
const rol = Number(localStorage.getItem('rol'))
const areaId = store.getUserAreaId || localStorage.getItem('areaId')
const userId = localStorage.getItem('userId')

console.log("🔍 Task.vue - areaId del store:", store.getUserAreaId)
console.log("🔍 Task.vue - areaId del localStorage:", localStorage.getItem('areaId'))
console.log("🔍 Task.vue - areaId final usado:", areaId)


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
const orden = ref("asc")
const showEntregaWorker = ref(false)
const entregaFile = ref(null)
const tareaEntrega = ref(null)
const ordenLabel = ref('Ordenar')
const estadoLabel = ref('Estado')
const leader = ref(null)
const loading = ref(false)

const isMonthly = ref(false)
const monthlyDay = ref(null)

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
  input.onchange = e => { entregaFile.value = e.target.files[0] }
  input.click()
}

const entregarTareaWorker = async () => {
  try {
    loading.value = true;
    if (!entregaFile.value) {
      return Notify.create({ type: 'negative', message: 'Debe adjuntar un archivo' });
    }

    const formData = new FormData();
    formData.append("file", entregaFile.value);

    await api.post(`/tasks/entregar/${tareaEntrega.value._id}`, formData);

    // Notificamos al creador de la tarea (tribute_id)
    await createNotification({
      title: "Tarea Entregada (Para Revisión)",
      nameTask: tareaEntrega.value.name,
      description: `El trabajador ha entregado la tarea. Estado: 2`,
      task_id: tareaEntrega.value._id,
      user_id: tareaEntrega.value.tribute_id,
      area_id: areaId
    });
    loading.value = false;
    Notify.create({ type: 'positive', message: 'Tarea entregada correctamente' });
    showEntregaWorker.value = false;
    await obtenerTareas();
  } catch (error) {
    console.error(error)
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
  let lista = tasks.value
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
    const A = a.name.toLowerCase(); const B = b.name.toLowerCase()
    return orden.value === "asc" ? A.localeCompare(B) : B.localeCompare(A)
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
    // 1. VALIDACIÓN DE AREAID
    if (!areaId || areaId === 'undefined' || areaId === 'null') {
      return Notify.create({ 
        type: 'negative', 
        message: 'Error: No tienes un área asignada. Contacta al administrador.',
        timeout: 5000
      });
    }

    // 2. VALIDACIONES DE CAMPOS OBLIGATORIOS
    if (!name.value || !description.value || workers.value.length === 0) {
      return Notify.create({ 
        type: 'negative', 
        message: 'Por favor, complete nombre, descripción y asigne trabajadores' 
      });
    }

    if (isMonthly.value && (!monthlyDay.value || monthlyDay.value < 1 || monthlyDay.value > 28)) {
      return Notify.create({ 
        type: 'negative', 
        message: 'Día mensual inválido (1-28)' 
      });
    }

    if (!isMonthly.value && !date.value) {
      return Notify.create({ 
        type: 'negative', 
        message: 'Debe seleccionar una fecha de entrega' 
      });
    }

    loading.value = true;
   console.log("Archivo a enviar:", crearArchivo.value)
    // 3. CONSTRUCCIÓN DEL FORMDATA (Para poder enviar archivos)
    const formData = new FormData();
    
    formData.append("name", name.value.trim());
    formData.append("description", description.value.trim());
    formData.append("area_id", areaId);
    formData.append("tribute_id", userId);
    formData.append("stateTask", "1");
    formData.append("isMonthly", isMonthly.value);

    // Los arrays deben enviarse como String JSON para que el backend los procese bien
    formData.append("workers", JSON.stringify(workers.value));
    
    const taskLeader = workers.value.length > 1 ? leader.value : workers.value[0];
    formData.append("leader", taskLeader);

    if (isMonthly.value) {
      formData.append("monthlyDay", Number(monthlyDay.value));
    } else {
      formData.append("delivery_date", date.value);
    }

    // ADJUNTAR EL ARCHIVO FÍSICO
    if (crearArchivo.value) {
      formData.append("file", crearArchivo.value); 
    }

    // 4. ENVÍO AL BACKEND
    console.log("🚀 Enviando FormData con archivo...");
    const respuesta = await postTasks(formData);
    
    // Extraemos la tarea creada (ajusta según cómo responda tu API)
    const tareaCreada = respuesta.data?.task || respuesta.task || respuesta;

    // 5. NOTIFICACIONES A TRABAJADORES
    for (const workerId of workers.value) {
      try {
        await createNotification({
          title: "Nueva tarea asignada",
          nameTask: name.value,
          description: `Se te ha asignado una nueva tarea: ${name.value}`,
          deliveryDate: isMonthly.value ? `Día ${monthlyDay.value} de cada mes` : date.value,
          task_id: tareaCreada._id,
          user_id: workerId,
          area_id: areaId
        });
      } catch (notifError) {
        console.warn("⚠️ No se pudo notificar al trabajador:", workerId);
      }
    }

    // 6. FEEDBACK Y LIMPIEZA
    Notify.create({
      type: 'positive',
      message: 'Tarea creada y archivo subido con éxito',
      position: 'top'
    });

    showCreate.value = false;
    await obtenerTareas();
    limpiarFormulario();

  } catch (error) {
    console.error("❌ Error al crear tarea:", error);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error al subir la tarea o el archivo";
    
    Notify.create({
      type: 'negative',
      message: errorMsg,
      position: 'top'
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
  selectedTask.value = task; 
  showDetails.value = true 
}

const actualizarTarea = async () => {
  try {
    loading.value = true;
    await putTasks(editId.value, {
      name: editName.value,
      description: editDescription.value,
      workers: editWorkers.value,
      delivery_date: editDate.value,
      stateTask: editState.value
    });
    
    const estadoTexto = stateMap[editState.value]?.label || "actualizado";

    for (const workerId of editWorkers.value) {
      await createNotification({
        title: `Estado actualizado: ${estadoTexto}`,
        nameTask: editName.value,
        description: `La tarea cambió al estado: ${editState.value}`,
        deliveryDate: editDate.value,
        task_id: editId.value,
        user_id: workerId,
        area_id: areaId
      });
    }

    loading.value = false;
    Notify.create({ type: 'positive', message: 'Tarea actualizada' });
    showEdit.value = false;
    obtenerTareas();
  } catch (error) {
    loading.value = false;
    console.error("Error al actualizar tarea:", error);
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
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
    
    const miAreaIdActual = areaId; // ✅ Usar la variable directamente
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
      
      console.log(`✅ Admin de Área: ${workersList.value.length} trabajadores de área ${miAreaIdActual}`);
    }
  } catch (error) {
    console.error("❌ Error al obtener trabajadores:", error)
    Notify.create({
      type: 'negative',
      message: 'Error al cargar trabajadores'
    })
  }
}

//  VALIDACIÓN CRÍTICA AL MONTAR EL COMPONENTE
onMounted(() => {
  console.log("🚀 Montando componente Task.vue...");
  console.log("📊 Datos en localStorage:");
  console.log("   - userId:", userId);
  console.log("   - rol:", rol);
  console.log("   - areaId:", areaId);

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
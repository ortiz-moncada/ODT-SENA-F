<template>
  <Layouts_main>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-weight-bold text-primary q-my-none">TAREAS</h1>
      </div>
      <div class="col-auto">
        <q-btn
          v-if="rol !== 3"
          color="primary"
          icon="add"
          label="Crear Tarea"
          @click="showCreate = true"
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
            placeholder="Buscar tarea..."
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
            :label="ordenLabel"
            class="full-width"
            icon="sort"
          >
            <q-list>
              <q-item clickable v-close-popup @click="setOrden('desc', 'Más recientes')">
                <q-item-section>Más recientes</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setOrden('asc', 'Más antiguas')">
                <q-item-section>Más antiguas</q-item-section>
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
              <q-item v-for="(val, key) in stateMap" :key="key" clickable v-close-popup @click="setEstado(key, val.label)">
                <q-item-section>{{ val.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="filteredTasks"
      :columns="columns"
      row-key="_id"
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 50, 0]"
      :loading="loading"
      loading-label="Cargando cronograma de tareas..."
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="40px" color="primary" />
        </q-inner-loading>
      </template>

      <template v-slot:body-cell-opcions="props">
        <q-td :props="props" class="q-gutter-xs text-center">
          <q-btn
            v-if="rol !== 3"
            size="sm"
            flat
            round
            color="primary"
            icon="edit"
            @click="abrirEditar(props.row)"
          >
            <q-tooltip>Modificar Tarea</q-tooltip>
          </q-btn>
          <q-btn
            v-if="rol === 3 && esLider(props.row) && props.row.stateTask !== 2 && props.row.stateTask !== 3 && props.row.stateTask !== 5"
            size="sm"
            flat
            round
            color="positive"
            icon="cloud_upload"
            @click="abrirEntregaWorker(props.row)"
          >
            <q-tooltip>Cargar Entrega</q-tooltip>
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

      <template v-slot:body-cell-stateTask="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :label="stateMap[props.row.stateTask]?.label"
            :color="stateMap[props.row.stateTask]?.color"
            text-color="white"
            size="sm"
            class="text-weight-bold"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-attached_files="props">
        <q-td :props="props" class="text-center">
          <div v-if="props.row.attached_files?.length">
            <q-btn flat dense round size="sm" icon="description" color="primary">
              <q-badge color="negative" floating style="width: 12px; height: 12px; padding: 2px; min-height: 0;">{{ props.row.attached_files.length }}</q-badge>
              <q-menu>
                <q-list dense style="min-width: 180px">
                  <q-item-label header class="text-weight-bold">Archivos Adjuntos</q-item-label>
                  <q-item v-for="(file, index) in props.row.attached_files" :key="index" clickable v-close-popup tag="a" :href="file.url" target="_blank">
                    <q-item-section avatar><q-icon name="insert_drive_file" color="grey-7" size="20px" /></q-item-section>
                    <q-item-section class="text-caption">{{ file.name || `Documento ${index + 1}` }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <span v-else class="text-grey-5 text-caption">N/A</span>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width column flex-center text-grey-7 q-pa-xl">
          <q-icon name="assignment_turned_in" size="64px" color="grey-4" />
          <div class="text-h6 q-mt-md text-weight-regular">
            {{ tasks.length === 0 ? 'Sin tareas registradas' : 'No se encontraron coincidencias' }}
          </div>
        </div>
      </template>
    </q-table>

    <!-- MODAL CREAR TAREA -->
    <q-dialog v-model="showCreate" persistent transition-show="scale" transition-hide="scale">
      <q-card flat bordered style="width: 800px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="bg-white text-primary row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Programar Nueva Tarea</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="limpiarFormulario" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input outlined v-model="name" label="Título de la actividad" class="q-mb-sm" dense />
              <q-input v-if="!isMonthly" outlined v-model="date" type="date" :min="hoy" label="Fecha Límite" class="q-mb-sm" dense />
              <q-select
                outlined
                v-model="workers"
                :options="workersList"
                option-label="names"
                option-value="_id"
                label="Asignar Colaboradores"
                multiple
                use-chips
                emit-value
                map-options
                class="q-mb-sm"
                dense
              />
              <q-select
                v-if="workers.length > 1"
                outlined
                v-model="leader"
                :options="workersList.filter(w => workers.includes(w._id))"
                option-label="names"
                option-value="_id"
                label="Definir Responsable Principal"
                emit-value
                map-options
                class="q-mb-sm"
                dense
              />
              <q-toggle v-model="isMonthly" label="Actividad Recurrente (Mensual)" color="primary" dense />
            </div>

            <div class="col-12 col-md-6">
              <q-input outlined v-model="description" type="textarea" label="Descripción de la Tarea" autogrow class="q-mb-sm" dense />
              
              <div class="bg-grey-1 q-pa-md rounded-borders border-grey-3 q-mb-md">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-sm uppercase">Gestión de Archivos</div>
                <div class="row items-center q-gutter-sm">
                  <q-btn color="primary" unelevated size="sm" icon="attach_file" label="Adjuntar Guía" @click="subirArchivoCrear" />
                  <span v-if="crearArchivo" class="text-caption text-weight-medium text-primary ellipsis" style="max-width: 150px">{{ crearArchivo.name }}</span>
                </div>
              </div>

              <div v-if="isMonthly" class="q-gutter-y-sm bg-green-1 q-pa-md rounded-borders border-primary">
                <div class="text-caption text-weight-bold text-primary">PARAMETRIZACIÓN RECURRENTE</div>
                <q-input outlined v-model.number="monthlyDay" type="number" min="1" max="28" label="Día de Ejecución (1-28)" dense bg-color="white" />
                <q-input outlined v-model.number="monthlyPlazo" type="number" min="1" label="Vigencia en Meses" dense bg-color="white" />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup @click="limpiarFormulario" />
          <q-btn unelevated color="primary" label="Crear Tarea" :loading="loading" @click="crearTarea" rounded class="q-px-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL EDITAR TAREA -->
    <q-dialog v-model="showEdit" persistent transition-show="scale" transition-hide="scale">
      <q-card flat bordered style="width: 750px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="bg-white text-primary row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Actualizar Información de Tarea</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input outlined v-model="editName" label="Título de la tarea" class="q-mb-sm" dense />
              <q-input outlined v-model="editDate" type="date" label="Nueva Fecha Límite" class="q-mb-sm" dense />
              <q-select
                outlined
                v-model="editState"
                :options="[{ label: 'Completada (Validada)', value: 3 }, { label: 'Rechazada (Revisión)', value: 4 }]"
                label="Cambiar Estado de Gestión"
                emit-value
                map-options
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input outlined v-model="editDescription" type="textarea" label="Ajustar Descripción" autogrow class="q-mb-sm" dense />
              <q-select
                outlined
                v-model="editWorkers"
                :options="workersList"
                option-label="names"
                option-value="_id"
                label="Actualizar Equipo"
                multiple
                use-chips
                emit-value
                map-options
                dense
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Descartar" color="grey-7" v-close-popup />
          <q-btn unelevated color="primary" label="Actualizar Registro" :loading="loading" @click="actualizarTarea" rounded class="q-px-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL DETALLES - SIN AVATARES -->
    <q-dialog v-model="showDetails">
      <q-card flat bordered style="width: 600px; max-width: 95vw; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-md">
          <div class="text-h6 text-weight-bold">Detalles de Tarea</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-px-lg q-pb-md">
          <div class="column items-center q-mb-lg">
            <q-icon name="assignment" size="48px" color="primary" class="q-mb-sm" />
            <div class="text-h5 text-weight-bold text-center text-primary">{{ selectedTask.name }}</div>
            <div class="text-body2 text-grey-7 text-center q-mt-xs q-px-md">{{ selectedTask.description }}</div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-list dense class="rounded-borders border-grey-2">
                <q-item class="q-py-sm">
                  <q-item-section avatar><q-icon name="info" color="primary" size="20px" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption class="text-weight-bold uppercase" style="font-size: 9px;">Estado Actual</q-item-label>
                    <q-item-label>
                      <q-chip dense :label="stateMap[selectedTask.stateTask]?.label" :color="stateMap[selectedTask.stateTask]?.color" text-color="white" size="xs" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="q-py-sm">
                  <q-item-section avatar><q-icon name="event" color="primary" size="20px" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption class="text-weight-bold uppercase" style="font-size: 9px;">Plazo / Recurrencia</q-item-label>
                    <q-item-label class="text-weight-medium">
                      {{ selectedTask.isMonthly ? `Día ${selectedTask.monthlyDay} de cada mes` : formatDate(selectedTask.delivery_date) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 col-sm-6">
              <q-list dense class="rounded-borders border-grey-2">
                <q-item class="q-py-sm">
                  <q-item-section avatar><q-icon name="group" color="primary" size="20px" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption class="text-weight-bold uppercase" style="font-size: 9px;">Equipo Asignado</q-item-label>
                    <q-item-label class="text-caption text-weight-medium">{{ selectedTask.workers?.map(w => w.names).join(', ') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="selectedTask.attached_files?.length" class="q-py-sm">
                  <q-item-section avatar><q-icon name="file_present" color="primary" size="20px" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption class="text-weight-bold uppercase" style="font-size: 9px;">Evidencias / Guías</q-item-label>
                    <div class="row q-gutter-xs q-mt-xs">
                      <q-btn v-for="(f, i) in selectedTask.attached_files" :key="i" dense flat color="blue-7" icon="download" size="xs" :href="f.url" target="_blank" label="Ver archivo" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-separator inset />

        <q-card-actions align="center" class="q-pa-md q-gutter-md">
          <template v-if="rol !== 3">
            <q-btn unelevated color="positive" icon="done_all" label="Aprobar Tarea" @click="cambiarEstadoTarea(selectedTask._id, 3)" :loading="loading" rounded class="q-px-md" />
            <q-btn unelevated color="negative" icon="history_edu" label="Solicitar Corrección" @click="cambiarEstadoTarea(selectedTask._id, 4)" :loading="loading" rounded class="q-px-md" />
          </template>
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup class="q-px-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL ENTREGAR TAREA (TRABAJADOR) -->
    <q-dialog v-model="showEntregaWorker" persistent transition-show="slide-up" transition-hide="slide-down">
      <q-card flat bordered style="width: 500px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6 text-weight-bold">Consignar Evidencia de Tarea</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-subtitle1 text-weight-bold text-primary">{{ tareaEntrega?.name }}</div>
          <div class="text-caption text-grey-7 q-mb-lg">{{ tareaEntrega?.description }}</div>
          
          <div class="column items-center q-pa-xl bg-grey-1 rounded-borders dashed-border">
            <q-icon name="drive_folder_upload" size="56px" color="primary" class="q-mb-md" />
            <div class="text-body2 text-weight-bold text-grey-8 text-center">Seleccione el documento de respaldo</div>
            <div class="text-caption text-grey-6 text-center q-mb-md">Formatos admitidos: PDF, JPG, PNG, DOCX</div>
            <q-btn color="primary" label="Cargar Documento" @click="seleccionarArchivoEntrega" unelevated rounded class="q-px-lg" />
            <div v-if="entregaFile" class="q-mt-md bg-green-1 q-pa-sm rounded-borders row items-center border-primary">
              <q-icon name="check_circle" color="primary" size="20px" class="q-mr-sm" />
              <span class="text-caption text-weight-bold text-primary ellipsis" style="max-width: 200px">{{ entregaFile.name }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated color="positive" icon="send" label="Enviar Entrega" :loading="loading" @click="entregarTareaWorker" rounded class="q-px-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </Layouts_main>
</template>

<script setup>
import Layouts_main from '../layouts/layouts_main.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { Notify } from 'quasar'
import { postTasks, putTasks } from '../services/servicesComponent'
import { useAdminStore } from '../store/administrador'
import api, { getAuthHeaders } from '../services/api.js'

const store = useAdminStore()
const rol = Number(localStorage.getItem('rol'))
const areaId = store.getUserAreaId || localStorage.getItem('areaId')
const userId = localStorage.getItem('userId')

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
const estadoLabel = ref('Filtrar Estado')
const leader = ref(null)
const loading = ref(false)
const orden = ref("desc")
const ordenLabel = ref('Más recientes')

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
  { name: 'name', label: 'Tarea', field: 'name', align: 'left', sortable: true },
  { name: 'workers', label: 'Personal', field: row => row.workers?.map(w => w.names).join(', ') || 'Sin asignar', align: 'left' },
  { name: 'attached_files', label: 'Adjuntos', align: 'center' },
  { name: 'delivery_date', label: 'Vencimiento/Día', field: (row) => row.isMonthly ? `Día ${row.monthlyDay}` : formatDate(row.delivery_date), align: 'center' },
  { name: 'stateTask', label: 'Estado', align: 'center' },
  { name: 'opcions', label: 'Acciones', align: 'center' }
]

const cambiarEstadoTarea = async (taskId, nuevoEstado) => {
  try {
    loading.value = true;
    await putTasks(taskId, { stateTask: nuevoEstado });
    Notify.create({ type: 'positive', message: nuevoEstado === 3 ? 'Tarea aprobada' : 'Tarea rechazada' });
    showDetails.value = false;
    await obtenerTareas();
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al cambiar estado' });
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
    if (!entregaFile.value) return Notify.create({ type: 'negative', message: 'Adjunte un archivo' });
    loading.value = true;
    const formData = new FormData();
    formData.append("file", entregaFile.value);
    formData.append("userId", userId);
    await api.post(`/tasks/entregar/${tareaEntrega.value._id}`, formData, {
      headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" }
    });
    Notify.create({ type: 'positive', message: 'Entrega enviada con éxito' });
    showEntregaWorker.value = false;
    await obtenerTareas();
  } catch (error) {
    Notify.create({ type: 'negative', message: error.response?.data?.error || "Error en entrega" });
  } finally {
    loading.value = false;
  }
};

const setOrden = (valor, texto) => { orden.value = valor; ordenLabel.value = texto }
const setEstado = (valor, texto) => { filterStated.value = valor; estadoLabel.value = texto || 'Todos los Estados' }

const stateMap = {
  1: { label: "En Desarrollo", color: "blue" },
  2: { label: "En Revisión", color: "orange" },
  3: { label: "Completada", color: "positive" },
  4: { label: "Rechazada", color: "negative" },
  5: { label: "Vencida", color: "grey-7" }
}

const hoy = new Date().toISOString().slice(0, 10)

const filteredTasks = computed(() => {
  let lista = [...tasks.value]
  if (search.value.trim() !== "") {
    const term = search.value.toLowerCase()
    lista = lista.filter(t => t.name.toLowerCase().includes(term) || t.description?.toLowerCase().includes(term))
  }
  if (filterStated.value !== null) {
    lista = lista.filter(t => Number(t.stateTask) === Number(filterStated.value))
  }
  lista.sort((a, b) => {
    const dA = new Date(a.createdAt || 0).getTime()
    const dB = new Date(b.createdAt || 0).getTime()
    return orden.value === "desc" ? dB - dA : dA - dB
  })
  return lista
})

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  const f = new Date(date)
  return f.toLocaleDateString()
}

const subirArchivoCrear = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = e => crearArchivo.value = e.target.files[0]
  input.click()
}

const crearTarea = async () => {
  try {
    if (!areaId) return Notify.create({ type: 'negative', message: 'No tienes área asignada' });
    if (!name.value || !description.value || !workers.value.length) return Notify.create({ type: 'negative', message: 'Complete los campos obligatorios' });
    
    loading.value = true;
    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("description", description.value);
    formData.append("area_id", areaId);
    formData.append("tribute_id", userId);
    formData.append("isMonthly", isMonthly.value);
    formData.append("workers", JSON.stringify(workers.value));
    formData.append("leader", workers.value.length > 1 ? leader.value : workers.value[0]);

    if (isMonthly.value) {
      formData.append("monthlyDay", Number(monthlyDay.value));
      formData.append("monthlyPlazo", Number(monthlyPlazo.value));
    } else {
      formData.append("delivery_date", date.value);
    }
    if (crearArchivo.value) formData.append("file", crearArchivo.value);

    await postTasks(formData);
    Notify.create({ type: 'positive', message: 'Tarea creada con éxito' });
    showCreate.value = false;
    limpiarFormulario();
    await obtenerTareas();
  } catch (error) {
    Notify.create({ type: 'negative', message: error.response?.data?.error || "Error al crear tarea" });
  } finally {
    loading.value = false;
  }
};

const limpiarFormulario = () => {
  name.value = ''; description.value = ''; date.value = ''; workers.value = [];
  leader.value = null; crearArchivo.value = null; isMonthly.value = false;
  monthlyDay.value = null; monthlyPlazo.value = null;
};

const abrirEditar = (task) => {
  editId.value = task._id; editName.value = task.name; editDescription.value = task.description;
  editDate.value = task.delivery_date?.split('T')[0];
  editWorkers.value = task.workers?.map(w => w._id) || [];
  editState.value = task.stateTask;
  showEdit.value = true;
}

const verDetalles = (task) => { selectedTask.value = task; showDetails.value = true }

const actualizarTarea = async () => {
  try {
    loading.value = true;
    await putTasks(editId.value, {
      name: editName.value, description: editDescription.value,
      workers: editWorkers.value, delivery_date: editDate.value, stateTask: editState.value
    });
    Notify.create({ type: 'positive', message: 'Tarea actualizada' });
    showEdit.value = false;
    await obtenerTareas();
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
  } finally {
    loading.value = false;
  }
};

const obtenerTareas = async () => {
  try {
    loading.value = true;
    const endpoint = (rol === 1 || rol === 2) ? `/tasks/seeTasks` : `/tasks/byWorker/${userId}`
    const res = await api.get(endpoint)
    let lista = Array.isArray(res.data) ? res.data : []
    if (rol === 2) {
      lista = lista.filter(t => {
        const tAreaId = t.area_id?._id || t.area_id;
        return String(tAreaId) === String(areaId);
      });
    }
    tasks.value = lista.map((t, i) => ({ ...t, index: i + 1 }))
  } finally {
    loading.value = false;
  }
}

const obtenerTrabajadores = async () => {
  try {
    const res = await api.get(`/users/seeUsers`)
    workersList.value = res.data.filter(u => {
      const uArea = u.area_id || u.areaId;
      const uAreaId = uArea?._id || uArea;
      return Number(u.rol) === 3 && (rol === 1 || String(uAreaId) === String(areaId));
    });
  } catch (error) {}
}

onMounted(() => {
  obtenerTareas();
  obtenerTrabajadores();
})
</script>

<style scoped>
.dashed-border {
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.dashed-border:hover {
  border-color: var(--q-primary);
  background-color: #f0f4f0 !important;
}
</style>

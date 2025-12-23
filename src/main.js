import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { Quasar, Notify } from 'quasar' //  Importa Notify aquí
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import notifyPlugin from './plugins/notify.js' //  Tu plugin personalizado

// Iconos y estilos
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// Fuentes
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/700.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/carlito/400.css'

// 👇 Crea la app
const myApp = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

myApp.use(pinia)
myApp.use(router)

//  Configura Quasar y agrega el plugin oficial Notify
myApp.use(Quasar, {
  plugins: { Notify },
})

//  Tu plugin global (para poder usar this.$notify)
myApp.use(notifyPlugin)

myApp.mount('#app')

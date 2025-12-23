import { Notify } from 'quasar'

export default {
  install(app) {
    app.config.globalProperties.$notify = Notify.create 
  }
}

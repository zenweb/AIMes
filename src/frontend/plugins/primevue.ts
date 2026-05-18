import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
      },
    },
  })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.component('PrimeButton', Button)
  nuxtApp.vueApp.component('PrimeCard', Card)
  nuxtApp.vueApp.component('PrimeDialog', Dialog)
  nuxtApp.vueApp.component('PrimeInputText', InputText)
  nuxtApp.vueApp.component('PrimeSelect', Select)
  nuxtApp.vueApp.component('PrimeTag', Tag)
  nuxtApp.vueApp.component('PrimeToast', Toast)
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  experimental: {
    viewTransition: true
  },
  modules: ['nuxt-vuefire', '@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3327
  },
  vuefire: {
    config: {
      apiKey: 'AIzaSyAwqnYw_adNUkZZrDeSSaaZGIRJ1WtA8Zw',
      authDomain: 'cestinha-app-br.firebaseapp.com',
      projectId: 'cestinha-app-br',
      storageBucket: 'cestinha-app-br.firebasestorage.app',
      messagingSenderId: '993542374055',
      appId: '1:993542374055:web:e2d0e09677dbc5505f1182'
    },
    auth: {
      enabled: true
    },
  },
  runtimeConfig: {
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'cestinha-app-br.firebasestorage.app'
    }
  },
  imports: {
    dirs: [
      '@/composables/loaders',
    ]
  }
  
})

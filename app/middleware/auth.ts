import { getCurrentUser } from 'vuefire'
export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('Middleware de autenticação executado')
  const user = await getCurrentUser()
  if (!user) {
    return navigateTo('/entrar')
  }
})
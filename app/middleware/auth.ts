import { getCurrentUser } from 'vuefire'
export default defineNuxtRouteMiddleware(async (to) => {
    console.log('Middleware de autenticação executado')
  const user = await getCurrentUser()

  if (!user) {
    return navigateTo({name: 'entrar', query: { redirect: to.fullPath }})
  }
})
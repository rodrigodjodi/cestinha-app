import { getCurrentUser } from 'vuefire'
export default defineNuxtRouteMiddleware(async (to) => {
    // console.log('Middleware de autenticação executado')
  const user = await getCurrentUser()
  if (!user) {
    if (to.name === 'convites-convite') {
      return navigateTo({name: 'registrar', query: { redirect: to.fullPath }})
    } else {
      return navigateTo({name: 'entrar', query: { redirect: to.fullPath }})
    }
  }
})
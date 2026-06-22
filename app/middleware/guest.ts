import { getCurrentUser } from 'vuefire'
import { redirectSeguro } from '~/utils/redirectSeguro'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()

  if (user) {
    return navigateTo(redirectSeguro(to.query.redirect))
  }
})

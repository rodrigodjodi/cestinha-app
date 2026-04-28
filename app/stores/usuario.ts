import { defineStore } from 'pinia'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Usuario } from '../schemas/usuario'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useFirebaseAuth, useFirestore } from 'vuefire'
import { doc, setDoc } from 'firebase/firestore'
export const useUsuarioStore = defineStore('usuario', () => {
    // composables
    const auth = useFirebaseAuth()
    const db = useFirestore()
    const router = useRouter()
    const route = useRoute()
    const conviteToken = route.query.convite?.toString()
    const toast = useToast()
    // state
    const usuario = ref<Usuario | null>(null)
    const carregando = ref(false)
    const registerFormState = reactive<Partial<Usuario>>({
        nome: '',
        email: '',
        senha: '',
    })
    // actions
    async function registrar(event: FormSubmitEvent<Usuario>) {
        console.log('Registrar com dados:', event.data)
    try {
        carregando.value = true

        if (!auth) throw new Error('Firebase Auth não disponível')

        const cred = await createUserWithEmailAndPassword(auth, event.data.email, event.data.senha)
        await updateProfile(cred.user, { displayName: event.data.nome })

        await setDoc(doc(db, 'usuarios', cred.user.uid), {
        nome: event.data.nome,
        email: event.data.email,
        criadoEm: new Date(),
        })

        if (conviteToken) {
        router.push(`/claim?convite=${conviteToken}`)
        } else {
        router.push('/home')
        }
    } catch (e) {
        console.error('Erro ao registrar:', e.code)
        toast.add({ title: 'Erro ao registrar', description: e.code, color: 'error' })
    } finally {
        carregando.value = false
    }
    }
    return { usuario, carregando, registerFormState, registrar }
})
  
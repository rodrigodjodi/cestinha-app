/* usuário é um entidade da tabela de usuário no sistema.
É nela que vamos agrupar estatísticas de todos os jogadores desse usuário,
além de informações de perfil, foto, etc.
um usuário terá um jogador associado por grupo que participar.
um jogador só pode estar associado a um usuário */


import { defineStore } from "pinia";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Usuario } from "../schemas/usuario.schema";
import type { SignupData } from "../schemas/auth.schema";
import type { AuthError, UserCredential, User } from "firebase/auth";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { useFirebaseAuth, useFirestore, getCurrentUser } from "vuefire";
import { doc, setDoc } from "firebase/firestore";
export const useUsuarioStore = defineStore("usuario", () => {
  // composables
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();
  const route = useRoute();
  const conviteToken = route.query.convite?.toString();
  const toast = useToast();
  const user = ref<User | null>(null);
  // state
  const usuario = ref<Usuario | null>(null);
  
 


  // actions
  
  
  return {
    usuario,
  };
});

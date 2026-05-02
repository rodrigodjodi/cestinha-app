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
  const carregando = ref(false);
  const registerFormState = reactive<Partial<SignupData>>({
    nome: "",
    email: "",
    senha: "",
  });
  const loginFormState = reactive<Partial<SignupData>>({
    email: "",
    senha: "",
  });
  // watchers
  watch(user, (currentUser) => {
    console.log("[store/usuario] Usuário autenticado:", currentUser);
    if (currentUser) {
      // buscar usuario na tabela e preencher
      navigateTo("/painel");
    } else {
      console.log("vai dar null quando usuario sair?")
      usuario.value = null;
      navigateTo('/entrar');
    }
  });


  // actions
  // REGISTRAR
  async function registrar(event: FormSubmitEvent<SignupData>) {
    console.log("Registrar com dados:", event.data);
    try {
      carregando.value = true;

      if (!auth) throw new Error("Firebase Auth não disponível");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        event.data.email,
        event.data.senha,
      );
      await updateProfile(userCredential.user, { displayName: event.data.nome });
      
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        nome: event.data.nome,
        email: event.data.email,
        criadoEm: new Date(),
      });
      user.value = userCredential.user;
      /* if (conviteToken) {
        router.push(`/claim?convite=${conviteToken}`);
      } else {
        router.push("/painel");
      } */
    } catch (e) {
      console.error("Erro ao registrar:", (e as AuthError).code);
      toast.add({
        title: "Erro ao registrar",
        description: (e as AuthError).code,
        color: "error",
      });
    } finally {
      carregando.value = false;
    }
  }
  // ENTRAR
  async function entrar(event: FormSubmitEvent<SignupData>) {
    console.log("Formulário enviado com dados:", event.data);
    if (!auth) {
      toast.add({
        title: "Erro",
        description:
          "Firebase Auth não disponível. Tente novamente mais tarde.",
        color: "error",
      });
      throw new Error("Firebase Auth não disponível");
    }
    try {
      carregando.value = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        event.data.email,
        event.data.senha,
      );
      user.value = userCredential.user;
      
    } catch (e) {
      console.error(e);
      console.log((e as AuthError).code);
      switch ((e as AuthError).code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          toast.add({
            title: "Erro",
            description: "E-amil ou senha inválidos.",
            color: "error",
          });
          break;
        default:
          console.error("Erro ao entrar:", (e as AuthError).code);
          toast.add({
            title: "Erro",
            description:
              "Ocorreu um erro ao tentar entrar. Tente novamente mais tarde.",
            color: "error",
          });
      }
    } finally {
      carregando.value = false;
    }
  }
  return {
    usuario,
    carregando,
    registerFormState,
    registrar,
    loginFormState,
    entrar
  };
});

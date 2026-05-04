import type { FormSubmitEvent } from "@nuxt/ui";
import type { SignupData } from "../schemas/auth.schema";
import type { AuthError, UserCredential, User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useFirebaseAuth, useFirestore, getCurrentUser } from "vuefire";
import { doc, setDoc } from "firebase/firestore";
// Esse arquivo trata exclusivamente das interações com o usuário do Firebase, como registrar, entrar, atualizar perfil, etc.
//  Ele é usado tanto na store de usuário quanto em outros lugares onde precisamos interagir com o usuário do Firebase.
export default function () {
  // composables
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const route = useRoute();
  const conviteToken = route.query.convite?.toString();
  const toast = useToast();
  // state
  const serverErrors = ref<Record<string, string>>({});
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
  const recoverPasswordFormState = reactive<Partial<SignupData>>({
    email: "",
  });

  // actions
  // REGISTRAR
  async function registrar(event: FormSubmitEvent<SignupData>) {
    serverErrors.value = {};
    console.log("Registrar com dados:", event.data);
    try {
      carregando.value = true;

      if (!auth) throw new Error("Firebase Auth não disponível");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        event.data.email,
        event.data.senha,
      );
      await updateProfile(userCredential.user, {
        displayName: event.data.nome,
      });
      // passar esse código para store ou composable específico de usuário
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        nome: event.data.nome,
        email: event.data.email,
        criadoEm: new Date(),
      });

      /* if (conviteToken) {
        router.push(`/claim?convite=${conviteToken}`);
      } else {
        router.push("/painel");
      } */
    } catch (e) {
      console.error("Erro ao registrar:", (e as AuthError).code);
      switch ((e as AuthError).code) {
        case "auth/email-already-in-use":
          serverErrors.value.email = "Email já está em uso.";
          break
        case "auth/weak-password":
            serverErrors.value.senha = "Senha considerada fraca.";
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
  // ENTRAR
  async function entrar(event: FormSubmitEvent<SignupData>) {
    serverErrors.value = {};
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
    } catch (e) {
      console.error(e);
      console.log((e as AuthError).code);
      switch ((e as AuthError).code) {
        case "auth/user-not-found":
          serverErrors.value.email = "Nenhum usuário encontrado com esse email.";
          break
        case "auth/wrong-password":
            serverErrors.value.senha = "Senha incorreta.";
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
  //erros de validação do formulário
  function handleFormError(errors: any) {
    console.error("Erros de validação:", errors);
  }
  // redefinição de senha
  async function redefinirSenha(event: FormSubmitEvent<SignupData>) {
    serverErrors.value = {};
    try {
      carregando.value = true;
      if (!auth) throw new Error("Firebase Auth não disponível");

      await sendPasswordResetEmail(auth, event.data.email);
      toast.add({
        title: "Email enviado",
        description:
          "Um email com instruções para redefinir sua senha foi enviado.",
        color: "success",
      });
    } catch (e) {
      // console.error("Erro na tentativa de redefinição de senha:", e);
      if ((e as AuthError).code === "auth/user-not-found") {
       serverErrors.value.email = "Nenhum usuário encontrado com esse email.";
      } else {
        toast.add({
          title: "Erro",
          description:
            "Ocorreu um erro ao tentar enviar o email de redefinição de senha.",
          color: "error",
        });
      }
    } finally {
      carregando.value = false;
    }
  }
  return {
    carregando,
    serverErrors,
    registerFormState,
    loginFormState,
    recoverPasswordFormState,
    registrar,
    entrar,
    handleFormError,
    redefinirSenha,
  };
}

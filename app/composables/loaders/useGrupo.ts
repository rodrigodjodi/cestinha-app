import { doc } from "firebase/firestore";
import { grupoConverter } from "~/firebase/grupoConverter";
export function useGrupo(grupoId: string) {
  const db = useFirestore();
  const route = useRoute();
  const docRefGrupo = doc(db, "grupos", grupoId).withConverter(grupoConverter);
  const { data, pending, error } = useDocument(docRefGrupo);
  console.log(data);
  const grupo = computed(() => {
    return data.value?.valid ? data.value.grupo : null;
  });
  const errosParseGrupo = computed(() => {
    if (!data.value?.valid) {
      return { doc: data.value?.raw, erroValidacao: data.value?.error };
    }
  });
  const notFound = computed(
    () => !pending.value && !error.value && grupo.value === null,
  );
  return { grupo, pending, error, errosParseGrupo, notFound };
}

import { doc } from "firebase/firestore";
import { grupoConverter } from "~/firebase/grupoConverter";
export function useGrupo(grupoId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore();
   const docRefGrupo = computed(() => {
    const id = toValue(grupoId);
    if (!id) { return null }
    return doc(db, "grupos", id).withConverter(grupoConverter);
  });
  const { data, pending, error } = useDocument(docRefGrupo);
  
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

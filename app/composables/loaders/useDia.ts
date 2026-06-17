import { doc } from "firebase/firestore";
import { diaConverter } from "@/firebase/diaConverter";
export function useDia(diaId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore();
  const docRefDia = computed(() => {
      const id = toValue(diaId);
      if (!id) { return null }
      return doc(db, "dias", id).withConverter(diaConverter);
    });
  const { data, pending, error } = useDocument(docRefDia);
  // console.log(data)
  const dia = computed(() => {
    return data.value?.valid ? data.value.dia : null;
  });
  // console.log(dia)
  const errosParseDia = computed(() => {
    if (!data.value?.valid) {
      return { doc: data.value?.raw, erroValidacao: data.value?.error };
    }
  });
  // console.log({errosParseDia})
  const notFound = computed(
    () => !pending.value && !error.value && dia.value === null,
  );
  return { dia, pending, error, errosParseDia, notFound };
}

import { doc } from "firebase/firestore";
import { jogoConverter } from "@/firebase/jogoConverter";
export function useJogo(jogoId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore();
  const docRefJogo = computed(() => {
      const id = toValue(jogoId);
      if (!id) { return null }
      return doc(db, "jogos", id).withConverter(jogoConverter);
    });
  const { data, pending, error } = useDocument(docRefJogo);
  
  const jogo = computed(() => {
    return data.value?.valid ? data.value.jogo : null;
  });
  const errosParseJogo = computed(() => {
    if (!data.value?.valid) {
      return { doc: data.value?.raw, erroValidacao: data.value?.error };
    }
  });
  const jogoNaoEncontrado = computed(
    () => !pending.value && !error.value && jogo.value === null,
  );
  return { jogo, pending, error, errosParseJogo, jogoNaoEncontrado };
}

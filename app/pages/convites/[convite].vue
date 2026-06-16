<script setup lang="ts">
import {associarJogadorAUsuario} from "@/firebase/jogador.service"
import type { Jogador } from '~/schemas/jogador.schema';
// middleware
definePageMeta({ middleware: ['auth'] })
const route = useRoute()
const conviteId = route.params.convite as string

const { grupo, pending, error, notFound } = useValidacaoConvite(conviteId)
// se o usuário já tem jogador, encaminha direto para o grupo
const {jogadorLogado} = useJogadorLogado(() => grupo.value?.id)
watchEffect(() => {
  if(jogadorLogado.value) {
    navigateTo(`/grupos/${grupo.value?.id}`)
  }
})
const { jogadores } =  useListaJogadores(() => grupo.value?.id)
const user = useCurrentUser()
const jogadoresOrdenados = computed(() => {
  if(!jogadores.value) return []
  // primeiro admins, depois membros, depois avulsos, alfabético dentro desses grupos
  return [...jogadores.value].sort((a, b) => {
    const ordemA = a.atribuicao === 'admin' ? 0 : a.atribuicao === 'membro' ? 1 : 2;
    const ordemB = b.atribuicao === 'admin' ? 0 : b.atribuicao === 'membro' ? 1 : 2;
    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }
    return a.nome.localeCompare(b.nome)
  }).filter(el=>el.usuarioId === null);
})
const jogadorSelecionado = ref<Jogador | null>(null)
function selecionarJogador(ev) {
  console.log('jogador selecionado', ev)
  jogadorSelecionado.value = ev;
}
function associarJogador() {
  //console.log('atribuir jogador', jogadorSelecionado.value?.nome , 'para usuario', user.value?.email, 'no grupo', grupo.value?.nome)
  associarJogadorAUsuario(jogadorSelecionado.value, user.value.uid).then(()=>{
    console.log('jogador associado, redirecionando...')
  }).catch(err=> {
    console.error.err
  })
}
</script>

<template>
  <div v-if="pending">
    <div class="grid gap-4 md:grid-cols-2">
      <USkeleton class="h-24 mb-3" v-for="i in 2" :key="i" />
    </div>
  </div>

  <div v-else-if="error">
    <UCard>
      <p class="text-gray-500">
        Ocorreu um erro ao validar o convite. Tente novamente mais tarde.
      </p>
        <pre>{{ error }}</pre>
    </UCard>
  </div>
  <div v-else-if="notFound">
    <UCard>
      <p class="text-gray-500">
        Convite inválido ou expirado.
      </p>
    </UCard>
  </div>
  <div v-else>
    <UCard :title="`Bem vindo ao grupo ${grupo?.nome}!`" description="Quem é você?"
      :header="grupo?.nome">

      <p class="mb-4 text-dimmed">Selecione um jogador para assumir como identidade no grupo {{ grupo?.nome }}. Se você ainda não tem um
        jogador, peça para o admin do grupo criar um para você.</p>
        <div class="flex flex-wrap gap-2">
      <ItemJogadorSelecao v-for="jogador in jogadoresOrdenados" :key="jogador.id" :jogador="jogador"
        @toggle="selecionarJogador(jogador)" :data-jogador-id="jogador.id"
        :subtitulo="jogador.atribuicao"
      />
      
    </div>
    <template #footer>
      <UButton :disabled="!jogadorSelecionado" @click="associarJogador">
        Selecionar jogador
      </UButton>
    </template>
    </UCard>
  </div>
  <!-- <p>se não tem usuario, encaminha para a tela de login / signup com redirect</p>
    <p>se tem usuário, verifica existe grupo com esse convite</p>
    <p>se convite NAO for válido, encerra com aviso ao usuário</p>
    <p>se convite válido, verifica se tem jogador no grupo</p>
    <p>se já tiver jogador, redireciona para o grupo</p>
    <p>se não tiver jogador, mostra a lista de jogadores do grupo pro usuário reclamar</p>
    <p>ao reclamar um jogador,o usuário é adicionado ao grupo, o doc do jogador é atualizado e é direcionado para o
        grupo</p> -->
</template>
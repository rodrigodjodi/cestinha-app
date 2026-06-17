<script setup lang="ts">
definePageMeta({
  layout: 'splash'
})
console.log('API KEY:', process.env.NUXT_PUBLIC_FIREBASE_API_KEY)

  const config = useRuntimeConfig()

  console.log('runtimeConfig', config)
</script>

<template>
  <UContainer class="py-16">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
        <img src="/markus-spiske-BfphcCvhl6E-unsplash.jpg" alt="Hero" class="rounded-xl shadow-lg" />
        <p class="text-xs text-gray-400 mt-2">
          Foto de <a href="https://unsplash.com/pt-br/@markusspiske?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" class="underline" target="_blank">Markus Spiske</a> na <a href="https://unsplash.com/pt-br/fotografias/bola-sob-o-anel-de-basquete-BfphcCvhl6E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" class="underline" target="_blank">Unsplash</a>
        </p>
      </div>
      <div>
        <h1 class="text-4xl font-bold mb-4">Cestinha</h1>
        <p class="text-lg text-gray-200 mb-6">
          Marque estatísticas dos seus jogos de basquete direto do vídeo.
        </p>
        <ul class="list-disc list-inside space-y-2 mb-8">
          <li>Crie grupos para seus jogos</li>
          <li>Convide jogadores por link</li>
          <li>Marque jogadas assistindo ao vídeo</li>
          <li>Gere clipes automáticos para cada jogada</li>
          <li>Veja o desempenho de cada jogador</li>
        </ul>
        <div class="space-x-4">
          <UButton to="/entrar" color="primary" size="lg">Entrar</UButton>
          <UButton to="/registrar" variant="outline" size="lg">Criar conta</UButton>
        </div>
      </div>
      
    </div>
  </UContainer>
</template>

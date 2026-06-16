<script setup lang="ts">

</script>
<template>
  <div class="grid grid-cols-[280px_minmax(0,1fr)_280px] gap-4">
    <!-- Time A -->
    <aside class="overflow-y-auto">
      ListaTimeA
    </aside>

    <!-- Vídeo -->
    <main class="flex justify-center">
      <div class="w-full max-w-5xl">
        <div class="aspect-video">
          <iframe class="h-full w-full rounded-lg"
          :src="`https://www.youtube.com/embed/${jogo.videoId}`"
            allowfullscreen />
        </div>
      </div>
    </main>

    <!-- Time B -->
    <aside class="overflow-y-auto">
      ListaTimeB
    </aside>
  </div>
</template>


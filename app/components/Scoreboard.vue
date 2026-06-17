<script setup lang="ts">
import { useScreenOrientation } from '@vueuse/core'
const jogoStore = useJogoStore()
const orientation = useScreenOrientation()
const isLandscape = computed(() => {
  return orientation.orientation.value?.includes('landscape')
})
</script>

<template>
  <div
    class="timer-layout"
    :class="isLandscape ? 'timer-layout-landscape' : 'timer-layout-portrait'"
  >
    <!-- SCORE -->
    <section class="score-zone">
      PLACAR
    </section>

    <!-- ACTIONS LEFT -->
    <section
      v-if="isLandscape"
      class="actions-a-zone"
    >
      actions A
    </section>

    <!-- ACTIONS RIGHT -->
    <section
      v-if="isLandscape"
      class="actions-b-zone"
    >
      actions B
    </section>

    <!-- ACTIONS PORTRAIT -->
    <section
      v-if="!isLandscape"
      class="actions-zone"
    >
      actions
    </section>

    <!-- CLOCK -->
    <section class="clock-zone">
      <Timer />
    </section>
  </div>
</template>

<style scoped>
.timer-layout {
  height: 100%;
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
  background: black;
  color: white;
}

/* =========================
   LANDSCAPE
========================= */

.timer-layout-landscape {
  grid-template-columns:
    96px
    1fr
    96px;
  grid-template-rows:
    auto
    auto
    1fr;
  grid-template-areas:
    "header header header"
    "actionsA score actionsB"
    "actionsA clock actionsB";
}

/* =========================
   PORTRAIT
========================= */

.timer-layout-portrait {
  grid-template-columns: 1fr;
  grid-template-rows:
    auto
    1fr
    1fr
    auto;
  grid-template-areas:
    "header"
    "clock"
    "score"
    "actions";
}

/* =========================
   ZONES
========================= */

.score-zone {
  grid-area: score;
  border: 1px solid #ef4444;
  padding: 1rem;
}
.actions-a-zone {
  grid-area: actionsA;
  border: 1px solid #22c55e;
  border-radius: 24px;
  padding: 1rem;
}

.actions-b-zone {
  grid-area: actionsB;
  border: 1px solid #22c55e;
  border-radius: 24px;
  padding: 1rem;
}

.actions-zone {
  grid-area: actions;
  border: 1px solid #22c55e;
  border-radius: 24px;
  padding: 1rem;
}

.clock-zone {
  grid-area: clock;
  border: 1px solid #3b82f6;
  padding: 0.5rem;
}

/* =========================
   SHARED
========================= */

.score-zone,
.actions-a-zone,
.actions-b-zone,
.actions-zone,
.clock-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
</style>
<script setup lang="ts">
// usa o layout login
definePageMeta({
  layout: 'login'
})

</script>
<template>
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
        <form>
            <div class="mb-4">
                <label for="email" class="block text-gray-700">Email</label>
                <input type="email" id="email" class="border border-gray-300 p-2 w-full rounded" required />
            </div>
            <div class="mb-4">
                <label for="password" class="block text-gray-700">Password</label>
                <input type="password" id="password" class="border border-gray-300 p-2 w-full rounded" required />
            </div>
            <button type="submit" class="bg-blue-500 text-white p-2 rounded w-full">Login</button>
        </form>
    </div>
</template>
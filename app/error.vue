<script setup lang="ts">
import type { NuxtError } from '#app';

const { error } = defineProps<{
    error: NuxtError;
}>();
</script>

<template>
    <div class="page-wrapper container">
        <div class="error">
            <h1>{{ error.statusCode }}</h1>
            <p>{{ error.message }}</p>
            <NuxtLink to="/" role="button" :external="true">
                <span>Go back to home</span>
            </NuxtLink>
        </div>
    </div>
</template>

<style scoped>
.page-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.error {
    text-align: center;
}

h1 {
    font-size: 8rem;
}

p {
    font-size: 1.5rem;
}
</style>

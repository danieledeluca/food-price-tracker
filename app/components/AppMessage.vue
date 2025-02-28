<script setup lang="ts">
const { text, type } = defineProps<{
    text: string;
    type: 'warning';
}>();
</script>

<template>
    <div class="message" :class="type">
        {{ text }}
    </div>
</template>

<style scoped>
.message {
    padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
    background-color: var(--background-color);
    color: var(--color);
    border-radius: var(--pico-border-radius);
    font-weight: 500;
}

.message.warning {
    --background-color: var(--pico-color-amber-200);
    --color: var(--pico-color-dark);
}
</style>

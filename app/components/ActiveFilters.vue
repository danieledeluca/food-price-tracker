<script setup lang="ts">
const foodStore = useFoodStore();
</script>

<template>
    <div v-if="foodStore.filters.length" class="active-filters">
        <button
            v-for="(food, index) in foodStore.filters"
            :key="food"
            type="button"
            class="secondary"
            @click="foodStore.removeFilter(index)"
        >
            <span>{{ parseFoodName(foodStore.foods, food) }}</span>
        </button>
        <button
            v-if="foodStore.filters.length > 1"
            type="button"
            class="remove-all"
            @click="foodStore.removeAllFilters"
        >
            <span>Remove all filters</span>
        </button>
    </div>
</template>

<style scoped>
.active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
}

.active-filters button {
    --pico-form-element-spacing-vertical: 0.25rem;
    --pico-form-element-spacing-horizontal: 0.5rem;

    margin-bottom: 0;
    font-size: 0.875em;
}

.active-filters .secondary {
    padding-right: calc(var(--pico-form-element-spacing-horizontal) * 3);
    background-image: var(--pico-icon-close);
    background-position: right calc(var(--pico-form-element-spacing-horizontal) / 2) center;
    background-size: auto 1rem;
    background-repeat: no-repeat;
}

.active-filters .remove-all {
    background-color: var(--pico-form-element-invalid-border-color);
    border-color: var(--pico-form-element-invalid-border-color);
}
</style>

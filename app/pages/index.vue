<script setup lang="ts">
const foodStore = useFoodStore();
await foodStore.fetchData();
</script>

<template>
    <FoodsFilter />
    <ActiveFilters />
    <FoodsList />
</template>

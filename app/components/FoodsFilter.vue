<script setup lang="ts">
const foodStore = useFoodStore();

const [...foods] =
    foodStore.foods.reduce((acc, food) => {
        return acc.add(food['Nome']);
    }, new Set<string>([])) || new Set<string>([]);

const foodsFilter = ref('');
const foodsFiltered = computed(() =>
    foods.filter((food) => food.toLowerCase().includes(foodsFilter.value.toLowerCase())),
);

const dropdown = ref<HTMLDetailsElement>();

onMounted(() => {
    window.addEventListener('keydown', (event) => {
        if (dropdown.value && event.code === 'Escape') {
            dropdown.value.open = false;
        }
    });
});
</script>

<template>
    <details v-if="foods.length" ref="dropdown" class="dropdown">
        <summary>Select foods...</summary>
        <ul>
            <li class="search">
                <input v-model="foodsFilter" type="text" placeholder="Search for a food" />
            </li>
            <li v-for="food in foodsFiltered" :key="food" class="food">
                <label>
                    <input
                        v-model="foodStore.filters"
                        type="checkbox"
                        :value="parseUrlParam(food)"
                    />
                    {{ food }}
                </label>
            </li>
            <li v-if="!foodsFiltered.length">
                <AppMessage
                    text="We couldn't find any foods matching your search criteria"
                    type="warning"
                />
            </li>
        </ul>
    </details>
</template>

<style scoped>
details {
    margin-bottom: 2rem;
}

details ul {
    max-height: 50dvh;
    overflow-y: auto;
}

details .search {
    position: sticky;
    top: 0;
    margin-top: 0 !important;
    padding-block: 1rem;
    background-color: var(--pico-dropdown-background-color);
}

details .search input {
    margin-bottom: 0;
}

details .food {
    margin-bottom: calc(var(--pico-spacing) * 0.375);
    padding: 0 !important;
}

details label {
    margin-bottom: 0;
    padding: calc(var(--pico-form-element-spacing-vertical) * 0.5)
        var(--pico-form-element-spacing-horizontal);
}
</style>

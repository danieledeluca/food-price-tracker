<script setup lang="ts">
const foodStore = useFoodStore();
const foodData = computed(() => foodStore.foodData);

if (!foodData.value) {
    await foodStore.getFoodData();
}

const route = useRoute();
const foodName = foodStore.getFoodNameFromUrlParam(route.params.food as string);
const priceHistory = foodData.value?.priceHistory.filter((entry) => entry[PriceHistoryFields.Food].includes(foodName));

useHead({
    titleTemplate: `%s | ${foodName}`,
});
</script>

<template>
    <h1>{{ foodName }}</h1>
    <template v-if="priceHistory?.length">
        <div class="charts">
            <article
                v-for="[supermarket, supermarketData] in Object.entries(
                    foodStore.getPriceHistoryBy(priceHistory, PriceHistoryFields.Supermarket)
                )"
                :key="supermarket"
                class="chart"
            >
                <h3 class="title">{{ supermarket }}</h3>
                <p>
                    Average price: <strong>{{ foodStore.getAveragePrice(supermarketData) }}</strong>
                </p>
                <LineChart :data="supermarketData" />
                <TableData :data="supermarketData" />
            </article>
        </div>
    </template>
</template>

<style scoped>
.chart {
    margin-bottom: 0;
}

.chart:not(:last-child) {
    margin-bottom: 2rem;
}
</style>

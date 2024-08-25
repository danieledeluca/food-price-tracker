<script setup lang="ts">
const foodStore = useFoodStore();
const foodData = computed(() => foodStore.foodData);

if (!foodData.value) {
    await foodStore.getFoodData();
}

const route = useRoute();
const foodName = route.params.food as string;
const priceHistory = foodData.value?.priceHistory.filter((entry) => entry[PriceHistoryFields.Food].includes(foodName));

function averagePrice(data: PriceHistory[]) {
    const prices = data.map((entry) => parseFloat(entry[PriceHistoryFields.PricePerKg].replace(',', '.')));

    return formatPrice(prices.reduce((acc, price) => acc + price, 0) / prices.length);
}

useHead({
    titleTemplate: `%s | ${foodName}`,
});
</script>

<template>
    <h1>{{ foodName }}</h1>
    <article
        v-for="[quantity, quantityData] in foodStore.getPriceHistoryByQuantity(priceHistory as PriceHistory[])"
        :key="quantity"
        class="chart"
    >
        <h3 v-if="foodStore.getPriceHistoryByQuantity(priceHistory as PriceHistory[]).length > 1">
            {{ PriceHistoryFields.Packaging }}: {{ quantity }}
        </h3>
        <p>
            Average price: <strong>{{ averagePrice(quantityData) }}</strong>
        </p>
        <LineChart :data="quantityData" />
        <TableData :data="quantityData" />
    </article>
</template>

<style scoped>
.chart {
    margin-bottom: 0;
}

.chart:not(:last-child) {
    margin-bottom: 2rem;
}
</style>

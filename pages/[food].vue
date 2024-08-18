<script setup lang="ts">
const { data } = await useFetch('/api/foods');

const route = useRoute();
const food = route.params.food as string;
const foodTitle = Object.values(data.value?.priceHistory[food] || {}).flat()[0][PriceHistoryFields.Food];
const foodData = Object.entries(data.value?.priceHistory[food] || {});

function averagePrice(data: PriceHistory[]) {
    const prices = data.map((entry) => parseFloat(entry[PriceHistoryFields.PricePerKg].replace(',', '.')));

    return formatPrice(prices.reduce((acc, price) => acc + price, 0) / prices.length);
}

useHead({
    titleTemplate: `%s | ${foodTitle}`,
});
</script>

<template>
    <h1>{{ foodTitle }}</h1>
    <template v-for="[quantity, data] in foodData">
        <article class="chart">
            <h3 v-if="foodData.length > 1">{{ PriceHistoryFields.Packaging }}: {{ quantity }}</h3>
            <p>
                Average price: <strong>{{ averagePrice(data) }}</strong>
            </p>
            <LineChart :data="data" />
            <TableData :data="data" />
        </article>
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

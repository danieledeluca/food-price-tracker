<script setup lang="ts">
const route = useRoute();
const food = route.params.food as string;

const foodStore = useFoodStore();
await foodStore.fetchData();

const foodName = parseFoodName(foodStore.foods, food) || '';
const currentPriceHistory = groupBy(foodStore.priceHistory, PriceHistoryFields.Food)?.[foodName];

if (!foodName) {
    throw createError({
        statusCode: 404,
        message: 'Food not found',
    });
}

useHead({
    titleTemplate: `%s | ${foodName}`,
});
</script>

<template>
    <h1>{{ foodName }}</h1>
    <template v-if="currentPriceHistory?.length">
        <article
            v-for="(supermarketPriceHistory, supermarket) in groupBy(
                currentPriceHistory,
                PriceHistoryFields.Supermarket,
            )"
            :key="supermarket"
        >
            <h3>{{ supermarket }}</h3>
            <p>
                Average price: <strong>{{ getAveragePrice(supermarketPriceHistory) }}</strong>
            </p>
            <LineChart :priceHistory="supermarketPriceHistory" />
            <TableData :priceHistory="supermarketPriceHistory" />
        </article>
    </template>
    <AppMessage v-else text="We couldn't find any data matching this food" type="warning" />
</template>

<style scoped>
h1 {
    margin-bottom: 2rem;
}

article {
    margin-bottom: 0;
}

article:not(:last-child) {
    margin-bottom: 2rem;
}
</style>

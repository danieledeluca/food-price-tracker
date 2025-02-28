<script setup lang="ts">
const { priceHistory, filters } = storeToRefs(useFoodStore());

const priceHistoryByFood = groupBy<PriceHistory>(priceHistory.value, PriceHistoryFields.Food);
const priceHistoryByFoodFiltered = computed(() => {
    if (!filters.value.length) {
        return priceHistoryByFood;
    }

    const entries = Object.entries(priceHistoryByFood || {}).filter(([food]) =>
        filters.value.includes(parseUrlParam(food)),
    );

    return Object.fromEntries(entries);
});
</script>

<template>
    <div v-if="Object.entries(priceHistoryByFoodFiltered || {}).length" class="foods">
        <NuxtLink
            v-for="(foodPriceHistory, food) in priceHistoryByFoodFiltered"
            :key="food"
            :to="{ name: 'food', params: { food: parseUrlParam(food) } }"
            class="food"
        >
            <h4>{{ food }}</h4>
            <div class="average-prices">
                <small>Average prices:</small>
                <div
                    v-for="(supermarketPriceHistory, supermarket) in groupBy(
                        foodPriceHistory,
                        PriceHistoryFields.Supermarket,
                    )"
                    :key="supermarket"
                    class="average-price"
                >
                    <span>{{ supermarket }}: </span>
                    <strong>{{ getAveragePrice(supermarketPriceHistory) }}</strong>
                </div>
            </div>
        </NuxtLink>
    </div>
    <AppMessage
        v-else
        text="We couldn't find any data matching your search criteria"
        type="warning"
    />
</template>

<style scoped>
.foods {
    display: grid;
    gap: 2rem;
}

.food {
    padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
    background-color: var(--pico-card-background-color);
    color: inherit;
    border: 1px solid var(--pico-card-border-color);
    border-radius: var(--pico-border-radius);
    text-decoration: none;
}

.food:not(:focus-visible) {
    box-shadow: var(--pico-card-box-shadow);
}

.food:hover {
    background-color: var(--pico-card-sectioning-background-color);
}

@media screen and (min-width: 768px) {
    .foods {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>

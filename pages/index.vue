<script setup lang="ts">
import type { PriceHistory } from '~/utils/models';

const { data } = await useFetch('/api/foods');

const food = ref('');

const priceHistoryFiltered = computed(() => {
    return Object.keys(data.value?.priceHistory as {}).filter((entry) => {
        return entry.indexOf(food.value) !== -1;
    });
});

function getTitle(key: string, quantity: string, foodName: string) {
    return foodName + (Object.keys(data.value?.priceHistory[key] as {}).length > 1 ? ' - ' + quantity : '');
}

onMounted(() => {
    food.value = new URLSearchParams(window?.location.search).get('q') || '';
});

watch(food, (newFood) => {
    const newUrl = new URL(window?.location.href);

    if (newFood) {
        newUrl.searchParams.set('q', newFood);
    } else {
        newUrl.searchParams.delete('q');
    }

    window.history.replaceState({}, '', newUrl);
});
</script>

<template>
    <form @submit.prevent>
        <fieldset>
            <label for="food">
                Food
                <select id="food" v-model="food">
                    <option value="">Select a food...</option>
                    <option
                        v-for="food in data?.foods"
                        :value="food[FoodsFields.Name].slice(3).toLowerCase().replace(/ /g, '-')"
                        :key="food[FoodsFields.Name]"
                    >
                        {{ food[FoodsFields.Name] }}
                    </option>
                </select>
            </label>
        </fieldset>
    </form>
    <div class="charts" v-if="data?.priceHistory && priceHistoryFiltered.length">
        <template v-for="[key, data] in Object.entries(data?.priceHistory)" :key="key">
            <NuxtLink
                :to="{ name: 'food', params: { food: key } }"
                v-for="[quantity, quantityData] in Object.entries(data)"
                v-show="priceHistoryFiltered.includes(key)"
                class="chart"
            >
                <h4 class="title">{{ getTitle(key, quantity, quantityData[0][PriceHistoryFields.Food]) }}</h4>
                <LineChart :data="quantityData" />
            </NuxtLink>
        </template>
    </div>
    <div v-else class="message message-error">
        No data found for: <strong>{{ food }}</strong>
    </div>
</template>

<style scoped>
.chart {
    display: block;
    padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
    background-color: var(--pico-card-background-color);
    border: 1px solid var(--pico-card-border-color);
    border-radius: var(--pico-border-radius);
    box-shadow: var(--pico-card-box-shadow);
    text-decoration: none;
}

.chart:hover {
    background-color: var(--pico-card-sectioning-background-color);
}

.title {
    text-align: center;
}

.message {
    padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
    border-radius: var(--pico-border-radius);
}

.message-error {
    --pico-color: var(--pico-contrast-inverse);

    background-color: var(--pico-del-color);
    color: var(--pico-color);
}

@media screen and (min-width: 768px) {
    .charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 2rem;
    }

    .charts > * {
        min-width: 0;
    }
}

@media screen and (max-width: 767.98px) {
    .chart:not(:last-child) {
        margin-bottom: 2rem;
    }
}
</style>

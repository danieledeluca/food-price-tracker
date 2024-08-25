<script setup lang="ts">
const foodStore = useFoodStore();
const foodData = computed(() => foodStore.foodData);

if (!foodData.value) {
    await foodStore.getFoodData();
}

const SEARCH_PARAM_NAME = 'q';
const SEARCH_PARAMS_SEPARATOR = '&';

const dropdown = ref<HTMLDetailsElement>();
const foodFilter = ref<string[]>([]);
const foodListFilter = ref('');
const priceHistoryByFood =
    foodData.value?.priceHistory && foodStore.getPriceHistoryBy(foodData.value.priceHistory, PriceHistoryFields.Food);

onMounted(() => {
    // Preselect food from search params
    const searchParams = new URLSearchParams(window?.location.search)
        .get(SEARCH_PARAM_NAME)
        ?.split(SEARCH_PARAMS_SEPARATOR);

    if (searchParams?.length) {
        foodFilter.value = searchParams;
    }

    // Close dropdown on Escape
    window.addEventListener('keyup', (event) => {
        if (dropdown.value && event.code === 'Escape') {
            dropdown.value.open = false;
        }
    });
});

watch(
    foodFilter,
    (newFoodFilter) => {
        const newUrl = new URL(window?.location.href);

        if (newFoodFilter.length) {
            newUrl.searchParams.set(SEARCH_PARAM_NAME, newFoodFilter.join(SEARCH_PARAMS_SEPARATOR));
        } else {
            newUrl.searchParams.delete(SEARCH_PARAM_NAME);
        }

        window.history.replaceState({}, '', newUrl);
    },
    {
        deep: true,
    }
);
</script>

<template>
    <details class="dropdown" ref="dropdown">
        <summary>Select foods...</summary>
        <ul>
            <li class="search">
                <input type="text" v-model="foodListFilter" placeholder="Search a food" />
            </li>
            <li
                v-for="food in foodData?.foodList"
                :key="food[FoodsFields.Name]"
                v-show="food[FoodsFields.Name].toLowerCase().indexOf(foodListFilter.toLowerCase()) !== -1"
            >
                <label>
                    <input
                        type="checkbox"
                        v-model="foodFilter"
                        :value="removeNonAsciiCharacters(food[FoodsFields.Name])"
                    />
                    {{ food[FoodsFields.Name] }}
                </label>
            </li>
        </ul>
    </details>
    <div class="active-filters" v-if="foodFilter.length">
        <button
            type="button"
            v-for="(food, index) in foodFilter"
            :key="food"
            @click="foodFilter.splice(index, 1)"
            class="secondary"
        >
            <span>{{ food }}</span>
        </button>
        <button v-if="foodFilter.length > 1" type="button" @click="foodFilter = []" class="remove-all">
            <span>Remove all filters</span>
        </button>
    </div>
    <div class="charts" v-if="priceHistoryByFood && Object.entries(priceHistoryByFood).length">
        <template v-for="[foodName, priceData] in Object.entries(priceHistoryByFood)" :key="foodName">
            <NuxtLink
                class="chart"
                :to="{ name: 'food', params: { food: foodName } }"
                v-for="[quantity, quantityData] in foodStore.getPriceHistoryByQuantity(priceData)"
                v-show="foodFilter.includes(foodName) || !foodFilter.length"
                :key="quantity"
            >
                <h4 class="title">
                    {{ foodName }}
                    {{ foodStore.getPriceHistoryByQuantity(priceData).length > 1 ? ` - ${quantity}` : '' }}
                </h4>
                <LineChart :data="quantityData" />
            </NuxtLink>
        </template>
    </div>
    <div v-else class="message message-error">
        No data found for: <strong>{{ foodFilter.join(', ') }}</strong>
    </div>
</template>

<style scoped>
details.dropdown summary + ul li:first-of-type {
    margin-top: 0;
    padding-block: calc(var(--pico-form-element-spacing-vertical) * 0.5 * 2);
}

.dropdown {
    margin-bottom: 2rem;
}

.dropdown ul {
    max-height: 50vh;
    overflow-y: auto;
}

.dropdown .search {
    position: sticky;
    top: 0;
    background-color: var(--pico-dropdown-background-color);
}

.dropdown input[type='text'] {
    margin-bottom: 0;
}

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

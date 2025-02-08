<script setup lang="ts">
import { useFoodStore } from '~~/stores/food';

const foodStore = useFoodStore();
const foodData = computed(() => foodStore.foodData);

if (!foodData.value) {
    await foodStore.getFoodData();
}

// Remove duplicates
const [...foodList] =
    foodData.value?.foodList.reduce((acc, food) => {
        return acc.add(food[FoodsFields.Name]);
    }, new Set<string>([])) || new Set<string>([]);

const SEARCH_PARAM_NAME = 'q';
const SEARCH_PARAMS_SEPARATOR = '&';

const dropdown = ref<HTMLDetailsElement>();
const foodFilter = ref<string[]>([]);
const foodListFilter = ref('');
const priceHistoryByFood =
    foodData.value?.priceHistory &&
    foodStore.getPriceHistoryBy(foodData.value.priceHistory, PriceHistoryFields.Food);

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
    },
);
</script>

<template>
    <details class="dropdown" ref="dropdown">
        <summary>Select foods...</summary>
        <ul>
            <li class="search">
                <input type="text" v-model="foodListFilter" placeholder="Search a food" />
            </li>
            <template v-for="food in foodList">
                <li v-show="food.toLowerCase().indexOf(foodListFilter.toLowerCase()) !== -1">
                    <label>
                        <input type="checkbox" v-model="foodFilter" :value="parseUrlParam(food)" />
                        {{ food }}
                    </label>
                </li>
            </template>
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
            <span>{{ foodStore.getFoodNameFromUrlParam(food) }}</span>
        </button>
        <button
            v-if="foodFilter.length > 1"
            type="button"
            @click="foodFilter = []"
            class="remove-all"
        >
            <span>Remove all filters</span>
        </button>
    </div>
    <div class="foods" v-if="priceHistoryByFood && Object.entries(priceHistoryByFood).length">
        <article
            class="food"
            v-for="[foodName, foodData] in Object.entries(priceHistoryByFood)"
            :key="foodName"
            v-show="foodFilter.includes(parseUrlParam(foodName)) || !foodFilter.length"
        >
            <h4 class="title">
                {{ foodName }}
            </h4>
            <div
                class="content"
                v-if="
                    Object.entries(
                        foodStore.getPriceHistoryBy(foodData, PriceHistoryFields.Supermarket),
                    ).length
                "
            >
                <p>Average prices:</p>
                <div
                    class="supermarket"
                    v-for="[supermarket, supermarketData] in Object.entries(
                        foodStore.getPriceHistoryBy(foodData, PriceHistoryFields.Supermarket),
                    )"
                    :key="supermarket"
                >
                    <span>{{ supermarket }}:</span>
                    <strong>{{ foodStore.getAveragePrice(supermarketData) }}</strong>
                </div>
            </div>
            <NuxtLink
                class="link"
                :to="{ name: 'food', params: { food: parseUrlParam(foodName) } }"
            />
        </article>
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

.foods {
    display: grid;
    gap: 2rem;
}

.food {
    position: relative;
    margin-bottom: 0;
}

.food:hover {
    --pico-card-background-color: var(--pico-card-sectioning-background-color);
}

.link {
    position: absolute;
    inset: 0;
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
    .foods {
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }
}
</style>

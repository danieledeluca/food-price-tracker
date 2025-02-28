const SEARCH_PARAM_NAME = 'q';
const SEARCH_PARAM_SEPARATOR = '&';

export const useFoodStore = defineStore('food', () => {
    const foods = ref<Food[]>([]);
    const priceHistory = ref<PriceHistory[]>([]);

    const filters = ref<string[]>([]);

    const route = useRoute();
    const searchParam = route.query[SEARCH_PARAM_NAME] as string | undefined;
    const urlFilters = searchParam?.split(SEARCH_PARAM_SEPARATOR);

    if (urlFilters && urlFilters[0]) {
        filters.value = urlFilters;
    }

    async function fetchData() {
        if (!foods.value.length || !priceHistory.value.length) {
            const { data, error } = await useFetch('/api/foods');

            if (error.value) {
                throw createError({
                    status: error.value.status,
                    message: error.value.statusText,
                });
            }

            foods.value = data.value?.foods || [];
            priceHistory.value = data.value?.priceHistory || [];
        }
    }

    function updateFilters() {
        const url = new URL(window?.location.href);
        url.searchParams.set(SEARCH_PARAM_NAME, filters.value.join(SEARCH_PARAM_SEPARATOR));

        window.history.replaceState({}, '', url.toString());
    }

    function removeFilter(index: number) {
        filters.value = filters.value.toSpliced(index, 1);
    }

    function removeAllFilters() {
        filters.value = [];
    }

    watch(filters, () => updateFilters());

    return {
        foods,
        priceHistory,
        filters,
        fetchData,
        removeFilter,
        removeAllFilters,
    };
});

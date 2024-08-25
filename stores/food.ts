export const useFoodStore = defineStore('food', () => {
    const foodData = ref<{ foodList: Food[]; priceHistory: PriceHistory[] } | null>(null);

    async function getFoodData() {
        const { data } = await useFetch('/api/foods');

        foodData.value = {
            foodList: unSerializeObject(data.value?.foodList),
            priceHistory: unSerializeObject(data.value?.priceHistory),
        };
    }

    function getPriceHistoryBy(
        priceHistory: PriceHistory[],
        key: (typeof PriceHistoryFields)[keyof typeof PriceHistoryFields]
    ) {
        return priceHistory.reduce<{ [key: string]: PriceHistory[] }>((acc, entry) => {
            if (!acc[entry[key]]) {
                acc[entry[key]] = [];
            }

            acc[entry[key]].push(entry);

            return acc;
        }, {});
    }

    function getPriceHistoryByQuantity(priceHistory: PriceHistory[]) {
        return Object.entries(getPriceHistoryBy(priceHistory, PriceHistoryFields.Packaging));
    }

    return {
        foodData,
        getFoodData,
        getPriceHistoryBy,
        getPriceHistoryByQuantity,
    };
});

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

    function getAveragePrice(data: PriceHistory[]) {
        const prices = data.map((entry) => parseFloat(entry[PriceHistoryFields.PricePerKg].replace(',', '.')));

        return formatPrice(prices.reduce((acc, price) => acc + price, 0) / prices.length);
    }

    function getFoodNameFromUrlParam(param: string) {
        return (
            foodData.value?.foodList.find((food) => parseUrlParam(food[FoodsFields.Name]) === param)?.[
                FoodsFields.Name
            ] || ''
        );
    }

    return {
        foodData,
        getFoodData,
        getPriceHistoryBy,
        getAveragePrice,
        getFoodNameFromUrlParam,
    };
});

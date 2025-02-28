export function formatPrice(price: string | number) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(parseFloat(price.toString()));
}

export function formatDate(date: string) {
    return new Intl.DateTimeFormat('it-IT', {
        dateStyle: 'long',
    }).format(new Date(date));
}

export function groupBy<T>(array: T[] | undefined, _key: keyof T) {
    return array?.reduce<Record<string, T[]>>((acc, item) => {
        const key = item[_key] as string;

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(item);

        return acc;
    }, {});
}

export function parseFoodName(foods: Food[], _food: string) {
    return foods.find((food) => parseUrlParam(food[FoodsFields.Name]) === _food)?.[
        FoodsFields.Name
    ];
}

export function parseUrlParam(param: string) {
    return encodeURI(
        param
            .replace(/[^\x00-\x7F]+/g, '') // eslint-disable-line no-control-regex
            .trim()
            .replace(/\s/g, '-')
            .toLowerCase(),
    );
}

export function getAveragePrice(priceHistory: PriceHistory[]) {
    const prices = priceHistory.map((entry) => parseFloat(entry[PriceHistoryFields.PricePerKg]));

    return formatPrice(prices.reduce((acc, price) => acc + price, 0) / prices.length);
}

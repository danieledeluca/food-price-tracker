const foodsDatabaseId = process.env.NOTION_FOODS_DATABASE_ID || '';
const priceHistoryDatabaseId = process.env.NOTION_PRICE_HISTORY_DATABASE_ID || '';
const supermarketsDatabaseId = process.env.NOTION_SUPERMARKETS_DATABASE_ID || '';

export default defineEventHandler(async () => {
    const foods = await getNotionData<Food>(foodsDatabaseId, [FoodsFields.Name]);
    const priceHistory = await getNotionData<PriceHistory>(
        priceHistoryDatabaseId,
        [PriceHistoryFields.Food, PriceHistoryFields.Date],
        [foodsDatabaseId, supermarketsDatabaseId],
    );

    return {
        foods,
        priceHistory,
    };
});

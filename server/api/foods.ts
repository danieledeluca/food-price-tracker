import { Client } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { formatPrice } from '~/utils/formatters';
import { Food, FoodsFields, PriceHistory, PriceHistoryFields, SupermarketsFields } from '~/utils/models';

const NO_DATA_LABEL = 'No data';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const priceHistoryDatabaseId = process.env.NOTION_PRICE_HISTORY_DATABASE_ID || '';
const foodsDatabaseId = process.env.NOTION_FOODS_DATABASE_ID || '';
const supermarketsDatabaseId = process.env.NOTION_SUPERMARKETS_DATABASE_ID || '';

async function getDatabaseData(databaseId: string, sortByProperties: string[]) {
    return await notion.databases.query({
        database_id: databaseId,
        sorts: sortByProperties.map((property) => ({ property, direction: 'ascending' })),
    });
}

async function getData() {
    const foodsDatabase = await getDatabaseData(foodsDatabaseId, [FoodsFields.Name]);
    const supermarketsDatabase = await getDatabaseData(supermarketsDatabaseId, [SupermarketsFields.Name]);
    const relationDatabases = [
        ...(foodsDatabase.results as PageObjectResponse[]),
        ...(supermarketsDatabase.results as PageObjectResponse[]),
    ];
    const priceHistoryDatabase = await getDatabaseData(priceHistoryDatabaseId, [
        PriceHistoryFields.Food,
        PriceHistoryFields.Date,
    ]);

    const foodList = parseData<Food>(foodsDatabase, relationDatabases);
    const priceHistory = parseData<PriceHistory>(priceHistoryDatabase, relationDatabases);

    return {
        foodList,
        priceHistory,
    };
}

function parseData<T extends Food | PriceHistory>(
    databaseResponse: QueryDatabaseResponse,
    relationDatabases: PageObjectResponse[]
) {
    return (databaseResponse.results as PageObjectResponse[]).map((result) => {
        const icon = result.icon?.type === 'emoji' ? result.icon.emoji : '';

        return Object.entries(result.properties).reduce((acc, [key, value]) => {
            let entryValue = `${key === FoodsFields.Name ? icon : ''} ${getEntryValue({ [key]: value })}`.trim();

            if (value.type === 'relation') {
                const data = relationDatabases.find((entry) => entry.id === entryValue);
                const property = data?.properties[FoodsFields.Name];

                entryValue = property?.type === 'title' ? property.title[0].plain_text : '';
            }

            acc[key] = entryValue;

            return acc;
        }, {} as T);
    });
}

function getEntryValue(entry: PageObjectResponse['properties']) {
    const entryKey = Object.keys(entry)[0];
    const entryData = Object.values(entry)[0];

    switch (entryData.type) {
        case 'number':
            const value = entryData.number || 0;

            return entryKey === PriceHistoryFields.PricePerPack ? formatPrice(value) : value;

        case 'relation':
            return entryData.relation[0]?.id;

        case 'formula':
            switch (entryData.formula.type) {
                case 'number':
                    const value = entryData.formula.number || 0;

                    return entryKey === PriceHistoryFields.PricePerKg ? formatPrice(value) : value;

                default:
                    return 0;
            }

        case 'date':
            return entryData.date?.start || NO_DATA_LABEL;

        case 'rollup':
            switch (entryData.rollup.type) {
                case 'array':
                    return getEntryValue({ [entryKey]: entryData.rollup.array[0] } as PageObjectResponse['properties']);

                default:
                    return NO_DATA_LABEL;
            }

        case 'title':
            return entryData.title[0]?.plain_text || NO_DATA_LABEL;

        case 'select':
            return entryData.select?.name || NO_DATA_LABEL;

        case 'rich_text':
            return entryData.rich_text[0]?.plain_text || NO_DATA_LABEL;

        default:
            return NO_DATA_LABEL;
    }
}

export default defineEventHandler(async () => await getData());

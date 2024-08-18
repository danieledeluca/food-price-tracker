import { Client } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { formatPrice } from '~/utils/formatters';
import { Food, FoodsFields, PriceHistory, PriceHistoryFields, SupermarketsFields } from '~/utils/models';

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

    const foods = parseData<Food>(foodsDatabase, relationDatabases);
    const priceHistory = parseData<PriceHistory>(priceHistoryDatabase, relationDatabases).reduce<{
        [key: string]: { [key: string]: PriceHistory[] };
    }>((acc, entry) => {
        const foodName = entry[PriceHistoryFields.Food].toString().toLowerCase().replace(/ /g, '-');

        if (!Object.keys(acc[foodName] || {}).length) {
            acc[foodName] = {};
        }

        if (!acc[foodName][entry[PriceHistoryFields.Packaging]]?.length) {
            acc[foodName][entry[PriceHistoryFields.Packaging]] = [];
        }

        acc[foodName][entry[PriceHistoryFields.Packaging]].push(entry);

        return acc;
    }, {});

    return {
        foods,
        priceHistory,
    };
}

function parseData<T>(databaseResponse: QueryDatabaseResponse, relationDatabases: PageObjectResponse[]) {
    return (databaseResponse.results as PageObjectResponse[]).map((result) => {
        const icon = result.icon?.type === 'emoji' ? result.icon.emoji : '';

        return Object.entries(result.properties).reduce((acc, [key, value]) => {
            let entryValue = `${key === FoodsFields.Name ? icon : ''} ${getEntryValue({ [key]: value })}`.trim();

            if (value.type === 'relation') {
                const data = relationDatabases.find((entry) => entry.id === entryValue);
                const property = data?.properties[FoodsFields.Name];

                entryValue = property?.type === 'title' ? property.title[0].plain_text : '';
            }

            // @ts-ignore
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
            return entryData.date?.start || 'No data';

        case 'rollup':
            switch (entryData.rollup.type) {
                case 'array':
                    return getEntryValue({ [entryKey]: entryData.rollup.array[0] } as PageObjectResponse['properties']);

                default:
                    return 'No data';
            }

        case 'title':
            return entryData.title[0]?.plain_text || 'No data';

        case 'select':
            return entryData.select?.name || 'No data';

        case 'rich_text':
            return entryData.rich_text[0]?.plain_text || 'No data';

        default:
            return 'No data';
    }
}

export default defineEventHandler(async () => await getData());

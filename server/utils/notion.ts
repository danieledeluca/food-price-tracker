/* eslint-disable no-case-declarations */
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const NO_DATA_LABEL = 'N/A';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getNotionData<T>(
    databaseId: string,
    sortByProperties: string[],
    relationDatabasesId?: string[],
): Promise<T[]> {
    const data = await getNotionDatabase(databaseId, sortByProperties);

    if (relationDatabasesId?.length) {
        const relationData = await Promise.all(
            relationDatabasesId.map(async (databaseId) => {
                const data = await getNotionDatabase(databaseId);

                return data.results as PageObjectResponse[];
            }),
        );

        return await parseNotionData<T>(data.results as PageObjectResponse[], relationData.flat());
    }

    return await parseNotionData<T>(data.results as PageObjectResponse[]);
}

async function getNotionDatabase(
    databaseId: string,
    sortByProperties?: string[],
    startCursor: string | null = null,
) {
    const data = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor || undefined,
        sorts: sortByProperties?.map((property) => ({ property, direction: 'ascending' })),
    });

    if (data.has_more) {
        const additionalData = await getNotionDatabase(
            databaseId,
            sortByProperties,
            data.next_cursor,
        );

        data.results.push(...additionalData.results);
    }

    return data;
}

async function parseNotionData<T>(
    results: PageObjectResponse[],
    relationData?: PageObjectResponse[],
): Promise<T[]> {
    return results.map((result) => {
        const icon = getIcon(result);

        const propertiesEntries = Object.entries(result.properties).map(([key, value]) => {
            let propertyValue = getPropertyValue({ [key]: value }, relationData);
            propertyValue = `${key === 'Nome' ? icon : ''} ${propertyValue}`.trim();

            return [key, propertyValue];
        });

        return Object.fromEntries(propertiesEntries) as T;
    });
}

function getPropertyValue(
    property: PageObjectResponse['properties'],
    relationData?: PageObjectResponse[],
): string {
    const propertyKey = Object.keys(property)[0];
    const propertyValue = Object.values(property)[0];

    switch (propertyValue.type) {
        case 'rich_text':
            return propertyValue.rich_text[0]?.plain_text || NO_DATA_LABEL;

        case 'select':
            return propertyValue.select?.name || NO_DATA_LABEL;

        case 'title':
            return propertyValue.title[0]?.plain_text || NO_DATA_LABEL;

        case 'rollup':
            switch (propertyValue.rollup.type) {
                case 'array':
                    const newProperty = {
                        [propertyKey]: propertyValue.rollup.array[0],
                    } as PageObjectResponse['properties'];

                    return getPropertyValue(newProperty, relationData);

                default:
                    return NO_DATA_LABEL;
            }

        case 'date':
            return propertyValue.date?.start || NO_DATA_LABEL;

        case 'number':
            return propertyValue.number?.toString() || NO_DATA_LABEL;

        case 'formula':
            switch (propertyValue.formula.type) {
                case 'number':
                    return propertyValue.formula.number?.toString() || NO_DATA_LABEL;

                default:
                    return NO_DATA_LABEL;
            }

        case 'relation':
            const currentRelation = relationData?.find(
                (data) => data.id === propertyValue.relation[0].id,
            );

            if (currentRelation) {
                const icon = getIcon(currentRelation);
                const nameEntry = Object.entries(currentRelation.properties).find(
                    ([key]) => key === 'Nome',
                );

                return nameEntry
                    ? `${icon} ${getPropertyValue({ [nameEntry[0]]: nameEntry[1] })}`
                    : NO_DATA_LABEL;
            }

            return NO_DATA_LABEL;

        default:
            return NO_DATA_LABEL;
    }
}

function getIcon(result: PageObjectResponse) {
    return result.icon?.type === 'emoji' ? result.icon.emoji : '';
}

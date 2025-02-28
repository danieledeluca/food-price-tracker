<script setup lang="ts">
const { priceHistory } = defineProps<{
    priceHistory: PriceHistory[];
}>();

const tableFields = [
    PriceHistoryFields.Brand,
    PriceHistoryFields.Date,
    PriceHistoryFields.Packaging,
    PriceHistoryFields.PricePerPack,
    PriceHistoryFields.PricePerKg,
];
</script>

<template>
    <div class="table-wrapper overflow-auto">
        <table class="striped">
            <thead>
                <tr>
                    <th v-for="field in tableFields" :key="field">
                        {{ field }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="entry in priceHistory" :key="entry[PriceHistoryFields.Food]">
                    <td v-for="field in tableFields" :key="field" :data-th="field">
                        <template
                            v-if="
                                [
                                    PriceHistoryFields.PricePerPack,
                                    PriceHistoryFields.PricePerKg,
                                ].includes(field)
                            "
                        >
                            {{ formatPrice(entry[field]) }}
                        </template>
                        <template v-else-if="field === PriceHistoryFields.Date">
                            {{ formatDate(entry[field]) }}
                        </template>
                        <template v-else>
                            {{ entry[field] }}
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-wrapper {
    margin-top: 2rem;
}

table {
    margin-bottom: 0;
    white-space: nowrap;
}
</style>

<script setup lang="ts">
const props = defineProps<{ data: PriceHistory[] }>();

const tableFields = [
    PriceHistoryFields.Brand,
    PriceHistoryFields.Supermarket,
    PriceHistoryFields.Date,
    PriceHistoryFields.Packaging,
    PriceHistoryFields.PricePerPack,
    PriceHistoryFields.PricePerKg,
];
</script>

<template>
    <div class="table-data overflow-auto">
        <table class="striped">
            <thead>
                <tr>
                    <th v-for="field in tableFields" :key="field">
                        {{ field }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="entry in props.data" :key="entry[PriceHistoryFields.Food]">
                    <td v-for="field in tableFields" :key="field" :data-th="field">
                        {{ entry[field] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-data {
    margin-top: 2rem;
}

table {
    margin-bottom: 0;
}

@media screen and (min-width: 768px) {
    table {
        white-space: nowrap;
    }
}

@media screen and (max-width: 767.98px) {
    table thead {
        display: none;
    }

    table td {
        display: flex;
    }

    table td::before {
        content: attr(data-th) ': ';
        display: inline-block;
        padding-right: 0.5rem;
        font-weight: 700;
    }
}
</style>

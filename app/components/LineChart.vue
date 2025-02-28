<script setup lang="ts">
import {
    CategoryScale,
    Chart,
    Colors,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Line } from 'vue-chartjs';

const { priceHistory } = defineProps<{
    priceHistory: PriceHistory[];
}>();

const { chartConfigs } = useChartConfigs(priceHistory);

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Colors);
</script>

<template>
    <Line :options="chartConfigs.chartOptions" :data="chartConfigs.chartData">
        Chart couldn't be loaded.
    </Line>
</template>

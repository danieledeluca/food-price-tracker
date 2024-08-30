<script setup lang="ts">
import { Line } from 'vue-chartjs';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Colors } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Colors);

const props = defineProps<{
    data: PriceHistory[];
}>();

const chartConfig = computed(() => getChartConfig(props.data));
</script>

<template>
    <Line :options="chartConfig.chartOptions" :data="chartConfig.chartData">Chart couldn't be loaded.</Line>
</template>

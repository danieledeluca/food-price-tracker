import { Chart, type ChartDataset, type ChartOptions } from 'chart.js';

export default function useChartConfigs(_priceHistory: PriceHistory[]) {
    const priceHistory = toValue(_priceHistory);

    const colorMode = useColorMode();
    const darkMode = colorMode.value === 'dark';

    const chartColors = {
        border: darkMode ? 'rgba(255, 255, 255, 0.2)' : Chart.defaults.borderColor.toString(),
        grid: darkMode ? 'rgba(255, 255, 255, 0.2)' : Chart.defaults.borderColor.toString(),
        title: darkMode ? '#aaaaaa' : Chart.defaults.color.toString(),
        ticks: darkMode ? '#aaaaaa' : Chart.defaults.color.toString(),
    };

    const chartConfigs = computed(() => {
        return {
            chartData: getChartData(),
            chartOptions: getChartOptions(),
        };
    });

    function getChartLabels() {
        return [
            ...priceHistory.reduce((acc, entry) => {
                acc.add(formatDate(entry[PriceHistoryFields.Date]));

                return acc;
            }, new Set<string>([])),
        ];
    }

    function getChartDatasets() {
        return priceHistory.reduce<ChartDataset<'line'>[]>((acc, entry) => {
            const index = acc.findIndex(
                (data) => data.label === entry[PriceHistoryFields.Packaging],
            );
            const price = parseFloat(entry[PriceHistoryFields.PricePerKg]);

            if (index === -1) {
                acc.push({
                    label: entry[PriceHistoryFields.Packaging],
                    data: [price],
                });
            } else {
                acc[index]?.data.push(price);
            }

            return acc;
        }, []);
    }

    function getChartData() {
        return {
            labels: getChartLabels(),
            datasets: getChartDatasets(),
        };
    }

    function getChartOptions(): ChartOptions<'line'> {
        return {
            scales: {
                x: {
                    border: {
                        color: chartColors.border,
                    },
                    grid: {
                        color: chartColors.grid,
                    },
                    ticks: {
                        color: chartColors.ticks,
                    },
                },
                y: {
                    border: {
                        color: chartColors.border,
                    },
                    grid: {
                        color: chartColors.grid,
                    },
                    title: {
                        display: true,
                        text: PriceHistoryFields.PricePerKg,
                        color: chartColors.title,
                    },
                    ticks: {
                        color: chartColors.ticks,
                        callback(tickValue) {
                            return formatPrice(tickValue);
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: chartColors.title,
                    },
                    title: {
                        display: true,
                        text: PriceHistoryFields.Packaging,
                        color: chartColors.title,
                    },
                },
                tooltip: {
                    callbacks: {
                        label(tooltipItem) {
                            let label = tooltipItem.dataset.label;

                            if (label) {
                                label += ': ';
                            }

                            if (tooltipItem.parsed.y !== null) {
                                label += formatPrice(tooltipItem.parsed.y);
                            }

                            return label;
                        },
                    },
                },
                colors: {
                    enabled: true,
                },
            },
        };
    }

    return {
        chartConfigs,
    };
}

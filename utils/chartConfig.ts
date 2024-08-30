import { Chart, type ChartData, type ChartDataset, type ChartOptions } from 'chart.js';

const darkMode = window?.matchMedia('(prefers-color-scheme: dark)').matches;

const chartColors = computed(() => {
    return {
        border: darkMode ? 'rgba(255, 255, 255, 0.2)' : Chart.defaults.borderColor.toString(),
        grid: darkMode ? 'rgba(255, 255, 255, 0.2)' : Chart.defaults.borderColor.toString(),
        title: darkMode ? '#aaa' : Chart.defaults.color.toString(),
        ticks: darkMode ? '#aaa' : Chart.defaults.color.toString(),
    };
});

function getChartLabels(data: PriceHistory[]) {
    return [
        ...data.reduce<Set<string>>((acc, entry) => {
            acc.add(formatDate(entry[PriceHistoryFields.Date]));

            return acc;
        }, new Set([])),
    ];
}

function getChartDatasets(data: PriceHistory[]): ChartDataset<'line'>[] {
    return data.reduce<ChartDataset<'line'>[]>((acc, entry) => {
        const index = acc.findIndex((data) => data.label === entry[PriceHistoryFields.Packaging]);
        const price = parseFloat(entry[PriceHistoryFields.PricePerKg].replace(',', '.'));

        if (index === -1) {
            acc.push({
                label: entry[PriceHistoryFields.Packaging],
                data: [price],
            });
        } else {
            acc[index].data.push(price);
        }

        return acc;
    }, []);
}

function getChartData(data: PriceHistory[]): ChartData<'line'> {
    return {
        labels: getChartLabels(data),
        datasets: getChartDatasets(data),
    };
}

function getChartOptions(): ChartOptions<'line'> {
    return {
        scales: {
            x: {
                border: {
                    color: chartColors.value.border,
                },
                grid: {
                    color: chartColors.value.grid,
                },
                ticks: {
                    color: chartColors.value.ticks,
                },
            },
            y: {
                border: {
                    color: chartColors.value.border,
                },
                grid: {
                    color: chartColors.value.grid,
                },
                title: {
                    display: true,
                    text: 'Price per kg',
                    color: chartColors.value.title,
                },
                ticks: {
                    color: chartColors.value.ticks,
                    callback(tickValue) {
                        return formatPrice(tickValue);
                    },
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: chartColors.value.title,
                },
                title: {
                    display: true,
                    text: 'Packaging (g)',
                    color: chartColors.value.title,
                },
            },
            tooltip: {
                callbacks: {
                    label(tooltipItem) {
                        let label = tooltipItem.dataset.label || '';

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

export function getChartConfig(data: PriceHistory[]) {
    const chartData = getChartData(data);
    const chartOptions = getChartOptions();

    return { chartData, chartOptions };
}

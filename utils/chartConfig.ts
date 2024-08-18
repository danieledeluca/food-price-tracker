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

const supermarketColors = {
    [Supermarkets.Amazon]: {
        backgroundColor: 'rgb(244, 144, 12)',
        borderColor: 'rgb(193, 113, 9)',
    },
    [Supermarkets.Coop]: {
        backgroundColor: 'rgb(221, 46, 68)',
        borderColor: 'rgb(170, 35, 52)',
    },
    [Supermarkets.Despar]: {
        backgroundColor: 'rgb(119, 178, 86)',
        borderColor: 'rgb(84, 126, 61)',
    },
    [Supermarkets.Emisfero]: {
        backgroundColor: 'rgb(85, 172, 239)',
        borderColor: 'rgb(66, 135, 188)',
    },
    [Supermarkets.Lidl]: {
        backgroundColor: 'rgb(252, 204, 89)',
        borderColor: 'rgb(201, 162, 70)',
    },
};

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
        const supermarket = entry[PriceHistoryFields.Supermarket];
        const index = acc.findIndex((data) => data.label === supermarket);
        const colors = supermarketColors[supermarket as keyof typeof supermarketColors];
        const price = parseFloat(entry[PriceHistoryFields.PricePerKg].replace(',', '.'));

        if (index === -1) {
            acc.push({
                label: entry[PriceHistoryFields.Supermarket],
                data: [price],
                backgroundColor: colors?.backgroundColor,
                borderColor: colors?.borderColor,
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
                    text: PriceHistoryFields.PricePerKg,
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
        },
    };
}

export function getChartConfig(data: PriceHistory[]) {
    const chartData = getChartData(data);
    const chartOptions = getChartOptions();

    return { chartData, chartOptions };
}

const locales = 'it-IT';

export function formatPrice(price: string | number) {
    return new Intl.NumberFormat(locales, {
        style: 'currency',
        currency: 'EUR',
    }).format(parseFloat(price.toString()));
}

export function formatDate(date: string) {
    return new Intl.DateTimeFormat(window?.navigator.language, {
        dateStyle: 'long',
    }).format(new Date(date));
}

export function unSerializeObject<T>(object: T) {
    return JSON.parse(JSON.stringify(object));
}

export function removeNonAsciiCharacters(text: string) {
    return text.replace(/[^\x00-\x7F]+/g, '').trim();
}

export function parseUrlParam(param: string) {
    return removeNonAsciiCharacters(param).toLowerCase().replace(/ /g, '-');
}

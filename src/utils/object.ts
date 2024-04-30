
export function sortObjectByKey<T>(obj: {[key: string]: T}): {[key: string]: T} {
    // Obter as chaves do objeto e ordená-las
    const sortedKeys = Object.keys(obj).sort();

    // Criar um novo objeto ordenado
    const sortedObject: {[key: string]: T} = {};

    // Iterar sobre as chaves ordenadas e adicionar os valores ao novo objeto
    sortedKeys.forEach(key => {
        sortedObject[key] = obj[key];
    });

    return sortedObject;
}

export function sortObjectByValue(obj: { [key: string]: number }): { [key: string]: number } {
    const sortedKeys = Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    const sortedObject: { [key: string]: number } = {};

    sortedKeys.forEach(key => {
        sortedObject[key] = obj[key];
    });

    return sortedObject;
}

export function isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
}

export function sortObjectByKey<T>(originalObject: {[key: string]: T}): {[key: string]: T} {
    // Obter as chaves do objeto e ordená-las
    const sortedKeys = Object.keys(originalObject).sort();

    // Criar um novo objeto ordenado
    const sortedObject: {[key: string]: T} = {};

    // Iterar sobre as chaves ordenadas e adicionar os valores ao novo objeto
    sortedKeys.forEach(key => {
        sortedObject[key] = originalObject[key];
    });

    return sortedObject;
}

export function isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
}
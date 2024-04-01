const mapAsync = <T, U>(array: T[], predicate: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> => {
    return Promise.all(array.map(predicate));
}

export const filterAsync = async<T>(array: T[], predicate: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]> => {
    const filterMap = await mapAsync(array, predicate);
    return array.filter((value, index) => filterMap[index]);
}
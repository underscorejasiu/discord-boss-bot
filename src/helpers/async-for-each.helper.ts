export async function asyncForEach<T>(
    array: T[],
    callback: (...args) => Promise<void>
): Promise<void> {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

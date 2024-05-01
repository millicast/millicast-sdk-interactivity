/**
 * Take a break for a number of seconds.
 * @param seconds Number of seconds to wait.
 */
const sleep = (seconds: number) => new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

const isNotDefined = (value: string | null | undefined) => !value || !value.length;

const firstOrUndefined = <T>(array: Array<T>): T => {
    if (array && array.length) {
        return array[0];
    }
};

export { sleep, isNotDefined, firstOrUndefined };

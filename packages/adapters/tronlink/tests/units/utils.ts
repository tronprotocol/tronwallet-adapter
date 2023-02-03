export async function wait() {
    const p = new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    jest.advanceTimersByTime(1000);
    await p;
    await p;
}
export const ONE_MINUTE = 62 * 1000;

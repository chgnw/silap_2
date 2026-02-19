/**
 * Returns a YYYY-MM-DD string in Asia/Jakarta (WIB, UTC+7) timezone.
 * 
 * - This helper always returns the correct local date in WIB.
 * 
 * @param date - Optional Date object. Defaults to now.
 */
export function toWIBDateString(date?: Date | string): string {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

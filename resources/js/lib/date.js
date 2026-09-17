/**
 * Format a date string or object to an Indonesian localized date string.
 * @param {string|Date} value - The date to format
 * @param {boolean} [withTime=false] - Whether to include time
 * @returns {string|null} - Formatted date string (e.g., "17 September 2026") or null if invalid
 */
export function formatDate(value, withTime = false) {
    if (!value) return null;
    
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return null;

        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
        };

        return date.toLocaleDateString('id-ID', options);
    } catch (e) {
        return null;
    }
}

/**
 * Format a date string or object to an Indonesian localized date-time string.
 * @param {string|Date} value - The date to format
 * @returns {string|null} - Formatted date string (e.g., "17 September 2026, 15:30")
 */
export function formatDateTime(value) {
    return formatDate(value, true);
}

/**
 * Format a start and end date to an Indonesian localized date range string.
 * Handles same month/year collapsing.
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date
 * @returns {string|null} - Formatted date range (e.g., "17 - 20 September 2026" or "17 September - 5 Oktober 2026")
 */
export function formatDateRange(start, end) {
    if (!start) return null;
    if (!end) return formatDate(start);

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

    if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
    ) {
        if (startDate.getDate() === endDate.getDate()) {
            return formatDate(start);
        }
        return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString(
            'id-ID',
            { month: 'long', year: 'numeric' }
        )}`;
    }

    if (startDate.getFullYear() === endDate.getFullYear()) {
        return `${startDate.getDate()} ${startDate.toLocaleDateString('id-ID', {
            month: 'long',
        })} - ${endDate.getDate()} ${endDate.toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
        })}`;
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
}

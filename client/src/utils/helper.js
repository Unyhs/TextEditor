export const formatSimpleDateTime = (isoString) => {
    const date = new Date(isoString);
    
    // Define formatting options for a clear display
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    // Uses the user's locale (browser default) for language/number formatting
    return new Intl.DateTimeFormat(undefined, options).format(date);
};
export const formatNumber = (value) => {
    if (value === null || value === undefined || value === "" || isNaN(value)) {
        return "0";
    }

    const num = Number(value);

    // If whole number → show without decimals
    if (Number.isInteger(num)) {
        return num.toString();
    }

    // If decimal number → show max 2 decimals
    return num.toFixed(2);
};

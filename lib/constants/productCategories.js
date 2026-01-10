export const PRODUCT_CATEGORIES = [
    "Beauty",
    "Electronics",
    "Kids",
    "Kitchen",
    "Snacks",
    "Drinks",
    "Household",
    "Pharma",
    "others",
];

export function formatProductCategory(category) {
    if (!category) return "—";
    if (category === "others") return "Others";
    return String(category);
}

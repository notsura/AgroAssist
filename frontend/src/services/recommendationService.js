export const recommendCrop = (inputs) => {
    const { soil, season, climate } = inputs;
    
    // Simple rule-based logic for demonstration
    const recommendations = {
        "Alluvial": {
            "Summer": { "Hot": ["Rice", "Sugar Cane"], "Moderate": ["Rice", "Banana"] },
            "Winter": { "Cool": ["Wheat", "Mustard"], "Moderate": ["Maize"] }
        },
        "Red": {
            "Summer": { "Hot": ["Groundnut", "Ragi"], "Moderate": ["Tobacco"] },
            "Winter": { "Cool": ["Wheat", "Potato"], "Moderate": ["Maize"] }
        },
        "Black": {
            "Summer": { "Hot": ["Cotton", "Soybean"], "Moderate": ["Sorghum"] },
            "Winter": { "Cool": ["Wheat", "Linseed"], "Moderate": ["Gram"] }
        }
    };

    try {
        const crops = recommendations[soil]?.[season]?.[climate] || ["Local crops based on local expertise"];
        return crops;
    } catch (e) {
        return ["Consult local agricultural expert"];
    }
};

export const getFarmingGuidance = (crop) => {
    const guidance = {
        "Rice": {
            irrigation: "High (Maintain standing water)",
            fertilizer: "Urea, DAP, MOP",
            pests: "Stem borer, Leaf holder",
            harvest: "3-4 months after transplanting"
        },
        "Wheat": {
            irrigation: "Moderate (4-6 irrigations)",
            fertilizer: "NPK, Urea",
            pests: "Brown rust, Aphids",
            harvest: "120-150 days"
        },
        "Cotton": {
            irrigation: "Regular but controlled",
            fertilizer: "Nitrogen, Phosphorus",
            pests: "Bollworm, Whitefly",
            harvest: "5-6 months"
        }
    };
    return guidance[crop] || {
        irrigation: "Standard practices",
        fertilizer: "Organic compost",
        pests: "Generic pest control",
        harvest: "Depends on growth"
    };
};

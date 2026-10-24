export function normalizeCurrency(currency?: string | null): "y.e" | "so'm" {
  if (!currency) return "y.e";
  const c = currency.trim().toLowerCase();
  if (
    c === "$" ||
    c === "usd" ||
    c === "у.е" ||
    c === "у.е." ||
    c === "y.e" ||
    c === "y.e." ||
    c.includes("y.e") ||
    c.includes("$") ||
    c.includes("usd")
  ) {
    return "y.e";
  }
  return "so'm";
}

export interface ListingValidationInput {
  price: number | string;
  currency?: string | null;
  area: number | string;
  rooms: number | string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedCurrency: "y.e" | "so'm";
  numPrice: number;
  numArea: number;
  numRooms: number;
}

export function validateListingNumbers(input: ListingValidationInput): ValidationResult {
  const normCurrency = normalizeCurrency(input.currency);
  const numPrice = typeof input.price === "number" ? input.price : parseFloat(String(input.price));
  const numArea = typeof input.area === "number" ? input.area : parseFloat(String(input.area));
  const numRooms = typeof input.rooms === "number" ? input.rooms : parseInt(String(input.rooms), 10);

  if (isNaN(numPrice)) {
    return {
      valid: false,
      error: "Narx to'g'ri kiritilishi kerak",
      normalizedCurrency: normCurrency,
      numPrice,
      numArea,
      numRooms,
    };
  }

  if (normCurrency === "y.e") {
    if (numPrice < 10 || numPrice > 10_000_000) {
      return {
        valid: false,
        error: "Narx 10 va 10 000 000 y.e oralig'ida bo'lishi kerak",
        normalizedCurrency: normCurrency,
        numPrice,
        numArea,
        numRooms,
      };
    }
  } else {
    if (numPrice <= 10_000) {
      return {
        valid: false,
        error: "Narx kamida 10 000 so'm bo'lishi kerak",
        normalizedCurrency: normCurrency,
        numPrice,
        numArea,
        numRooms,
      };
    }
  }

  if (isNaN(numArea) || numArea <= 0 || numArea > 100_000) {
    return {
      valid: false,
      error: "Maydon 0 dan katta va 100 000 m² dan oshmasligi kerak",
      normalizedCurrency: normCurrency,
      numPrice,
      numArea,
      numRooms,
    };
  }

  if (isNaN(numRooms) || !Number.isInteger(numRooms) || numRooms < 0 || numRooms > 100) {
    return {
      valid: false,
      error: "Xonalar soni 0 dan 100 gacha bo'lgan butun son bo'lishi kerak",
      normalizedCurrency: normCurrency,
      numPrice,
      numArea,
      numRooms,
    };
  }

  return {
    valid: true,
    normalizedCurrency: normCurrency,
    numPrice,
    numArea,
    numRooms,
  };
}

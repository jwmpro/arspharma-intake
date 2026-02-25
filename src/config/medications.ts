export interface MedicationConfig {
  medId: string;
  name: string;
  strength: string;
  quantity: string;
  refills: string;
  dispense: string;
  days: number;
  sig: string;
}

export interface ProductOption {
  id: string;
  label: string;
  description: string;
  duration: number; // months
  quantity: number; // number of devices
  pricePerDevice: number;
  totalPrice: number;
  medication: MedicationConfig;
}

// Neffy medication data (placeholder medIds — update with real Beluga IDs)
export const MEDICATIONS: Record<string, MedicationConfig> = {
  neffy_2pack: {
    medId: "NEFFY_2PACK_PLACEHOLDER",
    name: "neffy (epinephrine nasal spray) 2mg",
    strength: "2mg",
    quantity: "2",
    refills: "0",
    dispense: "device",
    days: 365,
    sig: "For emergency use: Spray into one nostril at the first sign of an allergic reaction (anaphylaxis). If symptoms continue or worsen after 5 minutes, administer a second dose in the same nostril using a new device.",
  },
  neffy_4pack: {
    medId: "NEFFY_4PACK_PLACEHOLDER",
    name: "neffy (epinephrine nasal spray) 2mg",
    strength: "2mg",
    quantity: "4",
    refills: "0",
    dispense: "device",
    days: 365,
    sig: "For emergency use: Spray into one nostril at the first sign of an allergic reaction (anaphylaxis). If symptoms continue or worsen after 5 minutes, administer a second dose in the same nostril using a new device.",
  },
};

// Pricing constants
export const CONSULTATION_FEE = 30;
export const SHIPPING_FEE = 0;

// Product options for plan selection
export const PRODUCT_OPTIONS: ProductOption[] = [
  {
    id: "neffy_single",
    label: "neffy® Twin Pack (2 devices)",
    description: "2 neffy devices for emergency anaphylaxis treatment",
    duration: 12,
    quantity: 2,
    pricePerDevice: 199,
    totalPrice: 199,
    medication: MEDICATIONS.neffy_2pack,
  },
];

export function getProductOption(id: string): ProductOption | undefined {
  return PRODUCT_OPTIONS.find((p) => p.id === id);
}

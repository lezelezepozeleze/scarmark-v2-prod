// Inputs for tests/golden/armor-protection.json. Worn-armor protection per location type and aspect, two consumers:
// "helper" = helpers/combat/armor.mjs armorProtection, "sheet" = the actor sheet's combatArmorLocations row.
// Capture: npm run golden -- --capture armor-protection
const piece = (o = {}) => ({
  quality: 3, layer: 3, carried: true, quantity: 1, weight: 0, locations: ["head"],
  protection: { blunt: 4, edged: 5, piercing: 3, fire: 2 }, ...o
});

const variants = [
  ["aq-3-worn", { locationType: "head", armor: [piece()] }],
  ["aq-1-worn", { locationType: "head", armor: [piece({ quality: 1 })] }],
  ["aq-0-destroyed-excluded", { locationType: "head", armor: [piece({ quality: 0 })] }],
  ["aq-minus-1-natural-included", { locationType: "head", armor: [piece({ quality: -1, layer: 0, protection: { blunt: 1, edged: 1, piercing: 1, fire: 0 } })] }],
  ["two-layers-sum", { locationType: "head", armor: [piece(), piece({ layer: 4, protection: { blunt: 2, edged: 6, piercing: 4, fire: 1 } })] }],
  ["mix-destroyed-and-natural", { locationType: "head", armor: [piece({ quality: 0 }), piece({ quality: -1 }), piece({ quality: 2, protection: { blunt: 1, edged: 1, piercing: 1, fire: 1 } })] }],
  ["packed-in-carried-container", { locationType: "head", container: { carried: true }, armor: [piece({ container: "bag" })] }],
  ["packed-in-dropped-container", { locationType: "head", container: { carried: false }, armor: [piece({ container: "bag" })] }],
  ["container-id-not-on-actor-counts", { locationType: "head", armor: [piece({ container: "gone" })] }],
  ["not-carried", { locationType: "head", armor: [piece({ carried: false })] }],
  ["does-not-cover-location", { locationType: "chest", armor: [piece()] }],
  ["covers-several-locations", { locationType: "chest", armor: [piece({ locations: ["chest", "belly", "head"] })] }],
  ["legacy-armor-key-skull-covers-head", { locationType: "head", armor: [piece({ locations: ["skull"] })] }],
  ["legacy-location-type-thorax", { locationType: "thorax", armor: [piece({ locations: ["chest"] })] }],
  ["legacy-location-and-armor-keys", { locationType: "forearm", armor: [piece({ locations: ["elbow"] })] }],
  ["aspect-missing-counts-0", { locationType: "head", armor: [piece({ protection: { blunt: 4 } })] }],
  ["protection-missing", { locationType: "head", armor: [piece({ protection: undefined })] }],
  ["locations-empty", { locationType: "head", armor: [piece({ locations: [] })] }],
  ["locations-missing", { locationType: "head", armor: [piece({ locations: undefined })] }],
  ["no-armor", { locationType: "head", armor: [] }],
  ["creature-location", { locationType: "creatureChest", armor: [piece({ locations: ["creatureChest"], protection: { blunt: 3, edged: 3, piercing: 3, fire: 0 } })] }]
];

export const cases = ["helper", "sheet"].flatMap(consumer =>
  variants.map(([id, input]) => ({ id: `${consumer}-${id}`, input: { consumer, ...input } })));

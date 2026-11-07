/**
 * Server-Side Price Verification & Order Integrity Engine
 * NEVER trusts client-submitted prices or quantities.
 * Recalculates all order totals against the canonical catalog database.
 */
import { PRODUCTS } from '../data/mockData.js';

// Canonical add-on price dictionary
const CANONICAL_ADDONS = {
  'addon-topper': { id: 'addon-topper', price: 25, nameAr: 'تغريزة أكريليك' },
  'addon-balloon': { id: 'addon-balloon', price: 15, nameAr: 'بالون هيليوم' },
  'addon-chocolate': { id: 'addon-chocolate', price: 65, nameAr: 'شوكولاتة فاخرة' },
};

/**
 * Validates and recalculates an order payload using canonical catalog prices.
 * Protects against client-side parameter tampering, price manipulation, and negative quantity attacks.
 *
 * @param {Array<object>} clientItems - Array of order items sent by client
 * @returns {{
 *   isValid: boolean,
 *   tamperingDetected: boolean,
 *   verifiedItems: Array<object>,
 *   subtotal: number,
 *   deliveryFee: number,
 *   grandTotal: number,
 *   tamperingDetails: Array<string>
 * }}
 */
export function verifyAndRecalculateOrder(clientItems) {
  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    return {
      isValid: false,
      tamperingDetected: false,
      verifiedItems: [],
      subtotal: 0,
      deliveryFee: 0,
      grandTotal: 0,
      tamperingDetails: ['Cart is empty or invalid format.'],
    };
  }

  const catalogMap = new Map(PRODUCTS.map((p) => [p.id, p]));
  const verifiedItems = [];
  let subtotal = 0;
  let tamperingDetected = false;
  const tamperingDetails = [];

  for (const item of clientItems) {
    const canonicalProd = catalogMap.get(item.id);

    if (!canonicalProd) {
      tamperingDetected = true;
      tamperingDetails.push(`Unknown product ID requested: "${item.id}"`);
      continue;
    }

    // Verify quantity is a positive safe integer
    const rawQty = Number(item.quantity);
    const quantity = Number.isInteger(rawQty) && rawQty >= 1 && rawQty <= 50 ? rawQty : 1;
    if (quantity !== rawQty) {
      tamperingDetected = true;
      tamperingDetails.push(`Invalid quantity detected (${rawQty}) for item ${item.id}, normalized to ${quantity}.`);
    }

    // Canonical base price directly from master catalog
    const canonicalBasePrice = Number(canonicalProd.price);

    // Verify client did not tamper with the item unit price
    if (item.price !== undefined && Number(item.price) !== canonicalBasePrice) {
      tamperingDetected = true;
      tamperingDetails.push(
        `[PRICE TAMPERING] Item "${canonicalProd.titleAr}" client price (${item.price} SAR) differs from canonical price (${canonicalBasePrice} SAR).`
      );
    }

    // Verify add-ons
    let addonsTotal = 0;
    const verifiedAddons = [];
    if (Array.isArray(item.addons)) {
      for (const addon of item.addons) {
        const canonicalAddon = CANONICAL_ADDONS[addon.id];
        if (canonicalAddon) {
          verifiedAddons.push({
            id: canonicalAddon.id,
            nameAr: canonicalAddon.nameAr,
            price: canonicalAddon.price,
            phrase: typeof addon.phrase === 'string' ? addon.phrase.slice(0, 100) : '',
          });
          addonsTotal += canonicalAddon.price;
        }
      }
    }

    const verifiedUnitTotal = canonicalBasePrice + addonsTotal;
    const lineTotal = verifiedUnitTotal * quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      id: canonicalProd.id,
      titleAr: canonicalProd.titleAr,
      titleEn: canonicalProd.titleEn,
      image: canonicalProd.image,
      basePrice: canonicalBasePrice,
      addonsPrice: addonsTotal,
      unitPrice: verifiedUnitTotal,
      price: verifiedUnitTotal,
      quantity,
      lineTotal,
      addons: verifiedAddons,
      giftCardMessage: typeof item.giftCardMessage === 'string' ? item.giftCardMessage.slice(0, 300) : null,
      handover: item.handover || { type: 'gift' },
    });
  }

  // Delivery policy: Free delivery over 300 SAR, standard 25 SAR otherwise
  const deliveryFee = subtotal >= 300 ? 0 : 25;
  const grandTotal = subtotal + deliveryFee;

  if (tamperingDetected) {
    console.warn('[Security Event] Price or quantity tampering detected during checkout verification:', tamperingDetails);
  }

  return {
    isValid: verifiedItems.length > 0,
    tamperingDetected,
    verifiedItems,
    subtotal,
    deliveryFee,
    grandTotal,
    tamperingDetails,
  };
}

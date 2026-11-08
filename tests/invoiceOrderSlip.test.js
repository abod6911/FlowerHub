import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createOrderSlipFromSingleItem,
  createOrderSlipFromBag,
  createOrderSlipFromCustomOrder,
  createOrderSlipFromTransaction,
} from '../src/utils/orderSlipHelper.js';

describe('Invoice Order Slip Dynamic Generation', () => {
  it('should generate distinct dynamic order slips for two different direct checkout products', () => {
    const item1 = {
      id: 'p1',
      nameAr: 'باقة الورد الجوري الملكية',
      nameEn: 'Royal Red Roses',
      price: 245,
      quantity: 1,
      giftCardMessage: 'كل عام وأنت بخير يا أحمد',
      handover: {
        customerName: 'سارة المنصور',
        customerPhone: '0551112233',
        recipientName: 'أحمد',
        recipientPhone: '0559998877',
        deliveryDistrict: 'حي النرجس',
        deliveryAddress: 'شارع الملك فهد، عمارة 12',
        type: 'gift',
        timing: 'الليلة',
      },
    };

    const item2 = {
      id: 'p2',
      nameAr: 'فازة هيدرانجيا بلش الفرنسية',
      nameEn: 'Blush Hydrangea French Vase',
      price: 320,
      quantity: 1,
      giftCardMessage: 'مبروك التخرج مريم',
      handover: {
        customerName: 'عبدالله السعيد',
        customerPhone: '0504445566',
        recipientName: 'مريم',
        recipientPhone: '0507776655',
        deliveryDistrict: 'حي الملقا',
        deliveryAddress: 'فيلا 44',
        type: 'delivery',
        timing: 'غداً صباحاً',
      },
    };

    const slip1 = createOrderSlipFromSingleItem(item1, 'ar');
    const slip2 = createOrderSlipFromSingleItem(item2, 'ar');

    // Both should be completely different from each other and NOT hardcoded FLW-8492
    assert.notStrictEqual(slip1.orderId, slip2.orderId);
    assert.strictEqual(slip1.customerName, 'سارة المنصور');
    assert.strictEqual(slip2.customerName, 'عبدالله السعيد');
    assert.strictEqual(slip1.recipientName, 'أحمد');
    assert.strictEqual(slip2.recipientName, 'مريم');
    assert.strictEqual(slip1.bouquet.titleAr, 'باقة الورد الجوري الملكية');
    assert.strictEqual(slip2.bouquet.titleAr, 'فازة هيدرانجيا بلش الفرنسية');
    assert.strictEqual(slip1.greetingCard.message, 'كل عام وأنت بخير يا أحمد');
    assert.strictEqual(slip2.greetingCard.message, 'مبروك التخرج مريم');
    assert.strictEqual(slip1.totalAmount, 245 + 25);
    assert.strictEqual(slip2.totalAmount, 320 + 25);
  });

  it('should correctly build order slip from cart items with multi-item lists', () => {
    const bagItems = [
      {
        id: 'p1',
        nameAr: 'باقة الورد الجوري الملكية',
        price: 200,
        quantity: 2,
        addons: [{ nameAr: 'توبير تخرج', price: 20 }],
      },
      {
        id: 'p2',
        nameAr: 'بوكس شوكولاتة باتشي',
        price: 150,
        quantity: 1,
        addons: [],
      },
    ];

    const handover = {
      customerName: 'فاطمة',
      recipientName: 'نورة',
      deliveryDistrict: 'حي الياسمين',
      type: 'gift',
    };

    const slip = createOrderSlipFromBag(bagItems, handover, 'ar');

    assert.strictEqual(slip.customerName, 'فاطمة');
    assert.strictEqual(slip.recipientName, 'نورة');
    assert.strictEqual(slip.items.length, 2);
    // 2 * 200 + 20 + 150 = 570 subtotal + 25 delivery = 595
    assert.strictEqual(slip.subtotal, 570);
    assert.strictEqual(slip.totalAmount, 595);
  });

  it('should map dashboard sales transaction to unique order slip', () => {
    const tx = {
      id: 'ORD-8488',
      orderNumber: 8488,
      customerName: 'هند الدوسري',
      customerPhone: '0547781290',
      productTitleAr: 'سلة استقبال المواليد الملكية',
      price: 340,
      date: '2026-11-08',
    };

    const slip = createOrderSlipFromTransaction(tx, 'ar');

    assert.strictEqual(slip.orderId, 'FLW-8488');
    assert.strictEqual(slip.customerName, 'هند الدوسري');
    assert.strictEqual(slip.bouquet.titleAr, 'سلة استقبال المواليد الملكية');
    assert.strictEqual(slip.subtotal, 340);
  });
});

/**
 * Helper to build dynamic, normalized Order Slip data for FloristOrderSlipModal
 * Ensures every placed order or selected transaction generates its own unique
 * invoice data instead of falling back to static mock data.
 */

let orderCounter = 8500;

export function generateUniqueOrderId(prefix = 'FLW') {
  orderCounter += 1;
  const randSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${orderCounter % 9000 + 1000}`;
}

export function formatDateTime(lang = 'ar') {
  const isAr = lang === 'ar';
  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US');
  const timeStr = new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} • ${timeStr}`;
}

/**
 * Normalizes a single configured product item into an Order Slip object
 */
export function createOrderSlipFromSingleItem(item, lang = 'ar') {
  const isAr = lang === 'ar';
  const orderId = generateUniqueOrderId('FLW');
  const handover = item?.handover || {};
  const isPickup = handover.type === 'pickup';

  const bouquetTitleAr = item.nameAr || item.titleAr || (isAr ? 'باقة زهور دار الورد' : 'Atelier Flower Bouquet');
  const bouquetTitleEn = item.nameEn || item.titleEn || 'Atelier Flower Bouquet';
  const unitPrice = Number(item.price || item.totalPrice || item.basePrice || 0);
  const qty = Number(item.quantity || 1);
  const addons = Array.isArray(item.addons) ? item.addons : [];
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const subtotal = (unitPrice * qty) + addonsTotal;
  const deliveryFee = isPickup ? 0 : 25;
  const totalAmount = subtotal + deliveryFee;

  const bouquet = {
    titleAr: bouquetTitleAr,
    titleEn: bouquetTitleEn,
    image: item.image || item.imageUrl || './images/products/royal-red-roses.jpg',
    price: unitPrice * qty,
    stemCount: item.stemCount || 24,
    recipe: item.flowerType || item.recipe || (isAr ? 'أزهار طبيعية فاخرة مختارة بعناية' : 'Curated premium fresh blooms'),
    wrapTweak: item.modificationNote || (isAr ? 'تغليف دار الورد الفاخر' : 'Luxury Atelier wrap'),
    ribbonText: item.ribbonText || (isAr ? 'إهداء فاخر' : 'Luxury Gift'),
  };

  const greetingCard = {
    to: handover.recipientName || (isAr ? 'المستلم الكريم' : 'Dear Recipient'),
    from: handover.customerName || (isAr ? 'المرسل' : 'Sender'),
    message: item.giftCardMessage || (isAr ? 'مع أطيب التمنيات وأجمل باقات الورد 🌸' : 'Best wishes and warmest regards 🌸'),
    songTitle: item.songTitle || (isAr ? 'لحن الإهداء الخاص' : 'Special Dedication Melody'),
  };

  return {
    orderId,
    date: formatDateTime(lang),
    prepTimeLeft: isAr ? 'متبقي ١٥ دقيقة' : '15 mins left',
    customerName: handover.customerName || (isAr ? 'عميل المتجر' : 'Store Customer'),
    customerPhone: handover.customerPhone || '+966 50 000 0000',
    recipientName: handover.recipientName || (isPickup ? (isAr ? 'استلام شخصي' : 'Personal Pickup') : (isAr ? 'مستلم الهدية' : 'Gift Recipient')),
    recipientPhone: handover.recipientPhone || handover.customerPhone || '',
    district: handover.deliveryDistrict || handover.district || (isPickup ? (isAr ? 'معرض المتجر' : 'Boutique Store') : (isAr ? 'الرياض' : 'Riyadh')),
    addressDetails: handover.deliveryAddress || handover.address || (isPickup ? (isAr ? 'استلام مباشر من الفرع' : 'Direct Branch Pickup') : ''),
    deliveryType: isPickup ? (isAr ? 'استلام من الفرع' : 'Store Pickup') : (isAr ? 'إهداء ومفاجأة (سيارة مبردة خاصة)' : 'Surprise Gift Delivery (Chilled Van)'),
    deliveryWindow: handover.timing || (isAr ? 'الليلة (توصيل فوري)' : 'Tonight (Express Delivery)'),
    paymentMethod: 'Apple Pay / Mada',
    subtotal,
    deliveryFee,
    totalAmount,
    bouquet,
    addons,
    items: [
      {
        titleAr: bouquetTitleAr,
        titleEn: bouquetTitleEn,
        price: unitPrice,
        quantity: qty,
        recipe: bouquet.recipe,
        wrapTweak: bouquet.wrapTweak,
        ribbonText: bouquet.ribbonText,
        addons,
      },
    ],
    greetingCard,
  };
}

/**
 * Normalizes multiple cart / bag items into an Order Slip object
 */
export function createOrderSlipFromBag(bagItems = [], handoverData = {}, lang = 'ar') {
  const isAr = lang === 'ar';
  const orderId = generateUniqueOrderId('FLW');
  const handover = handoverData || {};
  const isPickup = handover.type === 'pickup';

  let subtotal = 0;
  const allAddons = [];
  const normalizedItems = bagItems.map((item) => {
    const unitPrice = Number(item.price || item.totalPrice || item.basePrice || 0);
    const qty = Number(item.quantity || 1);
    const itemAddons = Array.isArray(item.addons) ? item.addons : [];
    const itemAddonsTotal = itemAddons.reduce((acc, a) => acc + (Number(a.price) || 0), 0);
    subtotal += (unitPrice * qty) + itemAddonsTotal;
    allAddons.push(...itemAddons);

    return {
      titleAr: item.nameAr || item.titleAr || (isAr ? 'تنسيق أزهار' : 'Floral Arrangement'),
      titleEn: item.nameEn || item.titleEn || 'Floral Arrangement',
      price: unitPrice,
      quantity: qty,
      recipe: item.flowerType || item.recipe || '',
      wrapTweak: item.modificationNote || (isAr ? 'تغليف المتجر المعتمد' : 'Standard Wrap'),
      ribbonText: item.ribbonText || '',
      addons: itemAddons,
    };
  });

  const deliveryFee = isPickup ? 0 : 25;
  const totalAmount = subtotal + deliveryFee;

  const firstItem = bagItems[0] || {};
  const bouquet = {
    titleAr: normalizedItems[0]?.titleAr || (isAr ? 'طلب سلة المشتريات' : 'Cart Order'),
    titleEn: normalizedItems[0]?.titleEn || 'Cart Order',
    image: firstItem.image || firstItem.imageUrl || './images/products/royal-red-roses.jpg',
    price: normalizedItems[0]?.price || subtotal,
    stemCount: firstItem.stemCount || 24,
    recipe: normalizedItems[0]?.recipe || (isAr ? 'مجموعة باقات وأزهار طبيعية' : 'Selected floral arrangements'),
    wrapTweak: normalizedItems[0]?.wrapTweak || (isAr ? 'تغليف دار الورد الفاخر' : 'Luxury wrap'),
    ribbonText: normalizedItems[0]?.ribbonText || '',
  };

  const cardMessage = firstItem.giftCardMessage || handover.giftCardMessage || (isAr ? 'مع أطيب الأمنيات وأجمل الورود 🌸' : 'Best wishes 🌸');

  return {
    orderId,
    date: formatDateTime(lang),
    prepTimeLeft: isAr ? 'متبقي ٢٠ دقيقة' : '20 mins left',
    customerName: handover.customerName || (isAr ? 'عميل السلة' : 'Cart Customer'),
    customerPhone: handover.customerPhone || '+966 50 000 0000',
    recipientName: handover.recipientName || (isPickup ? (isAr ? 'استلام شخصي' : 'Personal Pickup') : (isAr ? 'مستلم الهدية' : 'Gift Recipient')),
    recipientPhone: handover.recipientPhone || handover.customerPhone || '',
    district: handover.deliveryDistrict || handover.district || (isPickup ? (isAr ? 'معرض المتجر' : 'Boutique Store') : (isAr ? 'الرياض' : 'Riyadh')),
    addressDetails: handover.deliveryAddress || handover.address || '',
    deliveryType: isPickup ? (isAr ? 'استلام من الفرع' : 'Store Pickup') : (isAr ? 'توصيل مبرد متعدد الأصناف' : 'Multi-Item Chilled Delivery'),
    deliveryWindow: handover.timing || (isAr ? 'خلال ساعتين' : 'Within 2 hours'),
    paymentMethod: 'Apple Pay / Mada',
    subtotal,
    deliveryFee,
    totalAmount,
    bouquet,
    addons: allAddons,
    items: normalizedItems,
    greetingCard: {
      to: handover.recipientName || (isAr ? 'المستلم الكريم' : 'Recipient'),
      from: handover.customerName || (isAr ? 'المرسل' : 'Sender'),
      message: cardMessage,
      songTitle: firstItem.songTitle || (isAr ? 'لحن الإهداء الخاص' : 'Special Dedication Melody'),
    },
  };
}

/**
 * Normalizes a custom order submitted from CustomOrderDrawer
 */
export function createOrderSlipFromCustomOrder(customOrderData = {}, handoverData = {}, lang = 'ar') {
  const isAr = lang === 'ar';
  const orderId = generateUniqueOrderId('FLW-CUST');
  const handover = handoverData || {};
  const isPickup = handover.type === 'pickup';
  const budget = Number(customOrderData.budget) || 350;
  const deliveryFee = isPickup ? 0 : 25;
  const totalAmount = budget + deliveryFee;

  const bouquet = {
    titleAr: `${isAr ? 'طلب تنسيق خاص' : 'Bespoke Order'}: ${customOrderData.modeTitle || (isAr ? 'حسب الطلب' : 'Custom')}`,
    titleEn: `Custom Order: ${customOrderData.modeTitle || 'Bespoke'}`,
    image: customOrderData.photoUrl || './images/inspiration/inspiration-french-garden.jpg',
    price: budget,
    stemCount: 30,
    recipe: `${isAr ? 'الطابع واللون المطلوب:' : 'Desired Vibe:'} ${customOrderData.colorVibe || (isAr ? 'فاخر ومتناسق' : 'Luxury Harmonies')}${customOrderData.notes ? ' • ' + customOrderData.notes : ''}`,
    wrapTweak: isAr ? 'تنسيق يدوي خاص ومميز' : 'Handcrafted custom arrangement',
    ribbonText: handover.recipientName ? `${isAr ? 'إهداء إلى' : 'To:'} ${handover.recipientName}` : '',
  };

  return {
    orderId,
    date: formatDateTime(lang),
    prepTimeLeft: isAr ? 'متبقي ٣٠ دقيقة' : '30 mins left',
    customerName: handover.customerName || (isAr ? 'عميل التصميم الخاص' : 'Bespoke Client'),
    customerPhone: handover.customerPhone || '+966 50 000 0000',
    recipientName: handover.recipientName || (isPickup ? (isAr ? 'استلام شخصي' : 'Personal Pickup') : (isAr ? 'مستلم الهدية' : 'Gift Recipient')),
    recipientPhone: handover.recipientPhone || handover.customerPhone || '',
    district: handover.address || handover.deliveryDistrict || (isPickup ? (isAr ? 'معرض المتجر' : 'Boutique Store') : (isAr ? 'الرياض' : 'Riyadh')),
    addressDetails: handover.address || '',
    deliveryType: isPickup ? (isAr ? 'استلام من الفرع' : 'Store Pickup') : (isAr ? 'توصيل مبرد لتنسيق خاص' : 'Special Chilled Delivery'),
    deliveryWindow: handover.pickupTime || (isAr ? 'الليلة' : 'Tonight'),
    paymentMethod: 'Apple Pay / Mada',
    subtotal: budget,
    deliveryFee,
    totalAmount,
    bouquet,
    addons: [],
    items: [
      {
        titleAr: bouquet.titleAr,
        titleEn: bouquet.titleEn,
        price: budget,
        quantity: 1,
        recipe: bouquet.recipe,
        wrapTweak: bouquet.wrapTweak,
        ribbonText: bouquet.ribbonText,
        addons: [],
      },
    ],
    greetingCard: {
      to: handover.recipientName || (isAr ? 'المستلم الكريم' : 'Recipient'),
      from: handover.customerName || (isAr ? 'المرسل' : 'Sender'),
      message: handover.giftCardMessage || (isAr ? 'تنسيق أزهار خاص صُنع بشغف ليعبر عن أجمل المشاعر 🤍' : 'Handcrafted floral art created with passion 🤍'),
      songTitle: isAr ? 'موسيقى كلاسيكية هادئة' : 'Classical Ambience',
    },
  };
}

/**
 * Normalizes an administrative Sales transaction into an Order Slip object
 */
export function createOrderSlipFromTransaction(tx = {}, lang = 'ar') {
  const isAr = lang === 'ar';
  const orderId = tx.id ? (tx.id.startsWith('FLW-') ? tx.id : tx.id.replace('ORD-', 'FLW-')) : generateUniqueOrderId('FLW');
  const price = Number(tx.price || tx.total || 350);
  const deliveryFee = 25;
  const totalAmount = price + deliveryFee;

  const bouquet = {
    titleAr: tx.productTitleAr || (isAr ? 'باقة أزهار فاخرة' : 'Luxury Flower Bouquet'),
    titleEn: tx.productTitleEn || 'Luxury Flower Bouquet',
    image: tx.productImage || './images/products/royal-red-roses.jpg',
    price,
    stemCount: tx.stemCount || 25,
    recipe: tx.flowerType || (isAr ? 'تشكيلة أزهار طبيعية فاخرة' : 'Curated premium fresh blooms'),
    wrapTweak: isAr ? 'تغليف فاخر مع شريط ساتان' : 'Luxury wrap with satin ribbon',
    ribbonText: tx.ribbonText || (isAr ? 'أجمل التهاني والتبريكات' : 'Congratulations'),
  };

  return {
    orderId,
    date: tx.date ? `${tx.date} • ${new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : formatDateTime(lang),
    prepTimeLeft: isAr ? 'جاهز للتسليم' : 'Ready for handover',
    customerName: tx.customerName || (isAr ? 'عميل المسجل' : 'Registered Customer'),
    customerPhone: tx.customerPhone || '+966 50 111 2233',
    recipientName: tx.recipientName || tx.customerName || (isAr ? 'المستلم' : 'Recipient'),
    recipientPhone: tx.recipientPhone || tx.customerPhone || '',
    district: tx.district || (isAr ? 'شمال الرياض' : 'North Riyadh'),
    addressDetails: tx.addressDetails || (isAr ? 'توصيل مبرد مباشر' : 'Direct Chilled Delivery'),
    deliveryType: isAr ? 'إهداء ومفاجأة (سيارة مبردة خاصة)' : 'Surprise Gift Delivery (Chilled Van)',
    deliveryWindow: tx.deliveryWindow || (isAr ? 'تم الجدولة' : 'Scheduled'),
    paymentMethod: tx.paymentMethod || 'Apple Pay (مدفوع إلكترونياً)',
    subtotal: price,
    deliveryFee,
    totalAmount,
    bouquet,
    addons: Array.isArray(tx.addons) ? tx.addons : [],
    items: [
      {
        titleAr: bouquet.titleAr,
        titleEn: bouquet.titleEn,
        price,
        quantity: 1,
        recipe: bouquet.recipe,
        wrapTweak: bouquet.wrapTweak,
        ribbonText: bouquet.ribbonText,
        addons: Array.isArray(tx.addons) ? tx.addons : [],
      },
    ],
    greetingCard: {
      to: tx.recipientName || tx.customerName || (isAr ? 'المستلم' : 'Recipient'),
      from: tx.customerName || (isAr ? 'المرسل' : 'Sender'),
      message: tx.cardMessage || (isAr ? 'أجمل باقات الورد والتبريكات العطرة 🤍' : 'Warmest congratulations and best wishes 🤍'),
      songTitle: isAr ? 'لحن الإهداء الخاص' : 'Special Dedication Melody',
    },
  };
}

/**
 * Persists an order slip to Cashier POS Invoices in localStorage
 */
export function saveOrderToCashierInvoices(slipData) {
  if (!slipData || !slipData.orderId) return;
  try {
    localStorage.setItem('flowerhub_last_order', JSON.stringify(slipData));
    const raw = localStorage.getItem('flowerhub_cashier_invoices');
    let invoices = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(invoices)) invoices = [];
    const filtered = invoices.filter((inv) => inv.orderId !== slipData.orderId);
    invoices = [{ ...slipData, status: slipData.status || 'in_prep' }, ...filtered];
    localStorage.setItem('flowerhub_cashier_invoices', JSON.stringify(invoices));
  } catch (e) {
    console.warn('Could not save cashier invoice', e);
  }
}

/**
 * Retrieves all Cashier POS Invoices, seeded with realistic boutique orders if empty
 */
export function getCashierInvoices(lang = 'ar') {
  const isAr = lang === 'ar';
  try {
    const raw = localStorage.getItem('flowerhub_cashier_invoices');
    let invoices = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(invoices) || invoices.length === 0) {
      invoices = [
        {
          orderId: 'FL-9501',
          date: formatDateTime(lang),
          status: 'in_prep',
          customerName: isAr ? 'سارة المنصور' : 'Sarah Al-Mansoor',
          customerPhone: '+966 54 888 7766',
          recipientName: isAr ? 'نورة عبدالله' : 'Noura Abdullah',
          recipientPhone: '+966 50 123 4567',
          district: isAr ? 'حي النرجس، شمال الرياض' : 'Al-Narjis Dist., North Riyadh',
          addressDetails: isAr ? 'فيلا 14، شارع وادي الساحل' : 'Villa 14, Wadi Al-Sahel St.',
          deliveryType: isAr ? 'إهداء ومفاجأة (سيارة مبردة خاصة)' : 'Surprise Gift Delivery',
          deliveryWindow: isAr ? 'الليلة (قبل ٩:٠٠ م)' : 'Tonight (Before 9:00 PM)',
          paymentMethod: isAr ? 'تأكيد مباشر عبر واتساب (كاشير)' : 'Direct WhatsApp / Cashier',
          subtotal: 450,
          deliveryFee: 0,
          totalAmount: 450,
          bouquet: {
            titleAr: 'فازة الجوري الأحمر الفاخرة',
            titleEn: 'Luxury Red Rose Vase',
            price: 450,
            image: './images/products/royal-red-roses.jpg',
            recipe: isAr ? 'جوري أحمر هولندي فاخر، كالبتوس مجفف' : 'Dutch Red Roses, Dried Eucalyptus',
            wrapTweak: isAr ? 'فازة سيراميك ملكية مطفية' : 'Matte Obsidian Ceramic Vase',
            ribbonText: isAr ? 'مبارك المولود الجديد' : 'Congratulations',
          },
          items: [
            {
              titleAr: 'فازة الجوري الأحمر الفاخرة',
              titleEn: 'Luxury Red Rose Vase',
              price: 450,
              quantity: 1,
              recipe: isAr ? 'جوري أحمر هولندي فاخر' : 'Dutch Red Roses',
              wrapTweak: isAr ? 'فازة سيراميك ملكية' : 'Ceramic Vase',
              ribbonText: '',
              addons: [],
            },
          ],
          greetingCard: {
            to: isAr ? 'نورة' : 'Noura',
            from: isAr ? 'سارة' : 'Sarah',
            message: isAr ? 'ألف مبارك المولود الجديد جعله الله من مواليد السعادة 🤍' : 'Congratulations on the new baby 🤍',
            songTitle: isAr ? 'أغنية التهنئة' : 'Celebration Track',
          },
        },
        {
          orderId: 'FLW-8492',
          date: formatDateTime(lang),
          status: 'ready',
          customerName: isAr ? 'فهد العبدالله' : 'Fahad Al-Abdullah',
          customerPhone: '+966 50 111 2233',
          recipientName: isAr ? 'د. ريم بنت عبدالعزيز' : 'Dr. Reem Al-Aziz',
          recipientPhone: '+966 55 123 4567',
          district: isAr ? 'حي الصحافة، شمال الرياض' : 'Al-Sahafa Dist., North Riyadh',
          addressDetails: isAr ? 'برج النخبة - الطابق الرابع' : 'Elite Tower - 4th Flr',
          deliveryType: isAr ? 'إهداء ومفاجأة (سيارة مبردة خاصة)' : 'Surprise Gift Delivery',
          deliveryWindow: isAr ? 'الليلة (قبل ٩:٣٠ م)' : 'Tonight (Before 9:30 PM)',
          paymentMethod: isAr ? 'مدفوع إلكترونياً (Apple Pay)' : 'Apple Pay',
          subtotal: 405,
          deliveryFee: 25,
          totalAmount: 430,
          bouquet: {
            titleAr: 'بوكيه كولكشن الروز المخملي الملكي',
            titleEn: 'Royal Velvet Red Rose Bouquet',
            price: 245,
            image: './images/products/royal-red-roses.jpg',
            recipe: isAr ? '٣٥ غصن جوري كيني أحمر مخملي' : '35 Kenyan Grand Prix Red Roses',
            wrapTweak: isAr ? 'ورق كريب أسود مطفي فاخر' : 'Matte obsidian paper',
            ribbonText: isAr ? 'ألف مبروك التخرج د. ريم' : 'Congratulations Dr. Reem',
          },
          items: [
            {
              titleAr: 'بوكيه كولكشن الروز المخملي الملكي',
              titleEn: 'Royal Velvet Red Rose Bouquet',
              price: 245,
              quantity: 1,
              recipe: isAr ? '٣٥ غصن جوري كيني' : '35 Kenyan Roses',
              wrapTweak: isAr ? 'ورق كريب أسود' : 'Black Crepe Paper',
              ribbonText: '',
              addons: [],
            },
          ],
          greetingCard: {
            to: isAr ? 'دكتورة ريم' : 'Dr. Reem',
            from: isAr ? 'فهد العبدالله' : 'Fahad Al-Abdullah',
            message: isAr ? 'ألف ألف مبروك التخرج يا دكتورة ريم ومنها للأعلى يا رب 🤍' : 'Congratulations Dr. Reem 🤍',
            songTitle: isAr ? 'موسيقى التخرج الرسمية' : 'Graduation Theme',
          },
        },
      ];
      localStorage.setItem('flowerhub_cashier_invoices', JSON.stringify(invoices));
    }
    return invoices;
  } catch {
    return [];
  }
}

/**
 * Updates an invoice status in Cashier POS storage
 */
export function updateCashierInvoiceStatus(orderId, newStatus) {
  try {
    const raw = localStorage.getItem('flowerhub_cashier_invoices');
    let invoices = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(invoices)) return [];
    invoices = invoices.map((inv) =>
      inv.orderId === orderId ? { ...inv, status: newStatus } : inv
    );
    localStorage.setItem('flowerhub_cashier_invoices', JSON.stringify(invoices));
    return invoices;
  } catch (e) {
    console.warn('Could not update cashier invoice status', e);
    return [];
  }
}


# مواصفات تصميم وتوليد صور متجر دار الورد (Storefront Visual Assets Spec)

## 1. نظرة عامة والهدف (Overview & Objective)
تحديث وتوليد كامل صور متجر "دار الورد" (23 صورة) باستخدام نموذج توليد الصور فائق الدقة (Nano Banana / Google Imagen 3 Engine) بطابع بصري احترافي موحد يعكس هوية **الفخامة البوتيكية العصرية (Ultra-Luxury Boutique)** بما يتماشى مع ألوان وهوية الموقع (أوليف، بيج، رخام، ولمسات ذهبية).

## 2. استراتيجية التنفيذ وتوزيع الملفات (Execution Strategy)
* **المسار والأمان:** تم أخذ نسخة احتياطية لكامل الصور الحالية في المجلد `public/images_backup/` لضمان استرجاع أي ملف بضغطة زر.
* **الاستبدال المباشر:** استبدال الصور مباشرة في مساراتها الحالية داخل `public/images/` للمحافظة على توافق كافة الشاشات والكود وقواعد البيانات الوهمية (Mock Data).
* **معايير الجودة:**
  * إضاءة استوديو تصوير إعلاني احترافي (Hasselblad / Phase One 8K quality).
  * تفاصيل فائقة ونضارة للبتلات وقطرات الندى (Macro dew drops & velvety petal texture).
  * خلفيات محايدة ونظيفة وفاخرة (رخام طبيعي، خلفيات استوديو ناعمة بدرجات ترابية دافئة).

---

## 3. قائمة الصور والمواصفات الفنية (Asset Catalog & Prompts)

### أ. صور المنتجات الأساسية (Products - 9 صور)
1. **`public/images/products/royal-red-roses.jpg`**
   * *الوصف:* باقة الورد الجوري الأحمر الملكي (35 غصن جوري كيني مخملي، تغليف ورق أسود مطفي فاخر مع شريط ساتان وقطرات ندى).
2. **`public/images/products/blush-hydrangea-vase.jpg`**
   * *الوصف:* فازة زجاجية أسطوانية شفافة تحتوي على زهور هيدرانجيا هولندية بلش وردية ناعمة مع بيبي روز دراقي في إضاءة نهارية راقية.
3. **`public/images/products/eternal-amour-pedestal.jpg`**
   * *الوصف:* استاند وتنسيق هرمي فاخر من الورود الحمراء القانية وأوراق الكالبتوس الخضراء على قاعدة رخامية أنيقة.
4. **`public/images/products/acrylic-box-celebration.jpg`**
   * *الوصف:* بوكس أكريليك شفاف كريستالي فاخر مع درج يحتوي على شوكولاتة وورود باستيل ناعمة وجبسوفيليا.
5. **`public/images/products/graduation-stand-prestige.jpg`**
   * *الوصف:* استاند معدني ذهبي فاخر لتنسيق تخرج مع زنابق كازابلانكا بيضاء وورود هولندية صفراء وشريط إهداء راقي.
6. **`public/images/products/newborn-blossom-basket.jpg`**
   * *الوصف:* سلة خيزران حرفية منسوجة يدوياً بتنسيق مواليد ناعم (أزهار بلون أزرق بيبي وزهري باودر مع أشرطة حريرية).
7. **`public/images/products/sunflowers-spray-roses.jpg`**
   * *الوصف:* باقة إشراقة الصيف المبهجة التي تجمع بين أزهار عباد الشمس الذهبية والبيبي روز المشمشي بتغليف أنيق.
8. **`public/images/products/chocolates-floral-box.jpg`**
   * *الوصف:* صندوق هدايا مخملي فاخر مقسم بين تشكيلة ورود طبيعية فاخرة وحبات شوكولاتة بلجيكية فاخرة.
9. **`public/images/products/casablanca-orchid-vase.jpg`**
   * *الوصف:* فازة سيراميك ملكية بتنسيق زهور الأوركيد البيضاء المتدلية وزنابق الكازابلانكا الفواحة.

### ب. صور تصنيفات المناسبات (Occasions - 6 صور)
1. **`public/images/occasions/occasion-ready-today.jpg`**: تنسيق زهور طازجة وجاهزة للتوصيل الفوري في متجر زهور فاخر.
2. **`public/images/occasions/occasion-graduation.jpg`**: باقة تخرج فاخرة مع شريط ساتان مطرز وقبعة تخرج أنيقة.
3. **`public/images/occasions/occasion-birthday.jpg`**: باقة عيد ميلاد عصرية مع شموع عطرية ولمسات احتفالية راقية.
4. **`public/images/occasions/occasion-newborn.jpg`**: باقة استقبال مواليد هادئة وناعمة بدرجات الباستيل.
5. **`public/images/occasions/occasion-romance.jpg`**: بوكيه ورد أحمر رومانسي مع إضاءة خافتة شاعرية.
6. **`public/images/occasions/occasion-portfolio.jpg`**: لقطة واسعة لتنسيقات قاعات وحفلات ضخمة.

### ج. صور البورتفوليو والمشاريع الفاخرة (Portfolio - 4 صور)
1. **`public/images/portfolio/portfolio-royal-wedding.jpg`**: قاعة زفاف ملكية فخمة بأقواس ورود عملاقة وثريات كريستالية وتنسيقات طاولات ضخمة.
2. **`public/images/portfolio/portfolio-vip-suite.jpg`**: جناح ولادة VIP في مستشفى خاص راقٍ مع تنسيقات زهور طبيعية بيضاء وذهبية.
3. **`public/images/portfolio/portfolio-diplomatic-gala.jpg`**: حفل عشاء دبلوماسي فاخر مع طاولة ممتدة بتنسيق أزهار طولي وشمعدانات فضية.
4. **`public/images/portfolio/portfolio-graduation-stage.jpg`**: مسرح تخرج رسمي لجامعة كبرى مزين بأبراج زهور ضخمة ومضيئة.

### د. صور الإلهام والواجهة (Inspiration & Hero - 4 صور)
1. **`public/images/inspiration/inspiration-french-garden.jpg`**: تنسيق حر عضوي بطراز الحدائق الفرنسية الكلاسيكية.
2. **`public/images/inspiration/inspiration-perfume-tray.jpg`**: صينية رخامية أنيقة تجمع بين قوارير عطور عربية فاخرة وزهور طبيعية.
3. **`public/images/inspiration/inspiration-minimal-orchid.jpg`**: نبتة أوركيد مينيمال أحادية الساق في وعاء حجري عصري.
4. **`public/images/hero/hero-atelier-banner.jpg`**: لقطة بانورامية واسعة لأتيليه ومحل زهور "دار الورد" الراقي مع ثلاجة العرض المضيئة وطاولة التنسيق الرخامية.

---

## 4. التحقق واختبار الجودة (Verification & Acceptance)
- التأكد من حفظ جميع الصور الـ 23 في مساراتها الصحيحة ومطابقتها للمتطلبات البصرية.
- التأكد من تحميل كافة الصور في المتجر وسلاسة ظهورها في كافة المكونات.
- الحفاظ على كفاءة الأداء وسرعة التحميل.

import React from 'react';
import { MapPin, Phone, Star, MessageCircle } from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import DarAlwardAnimatedTitle from './DarAlwardAnimatedTitle';
import { useStoreTheme } from '../context/StoreThemeContext';
import { BreathingText } from './fancy/breathing-text';
import { SoapBubbleSearch, SoapBubbleIconButton } from './soap-bubble';

// Clean stroke Instagram Icon
function InstagramIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ShopHeader({
  heroStyle = 'qlub',
  lang = 'ar',
  shopConfig,
  themeTokens = THEME_TOKENS.botanical,
  botanicalBrandConfig,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  let storeThemeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeThemeCtx = useStoreTheme();
  } catch {
    // fallback
  }

  const rawStudio = storeThemeCtx?.rawConfig || storeThemeCtx?.config;
  const brand = storeThemeCtx?.config?.brand;
  const colors = storeThemeCtx?.config?.colors;

  const shopName =
    rawStudio?.storeName ||
    brand?.storeName ||
    brand?.name ||
    (isAr
      ? shopConfig?.shopNameAr || 'دار الورد للمناسبات'
      : shopConfig?.shopNameEn || 'Dar Alward Florist');

  const shopTagline =
    rawStudio?.storeSubtitle ||
    brand?.subtitle ||
    (isAr
      ? shopConfig?.taglineAr || 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب'
      : shopConfig?.taglineEn || strings.shopTagline);

  const statusText = rawStudio?.statusText || brand?.statusText || (isAr ? strings.statusOpen : 'Open Now');
  const statusPulse = rawStudio?.statusPulse !== undefined ? rawStudio.statusPulse : (brand?.statusPulse !== false);
  const ratingText = rawStudio?.rating || brand?.rating || '٤.٩ (٨٥٠+ تقييم)';
  const avatarText = rawStudio?.avatarText || brand?.avatarText || 'د.و';
  const avatarUrl = brand?.avatarUrl;
  const locationLabel = rawStudio?.locationLabel || brand?.locationLabel || strings.location;
  const locationUrl = brand?.locationUrl || 'https://maps.google.com';
  const instagramLabel = brand?.instagramLabel || strings.instagram;
  const instagramUrl = brand?.instagramUrl || 'https://instagram.com';
  const phone = rawStudio?.phone || brand?.phone || shopConfig?.phone || '966500000000';
  const callLabel = brand?.callLabel || strings.callUs;

  const effectiveBotanicalConfig = {
    ...(botanicalBrandConfig || {}),
    ...(brand?.botanical || {}),
    text: shopName,
    paletteId: rawStudio?.botanicalPalette || brand?.botanical?.paletteId || colors?.paletteId || 'royalBurgundy',
    motionMode: rawStudio?.botanicalMotion || brand?.botanical?.motionMode || 'gust',
    density: rawStudio?.botanicalDensity || brand?.botanical?.density || 'balanced',
    seed: rawStudio?.botanicalSeed || brand?.botanical?.seed || 48271,
    bloomSize: rawStudio?.bloomSize || brand?.botanical?.bloomSize || 52,
    stemThickness: rawStudio?.stemThickness || brand?.botanical?.stemThickness || 1.8,
    botanicalEnabled: rawStudio?.botanicalEnabled !== undefined ? rawStudio.botanicalEnabled : (brand?.botanical?.enabled !== false),
  };

  // Render status badge helper with BreathingText
  const renderStatusBadge = (isDark = themeTokens.isDark) => {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
          isDark
            ? 'bg-white/15 text-white backdrop-blur-md border border-white/20'
            : 'bg-emerald-50/90 text-emerald-900 border border-emerald-200/60 shadow-xs'
        }`}
      >
        {statusPulse && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        )}
        <BreathingText
          fromFontVariationSettings="'wght' 400"
          toFontVariationSettings="'wght' 650"
          staggerFrom="center"
          duration={2.2}
          className="font-medium tracking-normal"
        >
          {isAr ? 'مفتوح الآن • تجهيز فوري' : statusText}
        </BreathingText>
      </span>
    );
  };

  // Soap Bubble Morning Dew Action Bar
  const renderSoapBubbleActionBar = (isDark = themeTokens.isDark) => {
    return (
      <div className="w-full flex items-center gap-2 pt-2.5">
        <div className="flex-1 min-w-0">
          <SoapBubbleSearch
            placeholder={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
            aria-label={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
            iridescence={isDark ? 0.6 : 0.35}
            glass={0.92}
            className="w-full"
          />
        </div>
        <SoapBubbleIconButton
          aria-label={isAr ? 'المفضلة' : 'Wishlist'}
          className="text-sm shrink-0"
          title={isAr ? 'المفضلة' : 'Wishlist'}
          iridescence={isDark ? 0.7 : 0.4}
        >
          🤍
        </SoapBubbleIconButton>
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noreferrer"
          aria-label={isAr ? 'واتساب' : 'WhatsApp'}
          className="inline-flex"
        >
          <SoapBubbleIconButton
            aria-label={isAr ? 'واتساب' : 'WhatsApp'}
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
            title={isAr ? 'واتساب' : 'WhatsApp'}
            iridescence={isDark ? 0.7 : 0.4}
          >
            <MessageCircle className="w-4 h-4" />
          </SoapBubbleIconButton>
        </a>
        <a href={`tel:+${phone}`} aria-label={callLabel} className="inline-flex">
          <SoapBubbleIconButton
            aria-label={callLabel}
            className="shrink-0 text-stone-800 dark:text-stone-200"
            title={callLabel}
            iridescence={isDark ? 0.7 : 0.4}
          >
            <Phone className="w-4 h-4" />
          </SoapBubbleIconButton>
        </a>
      </div>
    );
  };

  // =========================================================
  // 1. QLUB COMPACT CARD STYLE (Floating rounded card with side logo)
  // =========================================================
  if (heroStyle === 'qlub' || heroStyle === 'qlub_card') {
    return (
      <header className="px-4 pt-4 pb-2 w-full transition-colors duration-300">
        <div
          className="p-4 sm:p-5 shadow-xs flex flex-col gap-3 transition-all duration-300"
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            borderRadius: 'var(--radius-unit, 16px)',
            border: '1px solid var(--border-subtle, #E7E5E4)',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-start gap-3.5">
            {/* Elegant Monogram Avatar */}
            <div
              className="w-14 h-14 overflow-hidden shrink-0 flex items-center justify-center font-serif text-xl font-bold tracking-wider text-white shadow-xs transition-all duration-300"
              style={{
                backgroundColor: 'var(--accent-primary, #022C22)',
                borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={shopName} className="w-full h-full object-cover" />
              ) : (
                avatarText
              )}
            </div>

            {/* Shop Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {renderStatusBadge()}

                <div
                  className="flex items-center gap-1 text-[11px] font-semibold ms-auto"
                  style={{ color: 'var(--text-main, #1C1917)' }}
                >
                  <Star
                    className="w-3.5 h-3.5 fill-[var(--accent-gold,#D4AF37)] text-[var(--accent-gold,#D4AF37)]"
                  />
                  <span>{ratingText}</span>
                </div>
              </div>

              {isAr ? (
                <div className="w-full my-0.5">
                  <DarAlwardAnimatedTitle
                    config={effectiveBotanicalConfig}
                    text={shopName}
                    textColor="var(--text-main, #1C1917)"
                  />
                </div>
              ) : (
                <h1
                  className="text-lg sm:text-xl font-bold tracking-tight truncate transition-colors duration-300"
                  style={{ color: 'var(--text-main, #1C1917)' }}
                >
                  {shopName}
                </h1>
              )}

              <p
                className="text-xs mt-0.5 line-clamp-1 transition-colors duration-300"
                style={{ color: 'var(--text-muted, #78716C)' }}
              >
                {shopTagline}
              </p>

              <div
                className="flex items-center gap-1 text-xs mt-1 transition-colors duration-300"
                style={{ color: 'var(--text-muted, #78716C)' }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{locationLabel}</span>
              </div>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <a
              href={locationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border hover:opacity-85 transition-all font-medium"
              style={{
                backgroundColor: 'var(--bg-canvas, #FAF8F5)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
                borderRadius: 'var(--radius-btn, 9999px)',
              }}
            >
              <MapPin className="w-3.5 h-3.5 opacity-80" />
              <span>{locationLabel}</span>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border hover:opacity-85 transition-all font-medium"
              style={{
                backgroundColor: 'var(--bg-canvas, #FAF8F5)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
                borderRadius: 'var(--radius-btn, 9999px)',
              }}
            >
              <InstagramIcon className="w-3.5 h-3.5 opacity-80" />
              <span>{instagramLabel}</span>
            </a>
            <a
              href={`tel:+${phone}`}
              className="flex-none flex items-center justify-center p-2 border hover:opacity-85 transition-all font-medium"
              style={{
                backgroundColor: 'var(--bg-canvas, #FAF8F5)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
                borderRadius: 'var(--radius-btn, 9999px)',
              }}
              title={callLabel}
            >
              <Phone className="w-4 h-4 opacity-80" />
            </a>
          </div>

          {/* Soap Bubble Morning Dew Action Bar */}
          {renderSoapBubbleActionBar(false)}
        </div>
      </header>
    );
  }

  // =========================================================
  // 2. EDITORIAL FULL-BLEED HERO COVER STYLE (Extended Floral Heritage)
  // =========================================================
  if (heroStyle === 'editorial') {
    return (
      <header className="relative w-full overflow-hidden mb-2 transition-colors duration-300">
        <div className="relative h-64 sm:h-72 w-full bg-stone-950">
          <img
            src="./images/hero/hero-atelier-banner.jpg"
            alt="Florist Atelier"
            className="w-full h-full object-cover object-center filter brightness-[0.65]"
          />
          {/* Multi-layered Gradient Overlay for High Editorial Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />

          {/* Content overlay */}
          <div className="absolute inset-0 px-4 sm:px-6 flex flex-col justify-end pb-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              {renderStatusBadge(true)}
              <div className="flex items-center gap-1 text-[11px] text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                <Star className="w-3.5 h-3.5 fill-[var(--accent-gold,#D4AF37)] text-[var(--accent-gold,#D4AF37)]" />
                <span className="font-bold">{ratingText}</span>
              </div>
            </div>

            {isAr ? (
              <div className="w-full max-w-sm -my-2">
                <DarAlwardAnimatedTitle
                  config={effectiveBotanicalConfig}
                  text={shopName}
                  isDark={true}
                  textColor="#FFFFFF"
                />
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold tracking-tight drop-shadow-md text-white">
                {shopName}
              </h1>
            )}

            <p className="text-xs sm:text-sm text-white/90 mt-1 line-clamp-1 drop-shadow-xs font-light">
              {shopTagline}
            </p>

            <div className="flex items-center justify-between gap-2 mt-3.5 pt-2.5 text-xs border-t border-white/20">
              <span className="flex items-center gap-1.5 text-white/85 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all text-[11px] font-semibold border border-white/25 flex items-center gap-1.5 shadow-xs"
                  style={{ borderRadius: 'var(--radius-btn, 9999px)' }}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{locationLabel}</span>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors border border-white/25 shadow-xs"
                  style={{ borderRadius: 'var(--radius-btn, 9999px)' }}
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`tel:+${phone}`}
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors border border-white/25 shadow-xs"
                  style={{ borderRadius: 'var(--radius-btn, 9999px)' }}
                  title={callLabel}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Soap Bubble Search & Actions */}
            <div className="pt-2">
              {renderSoapBubbleActionBar(true)}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // =========================================================
  // 3. MINIMAL CENTERED BOUTIQUE STYLE (Circular Double-Ring Logo)
  // =========================================================
  return (
    <header className="px-4 pt-5 pb-3 w-full text-center transition-colors duration-300">
      {/* Centered Circular Logo with Double Ring & Subtle Gold Touch */}
      <div className="relative inline-flex items-center justify-center mb-2.5">
        <div
          className="w-16 h-16 rounded-full p-1 flex items-center justify-center transition-all duration-300 shadow-xs"
          style={{
            border: '1.5px dashed var(--accent-gold, #D4AF37)',
            backgroundColor: 'transparent',
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-serif font-bold text-lg text-white shadow-xs transition-colors duration-300 overflow-hidden"
            style={{ backgroundColor: 'var(--accent-primary, #022C22)' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={shopName} className="w-full h-full object-cover" />
            ) : (
              avatarText
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs font-medium mb-1.5">
        {renderStatusBadge()}
        <div
          className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: 'var(--text-main, #1C1917)' }}
        >
          <Star className="w-3 h-3 fill-[var(--accent-gold,#D4AF37)] text-[var(--accent-gold,#D4AF37)]" />
          <span>{ratingText}</span>
          <span style={{ color: 'var(--text-muted, #78716C)' }}>(850+)</span>
        </div>
      </div>

      {isAr ? (
        <div className="w-full max-w-sm mx-auto -my-2">
          <DarAlwardAnimatedTitle
            config={effectiveBotanicalConfig}
            text={shopName}
            textColor="var(--text-main, #1C1917)"
          />
        </div>
      ) : (
        <h1
          className="text-2xl sm:text-3xl font-serif font-bold tracking-tight transition-colors duration-300"
          style={{ color: 'var(--text-main, #1C1917)' }}
        >
          {shopName}
        </h1>
      )}

      <p
        className="text-xs max-w-xs mx-auto mt-1 transition-colors duration-300 font-light"
        style={{ color: 'var(--text-muted, #78716C)' }}
      >
        {shopTagline}
      </p>

      {/* Clean Centered Ghost Action Pills */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs">
        <a
          href={locationUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 py-1.5 px-3 border transition-all font-medium text-[11px] hover:shadow-xs hover:opacity-80"
          style={{
            borderColor: 'var(--border-subtle, #E7E5E4)',
            color: 'var(--text-main, #1C1917)',
            backgroundColor: 'transparent',
            borderRadius: 'var(--radius-btn, 9999px)',
          }}
        >
          <MapPin className="w-3 h-3 opacity-80" />
          <span>{locationLabel}</span>
        </a>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 py-1.5 px-3 border transition-all font-medium text-[11px] hover:shadow-xs hover:opacity-80"
          style={{
            borderColor: 'var(--border-subtle, #E7E5E4)',
            color: 'var(--text-main, #1C1917)',
            backgroundColor: 'transparent',
            borderRadius: 'var(--radius-btn, 9999px)',
          }}
        >
          <InstagramIcon className="w-3.5 h-3.5 opacity-80" />
          <span>{instagramLabel}</span>
        </a>
        <a
          href={`tel:+${phone}`}
          className="flex items-center justify-center p-2 border transition-all font-medium text-[11px] hover:shadow-xs hover:opacity-80"
          style={{
            borderColor: 'var(--border-subtle, #E7E5E4)',
            color: 'var(--text-main, #1C1917)',
            backgroundColor: 'transparent',
            borderRadius: 'var(--radius-btn, 9999px)',
          }}
          title={callLabel}
        >
          <Phone className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Soap Bubble Morning Dew Action Bar */}
      <div className="max-w-md mx-auto pt-2">
        {renderSoapBubbleActionBar(false)}
      </div>
    </header>
  );
}

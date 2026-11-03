import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  CheckCheck,
  Sparkles,
  FileText,
} from 'lucide-react';
import { t } from '../utils/translations';

export default function WhatsAppPreviewModal({
  isOpen,
  onClose,
  messageText,
  lang,
  onOpenOrderSlip,
}) {
  const [copied, setCopied] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const isAr = lang === 'ar';
  const strings = t[lang] || t.ar;

  const [formattedTime] = useState(() =>
    new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    // Saudi shop WhatsApp phone number: +966500000000
    const phoneNumber = '966500000000';
    const encodedText = encodeURIComponent(messageText);
    const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleSimulateReply = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setShowReply(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* WhatsApp Window Card */}
      <div className="relative z-10 w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-[#EFEAE2] dark:bg-[#0B141A] text-neutral-900 dark:text-neutral-100 max-h-[92vh] border border-neutral-700">
        {/* 1. Official WhatsApp Top Green Bar */}
        <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            {/* Florist Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-white/40 flex items-center justify-center text-sm font-serif font-bold text-white shadow-xs">
                M
              </div>
              <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075E54]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide">
                  {strings.verifiedFlorist}
                </span>
                <span className="w-4 h-4 rounded-full bg-emerald-400 text-[#075E54] text-[10px] font-bold flex items-center justify-center">
                  ✓
                </span>
              </div>
              <span className="text-[11px] text-emerald-200 block">
                {isTyping
                  ? isAr
                    ? 'جاري الكتابة الآن...'
                    : 'typing...'
                  : strings.onlineNow}
              </span>
            </div>
          </div>

          {/* Right WhatsApp Icons */}
          <div className="flex items-center gap-3 text-white/80">
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-full hover:bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Chat Canvas with Chat Wallpaper */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#0000000d_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] bg-[size:16px_16px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Security notice pill */}
          <div className="flex justify-center">
            <span className="text-[10px] bg-stone-200/90 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-lg text-center shadow-xs max-w-xs">
              {isAr ? 'الرسائل مشفرة بينك وبين منسق المحل' : 'Messages are end-to-end encrypted'}
            </span>
          </div>

          {/* Customer's outgoing formatted ticket bubble */}
          <div className="flex justify-end">
            <div className="max-w-[88%] sm:max-w-[82%] rounded-2xl rounded-tr-xs p-3.5 shadow-md bg-[#E7FFDB] text-stone-950 text-xs sm:text-[13px] leading-relaxed border border-emerald-300/70 whitespace-pre-wrap font-sans font-medium">
              {messageText}

              {/* Timestamp & Double Blue Checkmarks */}
              <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-stone-600">
                <span>{formattedTime}</span>
                <CheckCheck className="w-4 h-4 text-sky-500 inline" />
              </div>
            </div>
          </div>

          {/* Florist interactive reply bubble */}
          {showReply && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[88%] sm:max-w-[82%] rounded-2xl rounded-tl-xs p-3.5 shadow-md bg-white dark:bg-[#202C33] text-neutral-900 dark:text-neutral-50 text-xs sm:text-[13px] leading-relaxed border border-neutral-200 dark:border-neutral-700">
                <p className="font-medium">{strings.floristReplyMsg}</p>
                <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-neutral-400">
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Action Buttons Footer */}
        <div className="p-3.5 bg-white dark:bg-[#1F2C34] border-t border-neutral-200 dark:border-neutral-800 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-750 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 text-neutral-700 dark:text-neutral-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{strings.copyTicket}</span>
                </>
              )}
            </button>

            {/* Simulate Florist Reply */}
            <button
              type="button"
              onClick={handleSimulateReply}
              className="py-2.5 px-3 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-300 dark:border-amber-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{strings.simulateReply}</span>
            </button>
          </div>

          {/* Launch Real WhatsApp (wa.me) */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>{strings.openWhatsAppDirect}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Quick Order Slip & Printable Gift Card Access */}
          {onOpenOrderSlip && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrderSlip();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              <span>
                {isAr
                  ? 'عرض تذكرة العمل وبطاقة الإهداء #FLW-8492'
                  : 'View Florist Slip & Printable Card #FLW-8492'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  RotateCcw,
  Receipt,
  X,
  MessageCircle,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  INITIAL_SALES_TRANSACTIONS,
  ANALYTICS_TIMELINES,
  formatCurrency,
} from '../data/mockSalesData';

/**
 * Ultra-Lightweight Interactive SVG Sparkline Component
 */
function Sparkline({ data = [], color = '#10B981', gradientId = 'sparkline-grad', height = 36 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const width = 120;
  const padding = 4;

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Scale data points to SVG coordinate space
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return { x, y, val };
  });

  // Build smooth cubic bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div
      className="relative flex items-center select-none"
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-24 sm:w-28 h-8 sm:h-9 overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill underneath curve */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Smooth trend curve */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive hover points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={hoveredIdx === idx ? 4 : 2}
            className="transition-all cursor-pointer"
            fill={hoveredIdx === idx ? '#fff' : color}
            stroke={color}
            strokeWidth={hoveredIdx === idx ? 2 : 1}
            onMouseEnter={() => setHoveredIdx(idx)}
            onTouchStart={() => setHoveredIdx(idx)}
          />
        ))}
      </svg>

      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-stone-900 text-white text-[9px] font-mono shadow-md whitespace-nowrap z-20 pointer-events-none animate-fade-in">
          {data[hoveredIdx]}
        </div>
      )}
    </div>
  );
}

/**
 * Custom High-Aesthetic Glassmorphism Chart Tooltip
 */
function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload || {};
  const revenue = data.revenue || 0;
  const profit = data.profit || 0;
  const margin = data.margin || (revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0);
  const orders = data.orders || 0;

  return (
    <div className="bg-stone-950/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl border border-stone-800 text-xs space-y-1.5 min-w-[170px] animate-fade-in font-sans">
      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
        <span className="font-bold text-stone-300">{label}</span>
        <span className="text-[10px] text-stone-400 font-mono">{orders} طلبات</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3 text-stone-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span className="text-[11px]">المبيعات:</span>
          </span>
          <span className="font-mono font-bold text-white">{revenue.toLocaleString('ar-SA')} ر.س</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-emerald-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px]">صافي الربح:</span>
          </span>
          <span className="font-mono font-bold text-emerald-400">{profit.toLocaleString('ar-SA')} ر.س</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-[10px] pt-1 border-t border-stone-800 text-stone-400 font-mono">
          <span>هامش الربح المحقق:</span>
          <span className="font-bold text-emerald-400">{margin}%</span>
        </div>
      </div>
    </div>
  );
}

export default function SalesAndProfitsDashboard({
  lang = 'ar',
  onOpenOrderSlip,
  _themeTokens = {},
}) {
  const isAr = lang === 'ar';
  const searchInputRef = useRef(null);

  // Transactions State
  const [transactions] = useState(INITIAL_SALES_TRANSACTIONS);

  // Filters State
  const [dateFilter, setDateFilter] = useState('month'); // 'today' | '7days' | 'month' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-11-03');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'pending' | 'refunded'
  const [searchQuery, setSearchQuery] = useState('');

  // Chart Controls State
  const [chartGranularity, setChartGranularity] = useState('daily'); // 'daily' | 'weekly' | 'hourly'
  const [showRevenueArea, setShowRevenueArea] = useState(true);
  const [showProfitArea, setShowProfitArea] = useState(true);

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp' | 'totalRevenue' | 'netProfit'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Transaction for Slide-Over Drawer
  const [selectedTx, setSelectedTx] = useState(null);

  // Loading simulation state for smooth transitions
  const [isLoading, setIsLoading] = useState(false);

  // Trigger keyboard shortcut Ctrl+K or ⌘K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 180);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 180);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setDateFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 180);
  };

  // =========================================================================
  // Financial Filtering Logic
  // =========================================================================
  const filteredTransactions = useMemo(() => {
    const todayStr = '2026-11-03';
    const today = new Date(todayStr);

    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);

      if (dateFilter === 'today') {
        if (!tx.timestamp.startsWith(todayStr)) return false;
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (txDate < sevenDaysAgo || txDate > new Date(todayStr + 'T23:59:59')) return false;
      } else if (dateFilter === 'month') {
        if (txDate.getFullYear() !== 2026 || txDate.getMonth() !== 10) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && txDate < new Date(customStartDate + 'T00:00:00')) return false;
        if (customEndDate && txDate > new Date(customEndDate + 'T23:59:59')) return false;
      }

      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = tx.id.toLowerCase().includes(q) || String(tx.orderNumber).includes(q);
        const matchesName = tx.customerName.toLowerCase().includes(q);
        const matchesPhone = tx.customerPhone.includes(q);
        const matchesProduct =
          tx.productTitleAr.toLowerCase().includes(q) ||
          tx.productTitleEn.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesProduct) return false;
      }

      return true;
    });
  }, [transactions, dateFilter, customStartDate, customEndDate, statusFilter, searchQuery]);

  // Sorting
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'timestamp') {
        comparison = new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'totalRevenue') {
        comparison = b.totalRevenue - a.totalRevenue;
      } else if (sortBy === 'netProfit') {
        comparison = b.netProfit - a.netProfit;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // KPIs
  const kpis = useMemo(() => {
    const completedOrders = filteredTransactions.filter((tx) => tx.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, tx) => sum + (tx.totalRevenue || 0), 0);
    const totalCosts = completedOrders.reduce((sum, tx) => sum + (tx.totalCost || 0), 0);
    const netProfit = totalRevenue - totalCosts;
    const totalOrdersCount = completedOrders.length;
    const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const overallMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCosts,
      netProfit,
      totalOrdersCount,
      aov,
      overallMargin,
    };
  }, [filteredTransactions]);

  // Chart Timeline Data source based on user toggle
  const chartData = useMemo(() => {
    if (chartGranularity === 'hourly') return ANALYTICS_TIMELINES.hourly;
    if (chartGranularity === 'weekly') return ANALYTICS_TIMELINES.weekly;
    return ANALYTICS_TIMELINES.daily;
  }, [chartGranularity]);

  // Toggle Sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (sortedTransactions.length === 0) return;

    const headers = [
      'رقم العملية',
      'العميل',
      'الجوال',
      'المنتج',
      'التاريخ',
      'سعر البيع',
      'رسوم التوصيل والإضافات',
      'إجمالي الإيراد',
      'التكاليف',
      'صافي الربح',
      'هامش الربح %',
      'الحالة',
    ];

    const rows = sortedTransactions.map((tx) => [
      tx.id,
      `"${tx.customerName}"`,
      `"${tx.customerPhone}"`,
      `"${tx.productTitleAr}"`,
      `"${new Date(tx.timestamp).toLocaleString('ar-SA')}"`,
      tx.salePrice.toFixed(2),
      (tx.addonsAmount + tx.deliveryFee).toFixed(2),
      tx.totalRevenue.toFixed(2),
      tx.totalCost.toFixed(2),
      tx.netProfit.toFixed(2),
      `${tx.profitMargin.toFixed(1)}%`,
      tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'معلق' : 'مسترجع',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowerHub_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 text-stone-900 animate-fade-in font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ===================================================================== */}
      {/* 1. Header & Minimalist Control Hub */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Live Status Indicator */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {isAr ? 'التقرير المالي الذكي • المبيعات والأرباح' : 'Executive Financial Flow'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAr
              ? 'متابعة حية للإيرادات، هوامش الربح الصافية، والتدفقات النقدية اللحظية للمنسق'
              : 'Real-time revenue, margins, and operational cash flow for boutique coordinators'}
          </p>
        </div>

        {/* Quick Search & Secondary Action Icons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Streamlined Search Bar with Keyboard Hint */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute inset-inline-start-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={isAr ? 'بحث سريع عن عملية أو عميل...' : 'Search transactions...'}
              className="w-full ps-8.5 pe-12 py-2 rounded-2xl bg-white border border-stone-200/90 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 shadow-2xs transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded-md bg-stone-50 select-none hidden sm:inline">
                ⌘K
              </span>
            )}
          </div>

          {/* Export Action Button */}
          <button
            onClick={handleExportCSV}
            title={isAr ? 'تصدير كملف Excel (CSV)' : 'Export CSV'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 shadow-2xs text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">{isAr ? 'تصدير' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. Sleek Segmented Time & Status Filter Pills */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/70 p-1.5 rounded-2xl border border-stone-200/80">
        {/* Time Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
            { id: '7days', labelAr: 'آخر 7 أيام', labelEn: '7 Days' },
            { id: 'month', labelAr: 'هذا الشهر', labelEn: 'Month' },
            { id: 'all', labelAr: 'كل الأوقات', labelEn: 'All Time' },
            { id: 'custom', labelAr: 'مخصص 📅', labelEn: 'Custom 📅' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleDateFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'completed', labelAr: 'مكتمل', labelEn: 'Completed' },
            { id: 'pending', labelAr: 'معلق', labelEn: 'Pending' },
            { id: 'refunded', labelAr: 'مسترجع', labelEn: 'Refunded' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleStatusFilterChange(st.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {isAr ? st.labelAr : st.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Inline Drawer (if 'custom' active) */}
      {dateFilter === 'custom' && (
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs animate-fade-in">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="font-bold text-stone-700">{isAr ? 'نطاق التاريخ المخصص:' : 'Custom Date Range:'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">{isAr ? 'من' : 'From'}</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 font-mono text-xs focus:outline-hidden focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">{isAr ? 'إلى' : 'To'}</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 font-mono text-xs focus:outline-hidden focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. Main Data Container with Shimmer Transition */}
      {/* ===================================================================== */}
      <div className={`space-y-6 transition-all duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* Modern KPI Cards with Interactive Sparklines & Accent Glow */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <ArrowUpRight className="w-2.5 h-2.5" />
                +14.2%
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {formatCurrency(kpis.totalRevenue, lang)}
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between pt-2 border-t border-stone-100">
            <span className="text-[10px] text-stone-400">{isAr ? 'منحنى الإيراد' : 'Trend'}</span>
            <Sparkline
              data={[240, 310, 275, 420, 380, 490, 525, 990]}
              color="#0284C7"
              gradientId="grad-revenue"
            />
          </div>
        </div>

        {/* KPI 2: PRIMARY METRIC - Net Profit (With Subtle Emerald Accent Glow) */}
        <div className="bg-gradient-to-b from-white via-white to-emerald-50/20 rounded-3xl p-4 sm:p-5 border border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_25px_-4px_rgba(16,185,129,0.22)] transition-all flex flex-col justify-between relative overflow-hidden group">
          {/* Glow indicator pill */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />

          <div>
            <div className="flex items-center justify-between text-stone-600 mb-1">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{isAr ? 'صافي الأرباح' : 'Net Profit'}</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
                <ArrowUpRight className="w-2.5 h-2.5" />
                +18.5%
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-emerald-900 tracking-tight">
              {formatCurrency(kpis.netProfit, lang)}
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between pt-2 border-t border-emerald-100/70">
            <span className="text-[10px] font-bold text-emerald-700 font-mono">
              {isAr ? `هامش: ${kpis.overallMargin.toFixed(1)}%` : `Margin: ${kpis.overallMargin.toFixed(1)}%`}
            </span>
            <Sparkline
              data={[135, 177, 156, 225, 278, 253, 350, 535]}
              color="#059669"
              gradientId="grad-profit"
            />
          </div>
        </div>

        {/* KPI 3: Successful Orders */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">{isAr ? 'العمليات المباعة' : 'Total Orders'}</span>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-full font-mono">
                98% تسليم
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {kpis.totalOrdersCount}{' '}
              <span className="text-xs font-normal text-stone-400">{isAr ? 'طلب' : 'orders'}</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between pt-2 border-t border-stone-100">
            <span className="text-[10px] text-stone-400">{isAr ? 'معدل الطلب' : 'Velocity'}</span>
            <Sparkline
              data={[1, 2, 1, 3, 2, 2, 4, 5]}
              color="#D97706"
              gradientId="grad-orders"
            />
          </div>
        </div>

        {/* KPI 4: Average Order Value (AOV) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">{isAr ? 'متوسط قيمة الطلب' : 'Avg Order Value'}</span>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-full font-mono">
                AOV
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {formatCurrency(kpis.aov, lang)}
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between pt-2 border-t border-stone-100">
            <span className="text-[10px] text-stone-400">{isAr ? 'قيمة السلة' : 'Basket'}</span>
            <Sparkline
              data={[210, 245, 320, 275, 360, 450, 490, 356]}
              color="#6366F1"
              gradientId="grad-aov"
            />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. Interactive Hero Analytics Chart Section */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 space-y-4">
        {/* Chart Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'المنحنى البياني للإيرادات وصافي الأرباح' : 'Financial Flow & Profit Velocity'}</span>
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {isAr ? 'حرك المؤشر أو المس النقاط لاستعراض هوامش الربح لكل فترة' : 'Hover or tap nodes to inspect granular margins'}
            </p>
          </div>

          {/* Chart Granularity & Curve Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Metric Curves Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setShowRevenueArea(!showRevenueArea)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  showRevenueArea ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                <span>{isAr ? 'المبيعات' : 'Revenue'}</span>
              </button>

              <button
                onClick={() => setShowProfitArea(!showProfitArea)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  showProfitArea ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{isAr ? 'صافي الربح' : 'Net Profit'}</span>
              </button>
            </div>

            {/* Grain Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-[11px] font-semibold">
              {[
                { id: 'daily', labelAr: 'يومي', labelEn: 'Daily' },
                { id: 'hourly', labelAr: 'ساعي', labelEn: 'Hourly' },
                { id: 'weekly', labelAr: 'أسبوعي', labelEn: 'Weekly' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setChartGranularity(g.id)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    chartGranularity === g.id
                      ? 'bg-stone-900 text-white shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {isAr ? g.labelAr : g.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Area Chart Viewport */}
        <div className="w-full h-64 sm:h-72 pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Revenue Curve Gradient */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C1917" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1C1917" stopOpacity={0.0} />
                </linearGradient>

                {/* Profit Curve Vibrant Emerald Gradient */}
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" opacity={0.6} />

              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: '#78716C', fontFamily: 'sans-serif' }}
                tickLine={false}
                axisLine={{ stroke: '#E7E5E4' }}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#A8A29E', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip content={<CustomChartTooltip />} />

              {/* Area 1: Revenue Curve */}
              {showRevenueArea && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1C1917"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 5, fill: '#1C1917', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {/* Area 2: Net Profit Curve */}
              {showProfitArea && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitGradient)"
                  activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. Streamlined 4-Column Ledger & Mobile Cards */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-sm text-stone-900">
              {isAr ? 'العمليات وسجل الفواتير' : 'Transaction Ledger'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
              {sortedTransactions.length}
            </span>
          </div>

          <span className="text-[11px] text-stone-400 hidden sm:inline">
            {isAr ? 'اضغط على أي عملية لعرض تفكيك التكاليف والهامش' : 'Click any transaction to open side sheet'}
          </span>
        </div>

        {/* Empty State */}
        {sortedTransactions.length === 0 && (
          <div className="py-16 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              {isAr ? 'لا توجد مبيعات مطابقة لهذا التحديد' : 'No sales matching criteria'}
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {isAr ? 'جرب تغيير خيارات التصفية أو مسح البحث' : 'Try clearing filters or search term'}
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-xs hover:bg-stone-800 cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        )}

        {/* DESKTOP STREAMLINED 4-COLUMN TABLE */}
        {sortedTransactions.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-stone-50/80 text-stone-500 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5 text-start">{isAr ? 'العملية والعميل' : 'Order & Customer'}</th>
                  <th
                    onClick={() => handleSort('timestamp')}
                    className="py-3 px-5 text-start cursor-pointer hover:bg-stone-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isAr ? 'التاريخ والوقت' : 'Date & Time'}</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('netProfit')}
                    className="py-3 px-5 text-start cursor-pointer hover:bg-stone-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isAr ? 'المبيعات وصافي الربح' : 'Revenue & Net Profit'}</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-5 text-center">{isAr ? 'الحالة والإجراء' : 'Status & Action'}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Order ID, Customer Name, and Payment Badge */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={tx.productImage}
                          alt={tx.productTitleAr}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-stone-200 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-stone-900 text-xs">
                              #{tx.orderNumber}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600">
                              {tx.paymentMethod}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-800 truncate mt-0.5">
                            {tx.customerName}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate max-w-[220px]">
                            {isAr ? tx.productTitleAr : tx.productTitleEn}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Date & Relative Time */}
                    <td className="py-3.5 px-5 text-stone-600 font-mono text-[11px]">
                      <span className="block font-semibold text-stone-800">
                        {new Date(tx.timestamp).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-stone-400 text-[10px]">
                        {new Date(tx.timestamp).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Column 3: Revenue (Top) & Net Profit in Green (Bottom) */}
                    <td className="py-3.5 px-5">
                      <div className="font-mono">
                        <span className="font-bold text-stone-900 text-xs block">
                          {formatCurrency(tx.totalRevenue, lang)}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold mt-0.5">
                          <span>صافي: {formatCurrency(tx.netProfit, lang)}</span>
                          <span className="text-[10px] px-1 rounded bg-emerald-50 text-emerald-700">
                            {tx.profitMargin.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 4: Status Pill + Single Action Button */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {tx.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isAr ? 'مكتمل' : 'Completed'}</span>
                          </span>
                        ) : tx.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{isAr ? 'معلق' : 'Pending'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/60">
                            <RotateCcw className="w-3 h-3 text-rose-600" />
                            <span>{isAr ? 'مسترجع' : 'Refunded'}</span>
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 font-medium text-[11px] transition-all cursor-pointer shadow-2xs"
                        >
                          {isAr ? 'تفاصيل ↗' : 'Details ↗'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MOBILE VIEW: Touch-Friendly Card List */}
        {sortedTransactions.length > 0 && (
          <div className="md:hidden divide-y divide-stone-100 p-2 sm:p-3 space-y-2.5">
            {paginatedTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs space-y-2.5 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white font-mono text-xs font-bold">
                      #{tx.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {tx.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{isAr ? 'مكتمل' : 'Completed'}</span>
                    </span>
                  ) : tx.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>{isAr ? 'معلق' : 'Pending'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800">
                      <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                      <span>{isAr ? 'مسترجع' : 'Refunded'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <img
                    src={tx.productImage}
                    alt={tx.productTitleAr}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {tx.customerName}
                    </h4>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {isAr ? tx.productTitleAr : tx.productTitleEn}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">{isAr ? 'المبيعات' : 'Revenue'}</span>
                    <span className="font-bold font-mono text-stone-900">
                      {formatCurrency(tx.totalRevenue, lang)}
                    </span>
                  </div>

                  <div className="text-end">
                    <span className="text-[10px] text-stone-400 block">{isAr ? 'صافي الربح' : 'Net Profit'}</span>
                    <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {formatCurrency(tx.netProfit, lang)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {sortedTransactions.length > itemsPerPage && (
          <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-between text-xs">
            <span className="text-stone-500 text-[11px]">
              {isAr
                ? `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    sortedTransactions.length
                  )} من أصل ${sortedTransactions.length}`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    sortedTransactions.length
                  )} of ${sortedTransactions.length}`}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 disabled:opacity-40 hover:bg-stone-100 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>

              <span className="px-2 font-mono font-bold text-stone-800 text-xs">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 disabled:opacity-40 hover:bg-stone-100 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. Slide-Over Detail Drawer (Slide-Over on Desktop, Sheet on Mobile) */}
      {/* ===================================================================== */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Drawer Top Header */}
            <div className="p-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isAr ? `تفكيك العملية #${selectedTx.orderNumber}` : `Transaction #${selectedTx.orderNumber}`}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(selectedTx.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              {/* Product preview card */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <img
                  src={selectedTx.productImage}
                  alt={selectedTx.productTitleAr}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] px-2 py-0.2 rounded bg-stone-200 text-stone-700 font-semibold">
                    {selectedTx.occasionAr}
                  </span>
                  <h4 className="font-bold text-xs text-stone-900 mt-1 truncate">
                    {isAr ? selectedTx.productTitleAr : selectedTx.productTitleEn}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                    {selectedTx.paymentMethod} • {selectedTx.customerName}
                  </p>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-stone-400">{isAr ? 'بيانات العميل والتوصيل:' : 'Customer & Delivery:'}</span>
                  <a
                    href={`https://wa.me/${selectedTx.customerPhone.replace(/^0/, '966')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold hover:underline"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                  </a>
                </div>
                <p className="font-bold text-stone-900 text-xs">{selectedTx.customerName}</p>
                <p className="text-[11px] text-stone-500 font-mono">{selectedTx.customerPhone}</p>
                <p className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60 mt-1">
                  📍 {selectedTx.deliveryAddress}
                </p>
              </div>

              {/* Gift Card Message Quote */}
              {selectedTx.giftCardMessage && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1 font-sans">
                  <span className="text-[10px] font-bold text-amber-900 block">
                    {isAr ? 'كرت الإهداء المطبوع:' : 'Gift Card Message:'}
                  </span>
                  <p className="font-serif italic text-xs text-amber-950 font-medium">
                    "{selectedTx.giftCardMessage}"
                  </p>
                  <p className="text-[10px] text-amber-800">
                    {isAr ? `إلى: ${selectedTx.giftCardTo} | من: ${selectedTx.giftCardFrom}` : `To: ${selectedTx.giftCardTo} | From: ${selectedTx.giftCardFrom}`}
                  </p>
                </div>
              )}

              {/* Deep Ledger & Deductions Breakdown */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-2.5 bg-white shadow-2xs font-sans">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-bold text-xs text-stone-900">
                    {isAr ? 'تحليل التكاليف وهامش الربح' : 'Profit & Cost Breakdown'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Formula: Rev - Cost
                  </span>
                </div>

                {/* Revenue Lines */}
                <div className="space-y-1 text-stone-700 text-xs">
                  <div className="flex justify-between">
                    <span>{isAr ? 'سعر بيع الباقة:' : 'Base Bouquet:'}</span>
                    <span className="font-mono">{formatCurrency(selectedTx.salePrice, lang)}</span>
                  </div>
                  {selectedTx.addonsAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{isAr ? 'إضافات وشريط الاسم:' : 'Add-ons:'}</span>
                      <span className="font-mono">+{formatCurrency(selectedTx.addonsAmount, lang)}</span>
                    </div>
                  )}
                  {selectedTx.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>{isAr ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                      <span className="font-mono">+{formatCurrency(selectedTx.deliveryFee, lang)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
                    <span>{isAr ? 'إجمالي الإيرادات:' : 'Total Gross Revenue:'}</span>
                    <span className="font-mono text-emerald-800">{formatCurrency(selectedTx.totalRevenue, lang)}</span>
                  </div>
                </div>

                {/* Cost Deductions */}
                <div className="pt-2 border-t border-dashed border-stone-200 space-y-1 text-stone-500 text-[11px]">
                  <span className="font-bold text-stone-800 block text-[11px]">
                    {isAr ? 'التكاليف والعمولات المستقطعة:' : 'Direct Deductions:'}
                  </span>
                  <div className="flex justify-between ps-2">
                    <span>• {isAr ? 'تكلفة الزهور بالجملة:' : 'Wholesale Stems:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.costFlowers, lang)}</span>
                  </div>
                  <div className="flex justify-between ps-2">
                    <span>• {isAr ? 'التغليف، الفازة والشرائط:' : 'Packaging & Vase:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.costPackaging, lang)}</span>
                  </div>
                  {selectedTx.costDeliveryDriver > 0 && (
                    <div className="flex justify-between ps-2">
                      <span>• {isAr ? 'أجرة السائق:' : 'Courier Driver:'}</span>
                      <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.costDeliveryDriver, lang)}</span>
                    </div>
                  )}
                  <div className="flex justify-between ps-2">
                    <span>• {isAr ? 'رسوم بوابة الدفع الإلكتروني:' : 'Payment Processing Fee:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.platformFee, lang)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-800 pt-1 border-t border-stone-100">
                    <span>{isAr ? 'مجموع التكاليف:' : 'Total Cost:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.totalCost, lang)}</span>
                  </div>
                </div>

                {/* Net Profit Callout */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between font-bold text-emerald-950 mt-2">
                  <div>
                    <span className="text-xs block">{isAr ? 'صافي الربح المحقق:' : 'Realized Net Profit:'}</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {isAr ? `هامش ربح: ${selectedTx.profitMargin.toFixed(1)}%` : `Margin: ${selectedTx.profitMargin.toFixed(1)}%`}
                    </span>
                  </div>
                  <span className="text-base font-mono font-black text-emerald-900">
                    {formatCurrency(selectedTx.netProfit, lang)}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
              {onOpenOrderSlip && (
                <button
                  onClick={() => {
                    setSelectedTx(null);
                    onOpenOrderSlip();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAr ? 'طباعة الإيصال 80mm' : 'Print Slip'}</span>
                </button>
              )}

              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

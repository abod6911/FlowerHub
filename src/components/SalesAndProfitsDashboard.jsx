import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  RotateCcw,
  Receipt,
  X,
  MessageCircle,
  Layers,
  Percent,
} from 'lucide-react';
import { INITIAL_SALES_TRANSACTIONS, formatCurrency } from '../data/mockSalesData';

export default function SalesAndProfitsDashboard({
  lang = 'ar',
  onOpenOrderSlip,
  themeTokens = {},
}) {
  const isAr = lang === 'ar';

  // Transactions State
  const [transactions, setTransactions] = useState(INITIAL_SALES_TRANSACTIONS);

  // Filters State
  const [dateFilter, setDateFilter] = useState('month'); // 'today' | '7days' | 'month' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-11-03');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'pending' | 'refunded'
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp' | 'totalRevenue' | 'netProfit'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Transaction for Details Modal / Drawer
  const [selectedTx, setSelectedTx] = useState(null);

  // Loading simulation state for smooth filter transitions
  const [isLoading, setIsLoading] = useState(false);

  // Trigger brief skeleton shimmer when filter changes for UX feedback
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 220);
    return () => clearTimeout(timer);
  }, [dateFilter, statusFilter, customStartDate, customEndDate]);

  // Reset to first page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, statusFilter, searchQuery, customStartDate, customEndDate]);

  // =========================================================================
  // Financial & Date Filtering Logic
  // =========================================================================
  const filteredTransactions = useMemo(() => {
    const todayStr = '2026-11-03';
    const today = new Date(todayStr);

    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);

      // 1. Date Range Filter
      if (dateFilter === 'today') {
        const isToday = tx.timestamp.startsWith(todayStr);
        if (!isToday) return false;
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (txDate < sevenDaysAgo || txDate > new Date(todayStr + 'T23:59:59')) return false;
      } else if (dateFilter === 'month') {
        // Current month (November 2026)
        if (txDate.getFullYear() !== 2026 || txDate.getMonth() !== 10) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && txDate < new Date(customStartDate + 'T00:00:00')) return false;
        if (customEndDate && txDate > new Date(customEndDate + 'T23:59:59')) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }

      // 3. Search Query Filter
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

  // Sort filtered transactions
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

  // Paginated records
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // =========================================================================
  // Mathematical KPI Summaries (Only Completed Orders form Revenue/Profit)
  // =========================================================================
  const kpis = useMemo(() => {
    // Only completed orders contribute to actualized revenue and profits
    const completedOrders = filteredTransactions.filter((tx) => tx.status === 'completed');

    const totalRevenue = completedOrders.reduce((sum, tx) => sum + (tx.totalRevenue || 0), 0);
    const totalCosts = completedOrders.reduce((sum, tx) => sum + (tx.totalCost || 0), 0);
    const netProfit = totalRevenue - totalCosts;
    const totalOrdersCount = completedOrders.length;
    const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const overallMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Previous period comparative indicators (simulated benchmarks based on time window)
    let compRevenue = '+14.2%';
    let compProfit = '+18.5%';
    let compOrders = '+11.0%';
    let compAov = '+3.2%';

    if (dateFilter === 'today') {
      compRevenue = '+22.4%';
      compProfit = '+28.1%';
      compOrders = '+15.0%';
      compAov = '+6.4%';
    } else if (dateFilter === '7days') {
      compRevenue = '+12.8%';
      compProfit = '+14.9%';
      compOrders = '+8.5%';
      compAov = '+4.0%';
    }

    return {
      totalRevenue,
      totalCosts,
      netProfit,
      totalOrdersCount,
      aov,
      overallMargin,
      compRevenue,
      compProfit,
      compOrders,
      compAov,
    };
  }, [filteredTransactions, dateFilter]);

  // Toggle sorting column
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV with UTF-8 BOM so Arabic names display flawlessly in Excel
  const handleExportCSV = () => {
    if (sortedTransactions.length === 0) return;

    const headers = [
      'رقم العملية',
      'اسم العميل',
      'رقم الجوال',
      'المنتج / الباقة',
      'المناسبة',
      'التاريخ والوقت',
      'طريقة الدفع',
      'سعر البيع',
      'رسوم إضافية وتوصيل',
      'إجمالي الإيراد',
      'إجمالي التكلفة',
      'صافي الربح',
      'هامش الربح %',
      'الحالة',
    ];

    const rows = sortedTransactions.map((tx) => [
      tx.id,
      `"${tx.customerName}"`,
      `"${tx.customerPhone}"`,
      `"${tx.productTitleAr}"`,
      `"${tx.occasionAr}"`,
      `"${new Date(tx.timestamp).toLocaleString('ar-SA')}"`,
      `"${tx.paymentMethod}"`,
      tx.salePrice.toFixed(2),
      (tx.addonsAmount + tx.deliveryFee).toFixed(2),
      tx.totalRevenue.toFixed(2),
      tx.totalCost.toFixed(2),
      tx.netProfit.toFixed(2),
      `${tx.profitMargin.toFixed(1)}%`,
      tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'معلق' : 'مسترجع',
    ]);

    // UTF-8 BOM prefix \uFEFF ensures proper Arabic character display in Excel
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowerHub_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{isAr ? 'مكتمل' : 'Completed'}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{isAr ? 'معلق' : 'Pending'}</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200/80">
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>{isAr ? 'مسترجع' : 'Refunded'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in text-stone-900" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ===================================================================== */}
      {/* 1. Header Banner & Actions */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 tracking-tight">
              {isAr ? 'تقرير المبيعات وصافي الأرباح' : 'Sales & Net Profits Analytics'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAr
              ? 'متابعة حية للإيرادات، تكلفة الزهور، والعمولات وصافي الربح المحقق في المتجر'
              : 'Real-time overview of revenue, floral costs, fees, and net boutique profit'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-xs hover:bg-stone-800 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-300" />
            <span>{isAr ? 'تصدير البيانات (Excel)' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. Responsive Filter Bar */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-xs space-y-3">
        {/* Desktop & Mobile Quick Date Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Segmented Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-xs font-bold text-stone-500 me-1 hidden sm:inline">
              {isAr ? 'الفترة:' : 'Period:'}
            </span>
            {[
              { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
              { id: '7days', labelAr: 'آخر 7 أيام', labelEn: 'Last 7 Days' },
              { id: 'month', labelAr: 'هذا الشهر', labelEn: 'This Month' },
              { id: 'all', labelAr: 'كل الأوقات', labelEn: 'All Time' },
              { id: 'custom', labelAr: 'مخصص 📅', labelEn: 'Custom 📅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown / Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-500 me-1 hidden sm:inline">
              {isAr ? 'الحالة:' : 'Status:'}
            </span>
            <div className="grid grid-cols-4 sm:flex items-center gap-1 w-full sm:w-auto">
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'completed', labelAr: 'مكتمل', labelEn: 'Completed' },
                { id: 'pending', labelAr: 'معلق', labelEn: 'Pending' },
                { id: 'refunded', labelAr: 'مسترجع', labelEn: 'Refunded' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {isAr ? st.labelAr : st.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker (shown when 'custom' is active) */}
        {dateFilter === 'custom' && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center gap-3 text-xs animate-fade-in">
            <span className="font-bold text-stone-700">
              {isAr ? 'حدد نطاق التاريخ:' : 'Select Range:'}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-stone-500">{isAr ? 'من:' : 'From:'}</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stone-300 bg-white font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-stone-500">{isAr ? 'إلى:' : 'To:'}</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stone-300 bg-white font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute inset-inline-start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث برقم الطلب (#8492)، اسم العميل، الباقة أو الجوال...'
                : 'Search by order #, customer name, bouquet, or phone...'
            }
            className="w-full ps-9 pe-9 py-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 transition-all focus:outline-hidden focus:ring-1 focus:ring-stone-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. Top KPI Summary Cards (4-column on Desktop, 2x2 on Mobile) */}
      {/* ===================================================================== */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-2.5 h-28"
            >
              <div className="h-3 w-20 bg-stone-200 rounded-sm" />
              <div className="h-6 w-28 bg-stone-200 rounded-sm" />
              <div className="h-2 w-16 bg-stone-100 rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Total Revenue */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-bold">{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {formatCurrency(kpis.totalRevenue, lang)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 inline-flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                {kpis.compRevenue}
              </span>
              <span className="text-stone-400">
                {isAr ? 'مقارنة بالفترة السابقة' : 'vs prior period'}
              </span>
            </div>
          </div>

          {/* KPI 2: Net Profit */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-bold">{isAr ? 'صافي الأرباح' : 'Net Profit'}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-emerald-800 tracking-tight">
              {formatCurrency(kpis.netProfit, lang)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 inline-flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                {kpis.compProfit}
              </span>
              <span className="font-semibold text-emerald-700">
                {isAr ? `هامش: ${kpis.overallMargin.toFixed(1)}%` : `Margin: ${kpis.overallMargin.toFixed(1)}%`}
              </span>
            </div>
          </div>

          {/* KPI 3: Total Orders */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-bold">{isAr ? 'العمليات المباعة' : 'Total Orders'}</span>
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {kpis.totalOrdersCount}{' '}
              <span className="text-xs font-normal text-stone-500">
                {isAr ? 'طلب ناجح' : 'orders'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 inline-flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                {kpis.compOrders}
              </span>
              <span className="text-stone-400">
                {isAr ? 'نسبة الإنجاز ٩٨٪' : '98% completion rate'}
              </span>
            </div>
          </div>

          {/* KPI 4: Average Order Value (AOV) */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-xs font-bold">{isAr ? 'متوسط قيمة الطلب' : 'Average Order'}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {formatCurrency(kpis.aov, lang)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 inline-flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                {kpis.compAov}
              </span>
              <span className="text-stone-400">
                {isAr ? 'لكل عميل' : 'per customer'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. Desktop / Laptop View: Sortable Data Table */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-sm text-stone-900">
              {isAr ? 'سجل العمليات والمبيعات التفصيلي' : 'Sales Breakdown & Ledger'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
              {sortedTransactions.length}
            </span>
          </div>

          <span className="text-xs text-stone-400 hidden sm:inline">
            {isAr ? 'اضغط على أي عملية لمشاهدة تحليل التكاليف' : 'Click any transaction to inspect breakdown'}
          </span>
        </div>

        {/* Empty State */}
        {sortedTransactions.length === 0 && (
          <div className="py-16 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              {isAr ? 'لا توجد مبيعات في هذه الفترة' : 'No transactions found for this period'}
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {isAr
                ? 'جرب تغيير خيارات التصفية أو اختيار نطاق تاريخي آخر للبحث'
                : 'Try clearing your filters or selecting a broader date range'}
            </p>
            <button
              onClick={() => {
                setDateFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-xs hover:bg-stone-800 cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        )}

        {/* DESKTOP TABLE: Hidden on mobile (<768px), rendered on tablet & desktop */}
        {sortedTransactions.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => handleSort('timestamp')}
                    className="py-3 px-4 text-start cursor-pointer hover:bg-stone-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isAr ? 'رقم العملية' : 'Order ID'}</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المنتج / العميل' : 'Product & Customer'}</th>
                  <th
                    onClick={() => handleSort('timestamp')}
                    className="py-3 px-4 text-start cursor-pointer hover:bg-stone-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isAr ? 'التاريخ والوقت' : 'Date & Time'}</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('totalRevenue')}
                    className="py-3 px-4 text-start cursor-pointer hover:bg-stone-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isAr ? 'سعر البيع' : 'Sale Price'}</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-start">{isAr ? 'التكلفة / الرسوم' : 'Cost & Fees'}</th>
                  <th
                    onClick={() => handleSort('netProfit')}
                    className="py-3 px-4 text-start cursor-pointer hover:bg-stone-100 select-none"
                  >
                    <div className="flex items-center gap-1 text-emerald-800">
                      <span>{isAr ? 'صافي الربح' : 'Net Profit'}</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'تفاصيل' : 'Action'}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Order ID & Tag */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[11px] group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        #{tx.orderNumber}
                      </span>
                    </td>

                    {/* Product & Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tx.productImage}
                          alt={tx.productTitleAr}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 truncate max-w-[200px]">
                            {isAr ? tx.productTitleAr : tx.productTitleEn}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {tx.customerName} • <span className="font-mono text-[10px]">{tx.paymentMethod}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                      {new Date(tx.timestamp).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Sale Price (Total Revenue) */}
                    <td className="py-3.5 px-4 font-bold text-stone-900 font-mono">
                      {formatCurrency(tx.totalRevenue, lang)}
                    </td>

                    {/* Total Cost */}
                    <td className="py-3.5 px-4 text-stone-500 font-mono">
                      {formatCurrency(tx.totalCost, lang)}
                    </td>

                    {/* Net Profit */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-800 font-mono block">
                        {formatCurrency(tx.netProfit, lang)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono">
                        {tx.profitMargin.toFixed(1)}% هامش
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {renderStatusBadge(tx.status)}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-all cursor-pointer"
                        title={isAr ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. Mobile View (Phone Viewport): Touch-Friendly Cards Layout */}
        {/* =================================================================== */}
        {sortedTransactions.length > 0 && (
          <div className="md:hidden divide-y divide-stone-100 p-2 sm:p-3 space-y-2.5">
            {paginatedTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-2.5 active:bg-stone-50 transition-all cursor-pointer"
              >
                {/* Header: Order ID & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white font-mono text-xs font-bold">
                      #{tx.orderNumber}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {new Date(tx.timestamp).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {renderStatusBadge(tx.status)}
                </div>

                {/* Product & Customer Details */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={tx.productImage}
                    alt={tx.productTitleAr}
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {isAr ? tx.productTitleAr : tx.productTitleEn}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {tx.customerName} • <span className="font-mono text-[10px]">{tx.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                {/* Financial Bottom Row */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">{isAr ? 'إجمالي الإيراد' : 'Revenue'}</span>
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

        {/* =================================================================== */}
        {/* 6. Pagination Controls */}
        {/* =================================================================== */}
        {sortedTransactions.length > itemsPerPage && (
          <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-50 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              {isAr
                ? `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    sortedTransactions.length
                  )} من أصل ${sortedTransactions.length} عملية`
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
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <span className="px-2.5 py-1 font-mono font-bold text-stone-800">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 disabled:opacity-40 hover:bg-stone-100 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 7. Full Transaction Breakdown Modal / Bottom Sheet */}
      {/* ===================================================================== */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isAr ? `تفاصيل العملية #${selectedTx.orderNumber}` : `Transaction #${selectedTx.orderNumber}`}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {new Date(selectedTx.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product Card Row */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <img
                  src={selectedTx.productImage}
                  alt={selectedTx.productTitleAr}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-semibold">
                    {selectedTx.occasionAr}
                  </span>
                  <h4 className="font-bold text-sm text-stone-900 mt-1 truncate">
                    {isAr ? selectedTx.productTitleAr : selectedTx.productTitleEn}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {selectedTx.paymentMethod} • {renderStatusBadge(selectedTx.status)}
                  </p>
                </div>
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-400 block">{isAr ? 'العميل' : 'Customer'}</span>
                  <p className="font-bold text-stone-900">{selectedTx.customerName}</p>
                  <p className="font-mono text-[11px] text-stone-600">{selectedTx.customerPhone}</p>
                </div>

                <div className="text-end">
                  <span className="text-[10px] text-stone-400 block">{isAr ? 'طريقة الاستلام' : 'Handover'}</span>
                  <p className="font-bold text-stone-900">
                    {selectedTx.handoverType === 'gift'
                      ? 'إرسال كهدية'
                      : selectedTx.handoverType === 'delivery'
                      ? 'توصيل للعنوان'
                      : 'استلام من الفرع'}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">{selectedTx.deliveryAddress}</p>
                </div>
              </div>

              {/* Gift Card Message if exists */}
              {selectedTx.giftCardMessage && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 block">
                    {isAr ? 'نص كرت الإهداء المرفق:' : 'Gift Card Message:'}
                  </span>
                  <p className="font-serif italic text-xs text-amber-950 font-medium">
                    "{selectedTx.giftCardMessage}"
                  </p>
                  <p className="text-[10px] text-amber-800">
                    {isAr ? `إلى: ${selectedTx.giftCardTo} | من: ${selectedTx.giftCardFrom}` : `To: ${selectedTx.giftCardTo} | From: ${selectedTx.giftCardFrom}`}
                  </p>
                </div>
              )}

              {/* Detailed Financial Ledger & Profit Formula */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-2.5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-xs text-stone-900">
                    {isAr ? 'تحليل الإيرادات والتكاليف (Financial Breakdown)' : 'Revenue & Cost Ledger'}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Formula: Revenue - Cost
                  </span>
                </div>

                {/* Revenue Lines */}
                <div className="space-y-1 text-stone-700">
                  <div className="flex justify-between">
                    <span>{isAr ? 'سعر بيع الباقة الأساسية:' : 'Base Bouquet Price:'}</span>
                    <span className="font-mono">{formatCurrency(selectedTx.salePrice, lang)}</span>
                  </div>
                  {selectedTx.addonsAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{isAr ? 'إضافات وشريط الاسم:' : 'Add-ons & Custom Ribbon:'}</span>
                      <span className="font-mono">+{formatCurrency(selectedTx.addonsAmount, lang)}</span>
                    </div>
                  )}
                  {selectedTx.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>{isAr ? 'رسوم التوصيل المحصلة:' : 'Delivery Fee Collected:'}</span>
                      <span className="font-mono">+{formatCurrency(selectedTx.deliveryFee, lang)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
                    <span>{isAr ? 'إجمالي الإيرادات المحصلة:' : 'Total Gross Revenue:'}</span>
                    <span className="font-mono text-emerald-800">{formatCurrency(selectedTx.totalRevenue, lang)}</span>
                  </div>
                </div>

                {/* Cost Lines */}
                <div className="pt-2 border-t border-dashed border-stone-200 space-y-1 text-stone-600 text-[11px]">
                  <span className="font-bold text-stone-800 block text-[11px]">
                    {isAr ? 'خصم التكاليف المباشرة والتشغيلية:' : 'Direct Operational Costs:'}
                  </span>
                  <div className="flex justify-between ps-2">
                    <span>• {isAr ? 'تكلفة الزهور الخام بالجملة:' : 'Wholesale Stems Cost:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.costFlowers, lang)}</span>
                  </div>
                  <div className="flex justify-between ps-2">
                    <span>• {isAr ? 'التغليف، الفازة وشريط الساتان:' : 'Packaging, Vase & Ribbon:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.costPackaging, lang)}</span>
                  </div>
                  {selectedTx.costDeliveryDriver > 0 && (
                    <div className="flex justify-between ps-2">
                      <span>• {isAr ? 'أجرة مندوب التوصيل:' : 'Delivery Courier Cost:'}</span>
                      <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.costDeliveryDriver, lang)}</span>
                    </div>
                  )}
                  <div className="flex justify-between ps-2">
                    <span>• {isAr ? 'عمولة بوابة الدفع (Mada/Visa):' : 'Payment Processing Fee:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.platformFee, lang)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-800 pt-1 border-t border-stone-100">
                    <span>{isAr ? 'مجموع التكاليف:' : 'Total Deductions:'}</span>
                    <span className="font-mono text-rose-700">-{formatCurrency(selectedTx.totalCost, lang)}</span>
                  </div>
                </div>

                {/* Net Profit Result Callout */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-bold text-emerald-950 mt-2">
                  <div>
                    <span className="text-xs block">{isAr ? 'صافي الربح المحقق (Net Profit):' : 'Net Realized Profit:'}</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {isAr ? `هامش ربح: ${selectedTx.profitMargin.toFixed(1)}%` : `Profit Margin: ${selectedTx.profitMargin.toFixed(1)}%`}
                    </span>
                  </div>
                  <span className="text-base sm:text-lg font-mono font-black text-emerald-900">
                    {formatCurrency(selectedTx.netProfit, lang)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2">
              <a
                href={`https://wa.me/${selectedTx.customerPhone.replace(/^0/, '966')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isAr ? 'محادثة العميل واتساب' : 'WhatsApp Customer'}</span>
              </a>

              <div className="flex items-center gap-2">
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
                  className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

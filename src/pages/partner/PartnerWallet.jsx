import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Clock, CheckCircle, CreditCard, Building2, Globe, ShieldCheck, Plus, X, ArrowDownRight, Wallet, Send, Landmark, Smartphone, Zap, Search, ChevronDown, MoreHorizontal, FileText, Download, Eye } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export const PartnerWallet = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [payouts, setPayouts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Outflow'); // 'Income' or 'Outflow' for donut
  const [loading, setLoading] = useState(false);

  // Filters for ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Category');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const [selectedTxForInvoice, setSelectedTxForInvoice] = useState(null);

  // Admin Payout Request Form
  const [payoutForm, setPayoutForm] = useState({
    amount: 500,
    method: 'International Bank Wire (SWIFT)',
    accountName: user?.name || 'Shariful Islam',
    accountDetails: 'IBAN: GB29NWBK60161331926819 | SWIFT: NWBKGB22',
    bankName: 'National Westminster Bank UK'
  });

  // Personal Account Transfer Form
  const [transferForm, setTransferForm] = useState({
    amount: 200,
    destinationType: 'Mobile Banking (bKash/Nagad)',
    accountName: user?.name || 'Shariful Islam',
    accountNumber: '+880 1700-123456 (bKash Personal)',
    provider: 'bKash Mobile Money'
  });

  const fetchData = () => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(hotelsData => {
        if (Array.isArray(hotelsData)) {
          const myHotels = hotelsData.filter(h => {
            if (!user) return false;
            const uId = user.id ? String(user.id) : null;
            const uEmail = user.email ? user.email.toLowerCase() : null;
            const uName = user.name ? user.name.toLowerCase() : null;
            const uCompany = user.companyName ? user.companyName.toLowerCase() : null;

            if (h.partnerId && uId && String(h.partnerId) === uId) return true;
            if (h.partnerEmail && uEmail && h.partnerEmail.toLowerCase() === uEmail) return true;
            if (h.partnerName && uName && h.partnerName.toLowerCase() === uName) return true;
            if (h.partnerName && uCompany && h.partnerName.toLowerCase() === uCompany) return true;
            if (h.partnerName && uEmail && h.partnerName.toLowerCase() === uEmail.split('@')[0]) return true;
            return false;
          });
          const myHotelIds = myHotels.map(h => h.id);

          fetch('/api/bookings')
            .then(res => res.json())
            .then(bookingsData => {
              if (Array.isArray(bookingsData)) {
                const myBookings = bookingsData.filter(b => {
                  if (!user) return false;
                  const uId = user.id ? String(user.id) : null;
                  const uEmail = user.email ? user.email.toLowerCase() : null;

                  if (b.hotelId && myHotelIds.includes(b.hotelId)) return true;
                  if (b.partnerId && uId && String(b.partnerId) === uId) return true;
                  if (b.partnerEmail && uEmail && b.partnerEmail.toLowerCase() === uEmail) return true;
                  return false;
                });
                setBookings(myBookings);
              }
            })
            .catch(() => setBookings([]));
        }
      })
      .catch(() => {});

    fetch('/api/payouts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myPayouts = data.filter(p => {
            if (!user) return false;
            const uId = user.id ? String(user.id) : null;
            const uEmail = user.email ? user.email.toLowerCase() : null;
            if (p.partnerId && uId && String(p.partnerId) === uId) return true;
            if (p.partnerEmail && uEmail && p.partnerEmail.toLowerCase() === uEmail) return true;
            return false;
          });
          setPayouts(myPayouts);
        }
      })
      .catch(() => setPayouts([]));

    fetch('/api/transfers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myTransfers = data.filter(t => {
            if (!user) return false;
            const uId = user.id ? String(user.id) : null;
            const uEmail = user.email ? user.email.toLowerCase() : null;
            if (t.partnerId && uId && String(t.partnerId) === uId) return true;
            if (t.partnerEmail && uEmail && t.partnerEmail.toLowerCase() === uEmail) return true;
            return false;
          });
          setTransfers(myTransfers);
        }
      })
      .catch(() => setTransfers([]));
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, searchQuery]);

  const totalGross = bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.total || 0), 0);
  const partnerEarnings = Math.round(totalGross * 0.85); // 85% goes to Hotel Partner

  const paidOutAmount = payouts.filter(p => p.status === 'Completed' || p.status === 'Approved').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingAmount = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const personalDispatchedAmount = transfers.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const availableBalance = Math.max(0, partnerEarnings - paidOutAmount - pendingAmount - personalDispatchedAmount);

  // Dynamic monthly chart logic grouped by actual check-in dates
  const getMonthlyStats = () => {
    const monthlyData = [
      { month: 'Jan', inc: 0, exp: 0 },
      { month: 'Feb', inc: 0, exp: 0 },
      { month: 'Mar', inc: 0, exp: 0 },
      { month: 'Apr', inc: 0, exp: 0 },
      { month: 'May', inc: 0, exp: 0 },
      { month: 'Jun', inc: 0, exp: 0 },
      { month: 'Jul', inc: 0, exp: 0 },
      { month: 'Aug', inc: 0, exp: 0 },
      { month: 'Sep', inc: 0, exp: 0 },
      { month: 'Oct', inc: 0, exp: 0 },
      { month: 'Nov', inc: 0, exp: 0 },
      { month: 'Dec', inc: 0, exp: 0 }
    ];

    const monthsMap = {
      '01': 0, '02': 1, '03': 2, '04': 3, '05': 4, '06': 5,
      '07': 6, '08': 7, '09': 8, '10': 9, '11': 10, '12': 11
    };

    bookings.forEach(b => {
      if (b.status === 'Cancelled') return;
      const dateParts = b.checkIn ? b.checkIn.split('-') : null;
      if (dateParts && dateParts[1] && monthsMap[dateParts[1]] !== undefined) {
        const monthIdx = monthsMap[dateParts[1]];
        monthlyData[monthIdx].inc += Math.round((Number(b.total) || 0) * 0.85);
      }
    });

    payouts.forEach(p => {
      const dateStr = p.createdAt || '';
      const monthPart = dateStr.includes('-') ? dateStr.split('-')[1] : null;
      if (monthPart && monthsMap[monthPart] !== undefined) {
        const monthIdx = monthsMap[monthPart];
        monthlyData[monthIdx].exp += Number(p.amount) || 0;
      }
    });

    transfers.forEach(t => {
      const dateStr = t.createdAt || '';
      const monthPart = dateStr.includes('-') ? dateStr.split('-')[1] : null;
      if (monthPart && monthsMap[monthPart] !== undefined) {
        const monthIdx = monthsMap[monthPart];
        monthlyData[monthIdx].exp += Number(t.amount) || 0;
      }
    });

    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.inc, d.exp)), 1000);
    return monthlyData.map(d => ({
      month: d.month,
      inc: Math.round((d.inc / maxVal) * 100) || 12,
      exp: Math.round((d.exp / maxVal) * 100) || 8
    }));
  };

  const monthlyChartData = getMonthlyStats();

  // Dynamic Donut Outflow Allocations
  const swiftTotal = payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const mobileTotal = transfers.filter(t => t.destinationType?.includes('Mobile')).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const wiseTotal = transfers.filter(t => t.destinationType?.includes('PayPal') || t.destinationType?.includes('Wise')).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const cryptoTotal = transfers.filter(t => t.destinationType?.includes('Crypto') || t.destinationType?.includes('USDT')).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOutflow = swiftTotal + mobileTotal + wiseTotal + cryptoTotal || 1;

  const swiftPercent = Math.round((swiftTotal / totalOutflow) * 100) || 50;
  const mobilePercent = Math.round((mobileTotal / totalOutflow) * 100) || 30;
  const wisePercent = Math.round((wiseTotal / totalOutflow) * 100) || 15;
  const cryptoPercent = 100 - swiftPercent - mobilePercent - wisePercent;

  // Dynamic Donut Income Allocations (by booked room types)
  const deluxeIncome = bookings.filter(b => b.status !== 'Cancelled' && (b.roomName?.toLowerCase().includes('deluxe') || b.roomName?.toLowerCase().includes('ocean'))).reduce((sum, b) => sum + (b.total || 0), 0) * 0.85;
  const suiteIncome = bookings.filter(b => b.status !== 'Cancelled' && b.roomName?.toLowerCase().includes('suite')).reduce((sum, b) => sum + (b.total || 0), 0) * 0.85;
  const standardIncome = bookings.filter(b => b.status !== 'Cancelled' && b.roomName?.toLowerCase().includes('standard')).reduce((sum, b) => sum + (b.total || 0), 0) * 0.85;
  const otherIncome = Math.max(0, partnerEarnings - deluxeIncome - suiteIncome - standardIncome);
  const totalIncomeVal = partnerEarnings || 1;

  const deluxePercent = Math.round((deluxeIncome / totalIncomeVal) * 100) || 60;
  const suitePercent = Math.round((suiteIncome / totalIncomeVal) * 100) || 25;
  const standardPercent = Math.round((standardIncome / totalIncomeVal) * 100) || 10;
  const otherPercent = 100 - deluxePercent - suitePercent - standardPercent;

  // Submit Admin Payout Request
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (Number(payoutForm.amount) <= 0 || Number(payoutForm.amount) > availableBalance) {
      alert(`Withdrawal amount must be between $1 and your available balance of ${formatPrice(availableBalance)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: user?.id || 'u_1786134647659',
          partnerName: user?.name || 'shariful',
          ...payoutForm,
          amount: Number(payoutForm.amount)
        })
      });

      if (res.ok) {
        const newPayout = await res.json();
        setPayouts([newPayout, ...payouts]);
        setIsPayoutModalOpen(false);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Submit Direct Personal Account Transfer
  const handlePersonalTransfer = async (e) => {
    e.preventDefault();
    if (Number(transferForm.amount) <= 0 || Number(transferForm.amount) > availableBalance) {
      alert(`Transfer amount must be between $1 and your available balance of ${formatPrice(availableBalance)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: user?.id || 'u_1786134647659',
          partnerName: user?.name || 'shariful',
          ...transferForm,
          amount: Number(transferForm.amount)
        })
      });

      if (res.ok) {
        const newTransfer = await res.json();
        setTransfers([newTransfer, ...transfers]);
        setIsTransferModalOpen(false);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Combine Payouts and Transfers into a unified ledger list
  const combinedTransactions = [
    ...payouts.map(p => ({
      id: p.id,
      name: p.method || 'SWIFT Payout',
      category: 'SWIFT Wire',
      quantity: 1,
      amount: p.amount,
      date: p.createdAt ? p.createdAt.split('T')[0] : 'June 19, 2028',
      status: p.status,
      raw: p
    })),
    ...transfers.map(t => ({
      id: t.id,
      name: t.destinationType || 'Personal Dispatch',
      category: t.provider || 'Mobile Banking',
      quantity: 1,
      amount: t.amount,
      date: t.createdAt ? t.createdAt.split('T')[0] : 'June 19, 2028',
      status: t.status || 'Completed',
      raw: t
    }))
  ].sort((a, b) => new Date(b.raw.createdAt || Date.now()) - new Date(a.raw.createdAt || Date.now()));

  const filteredTransactions = combinedTransactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Category' || t.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
      case 'Dispatched & Completed':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-black uppercase text-emerald-700">Completed</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full bg-yellow-50 border border-yellow-100 text-[9px] font-black uppercase text-amber-700">Pending</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[9px] font-black uppercase text-rose-700">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase text-slate-700">{status}</span>;
    }
  };

  const handleDownloadInvoice = (t) => {
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border shadow/frame
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Header Background Accent Bar
    ctx.fillStyle = '#0f172a'; // slate-950
    ctx.fillRect(12, 12, canvas.width - 24, 110);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('LUXESTAY INVOICE', 40, 75);

    // Invoice Meta
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Invoice No: ${t.id || 'N/A'}`, 430, 60);
    ctx.fillText(`Date: ${t.date || 'N/A'}`, 430, 85);

    // Draw Accent Gold Line below header
    ctx.fillStyle = '#d97706';
    ctx.fillRect(12, 122, canvas.width - 24, 6);

    // Body Metadata Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('BILLED TO:', 40, 185);

    // Billed details
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Name: ${user?.name || 'Partner Host'}`, 40, 215);
    ctx.fillText(`Email: ${user?.email || 'N/A'}`, 40, 240);
    ctx.fillText(`Role: Hotel Manager / Owner`, 40, 265);

    // Invoice Status Badge Box
    const isSuccess = t.status === 'Completed' || t.status === 'Approved' || t.status === 'Dispatched & Completed';
    ctx.fillStyle = isSuccess ? '#ecfdf5' : '#fef9c3';
    ctx.fillRect(400, 180, 160, 45);
    ctx.fillStyle = isSuccess ? '#065f46' : '#854d0e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.status?.toUpperCase() || 'COMPLETED', 480, 208);
    ctx.textAlign = 'left'; // reset alignment

    // Divider Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 310);
    ctx.lineTo(560, 310);
    ctx.stroke();

    // Table Headers
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ITEM DETAILS', 40, 340);
    ctx.fillText('CATEGORY', 260, 340);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', 560, 340);
    ctx.textAlign = 'left';

    // Table divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 355);
    ctx.lineTo(560, 355);
    ctx.stroke();

    // Item values
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(t.name || 'Expense Method', 40, 390);
    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText(t.category || 'N/A', 260, 390);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`$${t.amount || 0}`, 560, 390);
    ctx.textAlign = 'left';

    // Second divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(40, 420);
    ctx.lineTo(560, 420);
    ctx.stroke();

    // Total section
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('TOTAL AMOUNT:', 320, 470);
    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`$${t.amount || 0}`, 560, 472);
    ctx.textAlign = 'left';

    // Thank you text / footer block
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 600, 520, 100);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(40, 600, 520, 100);

    ctx.fillStyle = '#475569';
    ctx.font = 'italic 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for choosing LuxeStay!', 300, 642);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('This is a system-generated receipt. All host payout transactions are secured.', 300, 668);

    // Save as Image trigger
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${t.id || 'TX'}.png`;
    link.click();
  };

  // Pagination calculations for Ledger list
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTx, indexOfLastTx);

  return (
    <PortalLayout role="partner" title="Financials & Wallet">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* PAGE TITLE & VAULT CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => {
                setPayoutForm(prev => ({ ...prev, amount: Math.min(500, availableBalance > 0 ? availableBalance : 500) }));
                setIsPayoutModalOpen(true);
              }}
              className="px-4.5 py-2.5 rounded-full bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Request Admin Cashout
            </button>

            <button 
              onClick={() => {
                setTransferForm(prev => ({ ...prev, amount: Math.min(200, availableBalance > 0 ? availableBalance : 200) }));
                setIsTransferModalOpen(true);
              }}
              className="px-4.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Transfer to Personal Account
            </button>
          </div>
        </div>

        {/* LODGIFY THREE TOP KPI CARDS */}
        {/* TOP FIVE KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Available Balance */}
          <div className="p-4 rounded-xl bg-[#e2f896]/20 border border-[#e2f896]/50 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-500 block">Available Balance</span>
              <span className="p-1 rounded-lg bg-[#e2f896] text-slate-950"><Wallet className="w-3.5 h-3.5" /></span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-950 block">{formatPrice(availableBalance)}</span>
              <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">Ready for Immediate Cashout</span>
            </div>
          </div>

          {/* Card 2: Net Earnings (85%) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Net Income (85%)</span>
              <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">{formatPrice(partnerEarnings)}</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">From Confirmed Bookings</span>
            </div>
          </div>

          {/* Card 3: Platform Fee (15%) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Platform Fee (15%)</span>
              <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">{formatPrice(Math.round(totalGross * 0.15))}</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">LuxeStay Commission</span>
            </div>
          </div>

          {/* Card 4: Pending Withdrawals */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Pending Payouts</span>
              <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">{formatPrice(pendingAmount)}</span>
              <span className="text-[9px] text-amber-600 font-bold block mt-0.5">Under Review by Admin</span>
            </div>
          </div>

          {/* Card 5: Gross Earnings */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Gross Bookings</span>
              <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">{formatPrice(totalGross)}</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Gross Reservation Volume</span>
            </div>
          </div>

        </div>

        {/* MIDDLE SECTION: EARNINGS BAR CHART & ALLOCATION DONUT CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Chart Left (7/12 cols) - Monthly Income & Expenses Bar Chart */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Earnings</h3>
              
              <div className="flex items-center gap-4">
                {/* Legends */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#bbf7d0]"></span> Income</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#fef08a]"></span> Expense</span>
                </div>

                <button className="px-3.5 py-1.5 rounded-full bg-[#e2f896] text-slate-900 text-xs font-black flex items-center gap-1 cursor-pointer">
                  <span>This Year</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Monthly Double Bar Chart SVG */}
            <div className="h-56 w-full flex items-end justify-between gap-2.5 pt-4 px-2">
              {monthlyChartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex justify-center gap-0.5 items-end h-full">
                    {/* Income Bar */}
                    <div style={{ height: `${item.inc}%` }} className="w-1.5 bg-[#bbf7d0] rounded-t-sm"></div>
                    {/* Expense Bar */}
                    <div style={{ height: `${item.exp}%` }} className="w-1.5 bg-[#fef08a] rounded-t-sm"></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Right (5/12 cols) - Outflow Donut Breakdown */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Allocation</h3>
              
              {/* Segmented tabs */}
              <div className="bg-slate-100 p-0.5 rounded-full flex gap-0.5 text-xs font-bold text-slate-500">
                <button 
                  onClick={() => setActiveTab('Income')} 
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${activeTab === 'Income' ? 'bg-[#e2f896] text-slate-950 shadow-xs' : 'hover:text-slate-800'}`}
                >
                  Income
                </button>
                <button 
                  onClick={() => setActiveTab('Outflow')} 
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${activeTab === 'Outflow' ? 'bg-[#e2f896] text-slate-950 shadow-xs' : 'hover:text-slate-800'}`}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Donut & Legends */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              
              {/* Donut circle */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                {activeTab === 'Outflow' ? (
                  <>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray={`${swiftPercent} 100`} strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#bbf7d0" strokeWidth="4.5" />
                      <path strokeDasharray={`${mobilePercent} 100`} strokeDashoffset={`-${swiftPercent}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fef08a" strokeWidth="4.5" />
                      <path strokeDasharray={`${wisePercent} 100`} strokeDashoffset={`-${swiftPercent + mobilePercent}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#93c5fd" strokeWidth="4.5" />
                      <path strokeDasharray={`${cryptoPercent} 100`} strokeDashoffset={`-${swiftPercent + mobilePercent + wisePercent}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#c084fc" strokeWidth="4.5" />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-base font-black text-slate-900">{formatPrice(paidOutAmount + personalDispatchedAmount)}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Outflow</span>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray={`${deluxePercent} 100`} strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#bbf7d0" strokeWidth="4.5" />
                      <path strokeDasharray={`${suitePercent} 100`} strokeDashoffset={`-${deluxePercent}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fef08a" strokeWidth="4.5" />
                      <path strokeDasharray={`${standardPercent} 100`} strokeDashoffset={`-${deluxePercent + suitePercent}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#93c5fd" strokeWidth="4.5" />
                      <path strokeDasharray={`${otherPercent} 100`} strokeDashoffset={`-${deluxePercent + suitePercent + standardPercent}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#c084fc" strokeWidth="4.5" />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-base font-black text-slate-900">{formatPrice(partnerEarnings)}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Income</span>
                    </div>
                  </>
                )}
              </div>

              {/* Breakdown Labels list */}
              {activeTab === 'Outflow' ? (
                <div className="space-y-2 text-[11px] font-bold text-slate-600 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#bbf7d0]"></span>
                      <span>Salaries & Admin Cashout ({swiftPercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(swiftTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fef08a]"></span>
                      <span>Mobile Banking ({mobilePercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(mobileTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]"></span>
                      <span>Online / Wise ({wisePercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(wiseTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]"></span>
                      <span>Crypto USDT ({cryptoPercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(cryptoTotal)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-[11px] font-bold text-slate-600 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#bbf7d0]"></span>
                      <span>Deluxe Rooms ({deluxePercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(deluxeIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fef08a]"></span>
                      <span>Suite Rooms ({suitePercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(suiteIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]"></span>
                      <span>Standard Rooms ({standardPercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(standardIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]"></span>
                      <span>Other Bookings ({otherPercent}%)</span>
                    </div>
                    <span className="text-slate-950 font-extrabold">{formatPrice(otherIncome)}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: TRANSACTIONS LIST LEDGER */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/70 shadow-2xs space-y-4">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-slate-900">Transactions</h3>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-full border border-slate-200 text-xs bg-slate-50 outline-none w-44 font-semibold"
                />
              </div>

              {/* Category dropdown */}
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
              >
                <option value="All Category">All Category</option>
                <option value="SWIFT">SWIFT Wire</option>
                <option value="Mobile">Mobile money</option>
              </select>

              {/* Status dropdown */}
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs outline-none cursor-pointer font-bold"
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-bold text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  <th className="py-4 px-5">Expense / Method</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Quantity</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/30">
                    <td className="py-4 px-5 text-slate-900 font-extrabold">{t.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{t.category}</td>
                    <td className="py-4 px-4">1</td>
                    <td className="py-4 px-4 text-slate-900 font-black">{formatPrice(t.amount)}</td>
                    <td className="py-4 px-4 text-slate-400 font-medium">{t.date}</td>
                    <td className="py-4 px-4">{renderStatusBadge(t.status)}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => setSelectedTxForInvoice(t)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors" 
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice(t)}
                          className="px-3 py-1.5 rounded-lg bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs text-[10px]" 
                          title="Download Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                      No financial records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400">
              <div>
                Showing {indexOfFirstTx + 1}-{Math.min(indexOfLastTx, filteredTransactions.length)} of {filteredTransactions.length}
              </div>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-600 font-extrabold"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7.5 h-7.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        currentPage === pageNum 
                          ? 'bg-[#e2f896] text-slate-950 shadow-2xs scale-105' 
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-600 font-extrabold"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 1. REQUEST ADMIN CASHOUT MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-slate-800 animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold !text-white">Request Payout from Admin</h3>
                  <p className="text-[10px] text-emerald-200">Withdraw available host wallet balance to bank</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="p-6 space-y-4 text-xs font-semibold">
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-emerald-600 font-extrabold uppercase tracking-wider">
                    Cashout Amount ($ USD) *
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <button 
                      type="button" 
                      onClick={() => setPayoutForm({ ...payoutForm, amount: Math.max(1, Math.round(availableBalance / 2)) })}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                    >
                      50% Balance
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPayoutForm({ ...payoutForm, amount: availableBalance })}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer"
                    >
                      Max ({formatPrice(availableBalance)})
                    </button>
                  </div>
                </div>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={availableBalance}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-bold text-lg text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  Preferred Payout Method *
                </label>
                <select 
                  value={payoutForm.method}
                  onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold cursor-pointer text-slate-800"
                >
                  <option value="International Bank Wire (SWIFT)">International Bank Wire (SWIFT)</option>
                  <option value="PayPal Payment Gateway Transfer">PayPal Transfer</option>
                  <option value="Wise / Payoneer Email Transfer">Wise / Payoneer Transfer</option>
                  <option value="bKash / Nagad Mobile Wallet Cashout">bKash / Nagad Mobile Wallet</option>
                  <option value="USDT Crypto Wallet Address (TRC-20)">USDT Crypto Address (TRC-20)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  Recipient Account Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={payoutForm.accountName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">
                    Bank Name / Gateway Name
                  </label>
                  <input 
                    type="text" 
                    value={payoutForm.bankName}
                    onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">
                    Account Details / SWIFT / Phone *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={payoutForm.accountDetails}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountDetails: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-slate-800"
                >
                  {loading ? 'Submitting...' : 'Submit Cashout Request'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. TRANSFER TO PERSONAL ACCOUNT MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-slate-800 animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold !text-white">Transfer Funds to Personal Account</h3>
                  <p className="text-[10px] text-emerald-200">Dispatch money directly to your Bank, bKash/Nagad or PayPal</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePersonalTransfer} className="p-6 space-y-4 text-xs font-semibold">
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-emerald-600 font-extrabold uppercase tracking-wider">
                    Transfer Amount ($ USD) *
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <button 
                      type="button" 
                      onClick={() => setTransferForm({ ...transferForm, amount: Math.max(1, Math.round(availableBalance / 2)) })}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                    >
                      50% Balance
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTransferForm({ ...transferForm, amount: availableBalance })}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer"
                    >
                      Max ({formatPrice(availableBalance)})
                    </button>
                  </div>
                </div>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={availableBalance}
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-bold text-lg text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  Personal Destination Channel *
                </label>
                <select 
                  value={transferForm.destinationType}
                  onChange={(e) => setTransferForm({ ...transferForm, destinationType: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold cursor-pointer text-slate-800"
                >
                  <option value="Personal Bank Account">Personal Bank Account (DBBL, City Bank, HSBC, EBL)</option>
                  <option value="Mobile Banking (bKash/Nagad)">Mobile Banking (bKash Personal / Nagad Wallet)</option>
                  <option value="PayPal / Wise Personal Account">PayPal / Wise / Payoneer Personal Email</option>
                  <option value="Crypto USDT Wallet (TRC-20)">USDT Crypto Wallet (TRC-20 / ERC-20 Address)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  Personal Account Holder Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={transferForm.accountName}
                  onChange={(e) => setTransferForm({ ...transferForm, accountName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">
                    Bank / Service Provider Name
                  </label>
                  <input 
                    type="text" 
                    value={transferForm.provider}
                    onChange={(e) => setTransferForm({ ...transferForm, provider: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">
                    Account / Phone / IBAN Details *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={transferForm.accountNumber}
                    onChange={(e) => setTransferForm({ ...transferForm, accountNumber: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 font-bold flex items-center justify-between">
                <span>Transfer Processing Fee:</span>
                <span>$0.00 (Instant Free Dispatch)</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#e2f896] text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {loading ? 'Dispatching...' : 'Dispatch to Personal Account'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* 3. VIEW INVOICE MODAL */}
      {selectedTxForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-slate-800 animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
              <h3 className="text-sm font-black flex items-center gap-2 !text-white">
                <FileText className="w-5 h-5 text-amber-500" />
                LuxeStay Invoice
              </h3>
              <button 
                onClick={() => setSelectedTxForInvoice(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs font-bold text-slate-600">
              
              {/* Logo / Billed To */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">LuxeStay</h2>
                  <span className="text-[10px] text-slate-400 font-semibold block">Platform Host Payment System</span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase">
                    {selectedTxForInvoice.status}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-1">Invoice ID: {selectedTxForInvoice.id}</span>
                </div>
              </div>

              {/* Billed info */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[10px] text-slate-500">
                <div className="flex justify-between">
                  <span>Billed To:</span>
                  <span className="text-slate-800 font-black">{user?.name || 'Partner Host'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Host Email:</span>
                  <span className="text-slate-800 font-black">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issued Date:</span>
                  <span className="text-slate-800 font-black">{selectedTxForInvoice.date}</span>
                </div>
              </div>

              {/* Items Details Table */}
              <div className="border border-slate-200/70 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider text-[9px]">
                      <th className="py-2.5 px-4">Item Details</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-semibold text-slate-700">
                      <td className="py-3 px-4 font-black">{selectedTxForInvoice.name}</td>
                      <td className="py-3 px-4">{selectedTxForInvoice.category}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">{formatPrice(selectedTxForInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Block */}
              <div className="flex justify-between items-center text-xs font-black text-slate-900 border-t border-slate-100 pt-3">
                <span>Total Amount:</span>
                <span className="text-base text-emerald-600 font-extrabold">{formatPrice(selectedTxForInvoice.amount)}</span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button 
                  onClick={() => setSelectedTxForInvoice(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDownloadInvoice(selectedTxForInvoice)}
                  className="px-5 py-2.5 rounded-xl bg-[#e2f896] text-slate-950 hover:bg-[#d4ed83] flex items-center gap-1.5 shadow-md font-black cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" /> Download Receipt
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};

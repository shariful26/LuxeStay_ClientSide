import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Globe, ChevronDown, Check, Reply, Filter, Smile, Frown, Sparkles, Send, MapPin, Award } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

import { getInstantData } from '../../utils/instantCache';

export const ManagerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(() => getInstantData('reviews', []));
  const [replyInputs, setReplyInputs] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('Last 7 Days');
  const [filterRating, setFilterRating] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
          try { localStorage.setItem('luxestay_cache_reviews', JSON.stringify(data)); } catch (e) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRating]);

  const handleReplySubmit = (reviewId, replyText) => {
    if (!replyText.trim()) return;
    setLoadingId(reviewId);
    
    fetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: replyText })
    })
      .then(res => res.json())
      .then(updatedReview => {
        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
        setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
        setLoadingId(null);
      })
      .catch(() => setLoadingId(null));
  };

  // Calculate dynamic stats
  const totalReviewsCount = reviews.length || 1;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1);

  // Dynamic category calculations
  const getCategoryAvg = (catKey) => {
    return (reviews.reduce((sum, r) => sum + (r.categories?.[catKey] || 4.5), 0) / totalReviewsCount).toFixed(1);
  };

  const facilitiesAvg = getCategoryAvg('facilities');
  const cleanlinessAvg = getCategoryAvg('cleanliness');
  const servicesAvg = getCategoryAvg('services');
  const comfortAvg = getCategoryAvg('comfort');
  const foodAvg = getCategoryAvg('food');

  // Dynamic Review Rating Text
  const getRatingLabel = (score) => {
    const ratingVal = parseFloat(score);
    if (ratingVal >= 4.5) return 'Impressive';
    if (ratingVal >= 4.0) return 'Excellent';
    if (ratingVal >= 3.0) return 'Good';
    return 'Average';
  };

  const ratingLabel = getRatingLabel(avgRating);

  // Dynamic Country Stats Calculation
  const getCountryStats = () => {
    const counts = {};
    reviews.forEach(r => {
      const country = r.guestCountry || 'United States of America';
      counts[country] = (counts[country] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([country, count]) => ({
        country,
        count,
        percent: Math.round((count / totalReviewsCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const countryStats = getCountryStats();

  // Dynamic Weekly Review Statistics Chart data relative to the latest review date
  const getDailyChartData = () => {
    if (reviews.length === 0) return [];
    
    // Sort reviews to find the latest review date
    const latestReview = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const latestDate = latestReview?.createdAt ? new Date(latestReview.createdAt) : new Date();

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(latestDate.getTime());
      d.setDate(latestDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      // Filter reviews on this date
      const dayReviews = reviews.filter(r => {
        const rDate = r.createdAt ? r.createdAt.split('T')[0] : '';
        return rDate === dateStr;
      });

      const pos = dayReviews.filter(r => r.rating >= 4.0).length;
      const neg = dayReviews.filter(r => r.rating < 4.0).length;

      data.push({
        date: displayStr,
        posCount: pos,
        negCount: neg
      });
    }

    const maxCount = Math.max(...data.map(d => d.posCount + d.negCount), 1);
    return data.map(d => ({
      date: d.date,
      // Scale heights with minimum height for visualization
      pos: d.posCount > 0 ? Math.round((d.posCount / maxCount) * 80) : 0,
      neg: d.negCount > 0 ? Math.round((d.negCount / maxCount) * 80) : 0,
      rawPos: d.posCount,
      rawNeg: d.negCount
    }));
  };

  const weeklyChartData = getDailyChartData();

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    if (filterRating === 'All') return true;
    if (filterRating === 'Positive') return r.rating >= 4.0;
    if (filterRating === 'Negative') return r.rating < 4.0;
    return true;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  return (
    <PortalLayout role="manager" title="Guest Reviews & Ratings">
      <div className="w-full space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
        
        {/* TITLE PAGE HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reviews</h1>
          <span className="px-3 py-1.5 rounded-full bg-[#e2f896] text-slate-955 text-xs font-black shadow-xs flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> {ratingLabel} Rating
          </span>
        </div>

        {/* TOP ROW: REVIEW STATISTICS & OVERALL RATING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* 1. Review Statistics (7/12 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Review Statistics</h3>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#bbf7d0]"></span> Positive</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#fef08a]"></span> Negative</span>
                </div>
                
                <select 
                  value={statsPeriod} 
                  onChange={(e) => setStatsPeriod(e.target.value)}
                  className="px-3.5 py-1.5 rounded-full bg-[#e2f896] text-slate-900 text-xs font-black outline-none border-none cursor-pointer"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Statistics Bar Chart SVG */}
            <div className="h-52 w-full flex items-end justify-between gap-3 px-2 pt-2">
              {weeklyChartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex justify-center gap-1 items-end h-full">
                    {/* Positive Bar */}
                    <div style={{ height: `${item.pos}%` }} className="w-2 bg-[#bbf7d0] rounded-t-xs"></div>
                    {/* Negative Bar */}
                    <div style={{ height: `${item.neg}%` }} className="w-2 bg-[#fef08a] rounded-t-xs"></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{item.date}</span>
                </div>
              ))}
              {weeklyChartData.length === 0 && (
                <div className="text-center w-full py-20 text-xs text-slate-400 font-semibold">
                  No review history records found yet.
                </div>
              )}
            </div>
          </div>

          {/* 2. Overall Rating Gauge & Category Scores (5/12 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Overall Rating</h3>
              <select className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[10px] font-black border-none outline-none cursor-pointer">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              
              {/* Semi-circular gauge */}
              <div className="flex flex-col items-center justify-center flex-shrink-0 space-y-2">
                <div className="relative w-28 h-16 flex items-end justify-center overflow-hidden">
                  <svg className="w-28 h-28 absolute top-0" viewBox="0 0 36 36">
                    {/* Background Arc */}
                    <path strokeDasharray="50 100" strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    {/* Colored Rating Arc */}
                    <path strokeDasharray={`${(parseFloat(avgRating) / 5) * 50} 100`} strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#bbf7d0" strokeWidth="4" />
                  </svg>
                  
                  <div className="flex flex-col items-center z-10 pb-1">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rating</span>
                    <span className="text-xl font-black text-slate-900">{avgRating}<span className="text-xs text-slate-400">/5</span></span>
                  </div>
                </div>

                <div className="px-4 py-1.5 rounded-xl bg-[#e2f896] text-slate-950 font-black text-[10px] uppercase text-center w-full">
                  {ratingLabel}
                  <span className="text-[9px] block text-slate-600 font-semibold normal-case">from {reviews.length} reviews</span>
                </div>
              </div>

              {/* Progress categories list */}
              <div className="space-y-2.5 text-[10px] font-bold text-slate-500 flex-1 w-full">
                
                {/* Facilities */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Facilities</span>
                    <span className="text-slate-900 font-black">{facilitiesAvg}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${(facilitiesAvg / 5) * 100}%` }} className="h-full bg-emerald-400"></div>
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Cleanliness</span>
                    <span className="text-slate-900 font-black">{cleanlinessAvg}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${(cleanlinessAvg / 5) * 100}%` }} className="h-full bg-emerald-400"></div>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Services</span>
                    <span className="text-slate-900 font-black">{servicesAvg}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${(servicesAvg / 5) * 100}%` }} className="h-full bg-emerald-400"></div>
                  </div>
                </div>

                {/* Comfort */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Comfort</span>
                    <span className="text-slate-900 font-black">{comfortAvg}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${(comfortAvg / 5) * 100}%` }} className="h-full bg-emerald-400"></div>
                  </div>
                </div>

                {/* Food & Dining */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Food and Dining</span>
                    <span className="text-slate-900 font-black">{foodAvg}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${(foodAvg / 5) * 100}%` }} className="h-full bg-emerald-400"></div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* INTERACTIVE GEOGRAPHIC REVIEWS MAP & LIST */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/70 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Reviews by Country</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* World Map SVG representation */}
            <div className="md:col-span-8 h-44 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <Globe className="w-20 h-20 text-[#e2f896]/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              
              {/* Dynamic location badges */}
              {countryStats.slice(0, 3).map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    top: idx === 0 ? '25%' : idx === 1 ? '40%' : '60%',
                    left: idx === 0 ? '20%' : idx === 1 ? '70%' : '45%'
                  }}
                  className="absolute flex flex-col items-center bg-white border border-slate-200 shadow-2xs p-1.5 rounded-lg"
                >
                  <span className="text-[9px] font-black text-slate-900">{item.country} ({item.percent}%)</span>
                </div>
              ))}

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LuxeStay Global Review Source Map</span>
            </div>

            {/* Country list with percentage breakdown */}
            <div className="md:col-span-4 space-y-2 text-[10px] font-bold text-slate-500">
              <div className="flex justify-between items-center text-slate-950 font-black border-b border-slate-100 pb-2">
                <span>Total Customers</span>
                <span>{reviews.length} Reviews</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {countryStats.map((item, idx) => {
                  const colors = ['bg-[#bbf7d0]', 'bg-[#fef08a]', 'bg-[#93c5fd]', 'bg-[#c084fc]', 'bg-[#fca5a5]'];
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                        <span>{item.country}</span>
                      </div>
                      <span className="text-slate-900 font-black">{item.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* CUSTOMER REVIEWS (4-COLUMN GRID CARDS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-950">Customer Reviews</h3>
            
            <div className="flex items-center gap-3">
              <select 
                value={filterRating} 
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-black border-none outline-none cursor-pointer"
              >
                <option value="All">All Feedback</option>
                <option value="Positive">Positive (4+ ★)</option>
                <option value="Negative">Negative (1-3 ★)</option>
              </select>
            </div>
          </div>

          {/* 4-column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentReviews.map((r) => {
              const formattedDate = formatDate(r.createdAt);
              // Get initials for avatar
              const initials = r.guestName ? r.guestName.split(' ').map(n => n[0]).join('') : 'G';
              
              return (
                <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    
                    {/* Header: Avatar, Name, Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e2f896] text-slate-950 flex items-center justify-center font-black text-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-none">{r.guestName}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold mt-1 block">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Star Rating Icons */}
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(r.rating) ? 'fill-amber-400 stroke-amber-400' : 'text-slate-200'
                          }`} 
                        />
                      ))}
                    </div>

                    {/* Review Comment Text */}
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                      "{r.comment}"
                    </p>
                  </div>

                  {/* Owner Reply Area */}
                  <div className="pt-3 border-t border-slate-100 mt-auto">
                    {r.reply ? (
                      <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1">
                        <span className="text-[8px] text-emerald-800 font-black block uppercase tracking-wider">✓ Your Reply:</span>
                        <p className="text-[10px] text-emerald-700 font-bold leading-tight">{r.reply}</p>
                      </div>
                    ) : (
                      // Compact inline input
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="text"
                          placeholder="Reply to guest..."
                          value={replyInputs[r.id] || ''}
                          onChange={(e) => setReplyInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                          className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none text-[10px] text-slate-800 font-bold"
                        />
                        <button 
                          onClick={() => handleReplySubmit(r.id, replyInputs[r.id])}
                          disabled={loadingId === r.id || !replyInputs[r.id]}
                          className="p-2 rounded-lg bg-slate-900 text-white font-black hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredReviews.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                No customer reviews match the selected filter.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-xs font-black cursor-pointer transition-all ${
                      currentPage === pageNum 
                        ? 'bg-[#e2f896] text-slate-950 shadow-xs scale-105' 
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
};

export const PartnerReviews = ManagerReviews;
export default ManagerReviews;

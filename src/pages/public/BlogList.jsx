import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getInstantData, fetchInstantData } from '../../utils/instantCache';

export const BlogList = () => {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState(() => getInstantData('blogs', []));

  useEffect(() => {
    fetchInstantData('/api/blogs', 'blogs', setBlogs);
  }, []);

  return (
    <div className="container pt-16 pb-12 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500 block pt-4">{t('blog') || 'Travel Inspiration'}</span>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">LuxeStay {t('blog') || 'Travel Journal'}</h1>
        <p className="text-sm text-[var(--text-secondary)]">Insiders' guides to world-class resorts, hidden suites, and luxury culture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map(blog => (
          <div key={blog.id} className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden shadow-lg space-y-4 flex flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 badge badge-gold">{blog.category}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {blog.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.readTime}</span>
              </div>
              <Link to={`/blog/${blog.slug || blog.id}`}>
                <h3 className="text-lg font-bold text-[var(--text-primary)] hover:text-amber-500 transition-colors">{blog.title}</h3>
              </Link>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{blog.summary}</p>
            </div>

            <Link to={`/blog/${blog.slug || blog.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline pt-3 border-t border-[var(--border-light)]">
              <span>{t('viewSuite') || 'Read Full Article'}</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

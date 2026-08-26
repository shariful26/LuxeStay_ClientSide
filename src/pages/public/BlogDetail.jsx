import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';

export const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="py-20 text-center font-bold text-slate-500">Loading article...</div>;
  if (!blog) return <div className="py-20 text-center text-rose-500 font-bold">Article not found.</div>;

  return (
    <div className="container max-w-4xl pt-16 pb-12 space-y-8 animate-fade-in">
      <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </Link>

      <div className="space-y-4">
        <span className="badge badge-gold">{blog.category}</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] leading-tight">{blog.title}</h1>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)] border-y border-[var(--border-light)] py-3">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-amber-500" /> {blog.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-500" /> {blog.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> {blog.readTime}</span>
        </div>
      </div>

      <div className="h-96 rounded-3xl overflow-hidden shadow-2xl">
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-[var(--text-secondary)] leading-relaxed space-y-4">
        <p className="text-base font-medium text-[var(--text-primary)]">{blog.summary}</p>
        <p>{blog.content}</p>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans px-4 py-10">
      <div className="max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <span className="bg-blue-600 p-1.5 rounded-lg">
            <Zap className="text-white w-5 h-5" />
          </span>
          <span className="font-bold text-xl tracking-tight text-blue-900">
            SoftKey<span className="text-blue-600">Pro</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-500 mt-2 mb-6">{subtitle}</p>
          {children}
          {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

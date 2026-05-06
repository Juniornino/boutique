import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

export const StatCard = ({ label, value, trend, isUp, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-blue-600">
        <Icon size={20} />
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
      </span>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black">{value}</h3>
  </div>
);

export function NavItem({ active, icon, label, collapsed, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 group ${
        active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' 
        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className={`shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      {!collapsed && <span className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden text-left flex-1">{label}</span>}
      {active && !collapsed && <ArrowUpRight size={14} className="ml-auto opacity-50 animate-pulse shrink-0" />}
    </button>
  );
}

export function ActivityItem({ title, desc, time, type }) {
  const icons = {
    success: <CheckCircle2 size={14} className="text-emerald-500" />,
    warning: <AlertTriangle size={14} className="text-amber-500" />,
    danger: <XCircle size={14} className="text-rose-500" />,
  };
  const bgColors = {
    success: 'bg-emerald-50',
    warning: 'bg-amber-50',
    danger: 'bg-rose-50',
  };

  return (
    <div className="flex gap-4 relative group">
      <div className={`w-9 h-9 rounded-xl ${bgColors[type]} flex items-center justify-center shrink-0 border border-white shadow-sm transition-transform group-hover:scale-110`}>
        {icons[type]}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="text-xs font-black text-slate-800">{title}</p>
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
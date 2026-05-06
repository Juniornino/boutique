import React from 'react';

export const Badge = ({ children, color = 'blue', status }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100'
  };
  
  const statusStyles = {
    'Réussi': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-100',
    'Échoué': 'bg-rose-50 text-rose-700 border-rose-100',
    'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-100',
    'FAILED': 'bg-rose-50 text-rose-700 border-rose-100',
    'Active': 'bg-blue-50 text-blue-700 border-blue-100',
    'Archivé': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const finalStyle = status ? (statusStyles[status] || statusStyles['Active']) : colors[color];
  const extraClasses = status ? 'uppercase tracking-wider' : '';

  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${finalStyle} ${extraClasses}`}>
      {children}
    </span>
  );
};

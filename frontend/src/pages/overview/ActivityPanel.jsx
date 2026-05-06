import React from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { ActivityItem } from '../../components/AdminComponents';

const formatTimeAgoFr = (input) => {
  const date = input instanceof Date ? input : new Date(input);
  const ts = date.getTime();
  if (!Number.isFinite(ts)) return '';

  const diffMs = Date.now() - ts;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 45) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Il y a ${diffD}j`;
};

export function ActivityPanel({ activities, isLoading, onDismiss }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="font-bold mb-6 flex items-center gap-2">
        <Bell size={18} className="text-blue-600" /> Activité système
      </h3>
      <div className="space-y-6 flex-1">
        {isLoading ? (
          <div className="text-sm text-slate-500">Chargement des activités...</div>
        ) : activities.length ? (
          activities.map((a, idx) => (
            <div key={`${a.at || 'na'}-${idx}`} className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <ActivityItem
                  title={a.title}
                  desc={a.desc}
                  time={formatTimeAgoFr(a.at)}
                  type={a.type}
                />
              </div>
              <button
                type="button"
                onClick={() => onDismiss?.(idx)}
                className="shrink-0 mt-1 inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">Aucune activité récente.</div>
        )}
      </div>
      <button className="w-full mt-8 py-3 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all">
        Journal complet
      </button>
    </div>
  );
}

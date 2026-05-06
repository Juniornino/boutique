import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

export function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-500 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
          Commande confirmée !
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Merci pour votre achat. Votre paiement a été traité avec succès.
        </p>

        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 text-left">
          <h3 className="font-bold text-slate-900 mb-4">Vos clés de licence sont en route :</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="text-blue-500 shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-slate-800">Vérifiez votre boîte mail</p>
                <p className="text-sm text-slate-500">Un email contenant vos clés d'activation et les instructions vous a été envoyé.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-slate-800">Notification WhatsApp</p>
                <p className="text-sm text-slate-500">Si vous avez utilisé un numéro mobile lié, vous recevrez également vos clés par message.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button 
            className="flex-1 py-4 flex items-center justify-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            Aller à mon espace client <ArrowRight size={18} />
          </Button>
          <button 
            className="flex-1 py-4 px-6 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            onClick={() => navigate('/shop')}
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  CheckCircle2, 
  Copy, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Smartphone, 
  CreditCard,
  Monitor,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// --- Données de Simulation ---
const PRODUCTS = [
  { id: 1, name: 'Windows 11 Pro', category: 'OS', price: 19500, icon: <Monitor className="w-8 h-8 text-blue-600" />, image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&q=80', description: 'Licence OEM à vie, multilingue.' },
  { id: 2, name: 'Office 2021 Pro Plus', category: 'Bureautique', price: 29500, icon: <FileText className="w-8 h-8 text-orange-600" />, image: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=800&q=80', description: 'Suite complète : Word, Excel, PowerPoint...' },
  { id: 3, name: 'Kaspersky Total Security', category: 'Antivirus', price: 12500, icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />, image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80', description: 'Protection 1 an pour 3 appareils.' },
  { id: 4, name: 'Windows 10 Pro', category: 'OS', price: 16500, icon: <Monitor className="w-8 h-8 text-blue-500" />, image: 'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?w=800&q=80', description: 'Licence Retail, idéale pour mise à jour.' },
  { id: 5, name: 'Office 2019 Pro Plus', category: 'Bureautique', price: 23000, icon: <FileText className="w-8 h-8 text-orange-500" />, image: 'https://images.unsplash.com/photo-1588508065123-287b28e0131c?w=800&q=80', description: 'Pack classique sans abonnement.' },
  { id: 6, name: 'Bitdefender Antivirus Plus', category: 'Antivirus', price: 10500, icon: <ShieldCheck className="w-8 h-8 text-red-600" />, image: 'https://images.unsplash.com/photo-1614064641913-6b71a3061283?w=800&q=80', description: 'Protection légère et performante.' },
];

const MOCK_LICENSES = [
  { id: '1', product: 'Windows 11 Pro', date: '12/04/2024', key: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', status: 'Active' },
  { id: '2', product: 'Office 2021 Pro Plus', date: '05/03/2024', key: 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP', status: 'Utilisée' },
];

// --- Composants UI Réutilisables ---

const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100'
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Application Principale ---

export default function App() {
  const [view, setView] = useState('home'); // home, shop, checkout, dashboard
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [cartItem, setCartItem] = useState(null);
  const [showKeyId, setShowKeyId] = useState(null);

  // Simulation d'achat
  const handleBuy = (product) => {
    setCartItem(product);
    setView('checkout');
    window.scrollTo(0, 0);
  };

  const completeOrder = () => {
    setView('dashboard');
    window.scrollTo(0, 0);
  };

  // Filtrage
  const filteredProducts = selectedCategory === 'Tous' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-900">SoftKey<span className="text-blue-600">Pro</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => setView('home')} className={view === 'home' ? 'text-blue-600' : 'hover:text-blue-600'}>Accueil</button>
            <button onClick={() => setView('shop')} className={view === 'shop' ? 'text-blue-600' : 'hover:text-blue-600'}>Boutique</button>
            <button className="hover:text-blue-600">Support</button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <User size={18} />
              Mon Espace
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
            <button onClick={() => {setView('home'); setIsMenuOpen(false);}} className="block w-full text-left font-medium">Accueil</button>
            <button onClick={() => {setView('shop'); setIsMenuOpen(false);}} className="block w-full text-left font-medium">Boutique</button>
            <button onClick={() => {setView('dashboard'); setIsMenuOpen(false);}} className="block w-full text-left font-medium text-blue-600">Mon Espace</button>
          </div>
        )}
      </nav>

      <main className="pt-24 pb-12">
        {view === 'home' && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 text-center">
              <Badge color="blue">Revendeur Certifié Microsoft</Badge>
              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                Activez vos logiciels <br />
                <span className="text-blue-600">en moins de 60 secondes.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
                Des clés de licence 100% authentiques pour Windows, Office et vos Antivirus préférés. Livraison instantanée par email et support 24/7.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="w-full sm:w-auto h-12 px-8 text-lg" onClick={() => setView('shop')}>
                  Explorer le catalogue <ArrowRight size={20} />
                </Button>
                <div className="flex items-center gap-6 mt-6 sm:mt-0">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">15k+</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Clients</span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">4.9/5</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Avis</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-20 flex flex-wrap justify-center gap-8 grayscale opacity-60">
                <div className="flex items-center gap-2 font-bold italic"><Monitor /> WINDOWS</div>
                <div className="flex items-center gap-2 font-bold italic"><FileText /> OFFICE</div>
                <div className="flex items-center gap-2 font-bold italic"><ShieldCheck /> KASPERSKY</div>
                <div className="flex items-center gap-2 font-bold italic"><Lock /> NORTON</div>
              </div>
            </section>

            {/* Featured Section */}
            <section className="bg-slate-50 py-20 border-y border-slate-200">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-3xl font-bold">Meilleures Ventes</h2>
                    <p className="text-slate-500 mt-2">Les licences les plus demandées par nos clients.</p>
                  </div>
                  <button onClick={() => setView('shop')} className="text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                    Tout voir <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRODUCTS.slice(0, 3).map(product => (
                    <ProductCard key={product.id} product={product} onBuy={() => handleBuy(product)} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Catalogue complet</h2>
              <p className="text-slate-500 mt-2">Trouvez la licence qu'il vous faut au meilleur prix.</p>
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
              <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
                {['Tous', 'OS', 'Bureautique', 'Antivirus'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un logiciel..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onBuy={() => handleBuy(product)} />
              ))}
            </div>
          </div>
        )}

        {view === 'checkout' && cartItem && (
          <div className="max-w-4xl mx-auto px-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Order Summary */}
                <div className="p-8 bg-slate-50 border-r border-slate-200">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingCart size={20} className="text-blue-600" /> Récapitulatif
                  </h3>
                  <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 mb-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      <img src={cartItem.image} alt={cartItem.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold">{cartItem.name}</h4>
                      <p className="text-sm text-slate-500">{cartItem.category}</p>
                    </div>
                    <div className="ml-auto font-bold text-blue-600">
                      {cartItem.price.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                  <div className="space-y-3 text-sm border-t border-slate-200 pt-6">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sous-total</span>
                      <span>{cartItem.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">TVA (0%)</span>
                      <span>0 FCFA</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3 mt-3">
                      <span>Total</span>
                      <span className="text-blue-600">{cartItem.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-6">Paiement Sécurisé</h3>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-blue-600 bg-blue-50/30 rounded-2xl cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 text-white p-1 rounded font-bold text-[10px]">MOMO</div>
                          <span className="font-bold">Mobile Money</span>
                        </div>
                        <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Disponible au Cameroun, Côte d'Ivoire, Bénin, Togo...</p>
                      <input 
                        type="text" 
                        placeholder="Numéro (ex: 699...)" 
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer opacity-70">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-slate-400" />
                          <span className="font-bold text-slate-600">Carte Bancaire</span>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-slate-300 bg-white"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <Button className="w-full py-4 text-lg" onClick={completeOrder}>
                      Confirmer et Payer
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
                      <Lock size={12} /> Transactions chiffrées SSL
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="max-w-6xl mx-auto px-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold">Mon Espace Client</h2>
                <p className="text-slate-500 mt-1">Gérez vos clés et accédez à vos guides d'activation.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setView('shop')}>
                  Acheter une autre clé
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Account Overview */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Utilisateur Démo</h4>
                      <p className="text-sm text-slate-500">demo@example.com</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total dépensé</span>
                      <span className="font-bold">42 500 FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Licences actives</span>
                      <span className="font-bold text-emerald-600">2</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg">
                  <h4 className="font-bold mb-2 flex items-center gap-2"><Smartphone size={20} /> Besoin d'aide ?</h4>
                  <p className="text-blue-100 text-sm mb-4">Un problème d'activation ? Nos techniciens vous répondent par WhatsApp.</p>
                  <button className="w-full bg-white text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                    Contacter le support
                  </button>
                </div>
              </div>

              {/* License List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-xl mb-4">Mes Licences</h3>
                {MOCK_LICENSES.map(license => (
                  <div key={license.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                      <div className="flex gap-4">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 h-fit">
                          {license.product.includes('Windows') ? <Monitor className="text-blue-600" /> : <FileText className="text-orange-600" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{license.product}</h4>
                          <p className="text-xs text-slate-400 font-medium">Acheté le {license.date}</p>
                        </div>
                      </div>
                      <Badge color={license.status === 'Active' ? 'green' : 'orange'}>{license.status}</Badge>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock size={16} className="text-slate-400" />
                        <code className="font-mono font-bold tracking-wider text-slate-700">
                          {showKeyId === license.id ? license.key : '•••••-•••••-•••••-•••••-•••••'}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowKeyId(showKeyId === license.id ? null : license.id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                          title="Afficher la clé"
                        >
                          {showKeyId === license.id ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                          title="Copier la clé"
                          onClick={() => {
                            document.execCommand('copy');
                            // Notification simulée
                          }}
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-4">
                      <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                        <ExternalLink size={14} /> Guide d'activation
                      </button>
                      <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:underline">
                         Télécharger le logiciel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-1 rounded-md">
                  <Zap className="text-white w-4 h-4" />
                </div>
                <span className="font-bold text-lg tracking-tight">SoftKeyPro</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Leader de la distribution de licences numériques authentiques. Livraison garantie et support expert.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Produits</h5>
              <ul className="text-sm text-slate-500 space-y-2">
                <li><button className="hover:text-blue-600">Windows 11/10</button></li>
                <li><button className="hover:text-blue-600">Microsoft Office</button></li>
                <li><button className="hover:text-blue-600">Antivirus Pro</button></li>
                <li><button className="hover:text-blue-600">Serveurs</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Aide</h5>
              <ul className="text-sm text-slate-500 space-y-2">
                <li><button className="hover:text-blue-600">Centre d'aide</button></li>
                <li><button className="hover:text-blue-600">Guides d'activation</button></li>
                <li><button className="hover:text-blue-600">Politique de retour</button></li>
                <li><button className="hover:text-blue-600">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Légal</h5>
              <ul className="text-sm text-slate-500 space-y-2">
                <li><button className="hover:text-blue-600">Mentions légales</button></li>
                <li><button className="hover:text-blue-600">CGV</button></li>
                <li><button className="hover:text-blue-600">Confidentialité</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">© 2024 SoftKeyPro. Tous droits réservés.</p>
            <div className="flex gap-4">
              <div className="w-8 h-5 bg-slate-100 rounded"></div>
              <div className="w-8 h-5 bg-slate-100 rounded"></div>
              <div className="w-8 h-5 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Composants Internes ---

function ProductCard({ product, onBuy }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <Badge color="green">En Stock</Badge>
        </div>
        <div className="absolute -bottom-6 left-6 p-3 bg-white rounded-2xl shadow-md border border-slate-100">
          {product.icon}
        </div>
      </div>
      
      <div className="p-6 pt-10 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
          <div>
            <span className="text-2xl font-black text-blue-600">{product.price.toLocaleString('fr-FR')} FCFA</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prix final</p>
          </div>
          <button 
            onClick={onBuy}
            className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all hover:rotate-3 active:scale-90"
          >
            <ShoppingCart size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
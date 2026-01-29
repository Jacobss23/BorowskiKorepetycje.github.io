import React, { useState, useEffect } from 'react';
import { Booking, TutorProfile, View } from './types';
import PublicCalendar from './components/PublicCalendar';
import AdminDashboard from './components/AdminDashboard';
import AdminProfile from './components/AdminProfile';
import Login from './components/Login';
import { LayoutDashboard, UserCircle, LogOut, BookOpen, GraduationCap, School, ChevronRight, ChevronLeft, Phone, Mail, Lock, Coins, FileText, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('public');
  
  // -- DATA --
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('mathTutor_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState<TutorProfile>(() => {
    const saved = localStorage.getItem('mathTutor_profile');
    const defaultPricing = [
      { title: 'Szkoła Podstawowa', subtitle: '60 minut', price: '80 PLN' },
      { title: 'Liceum / Technikum', subtitle: '60 minut', price: '100 PLN' },
      { title: 'Przygotowanie do Matury', subtitle: '90 minut', price: '140 PLN' }
    ];
    const defaultTerms = `* **Odwoływanie zajęć:** Bezpłatne odwołanie możliwe do 24h przed terminem.\n* **Płatność:** Gotówką lub BLIKiem przed zajęciami.\n* **Spóźnienia:** Czas spóźnienia ucznia odliczany jest od czasu lekcji.`;

    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Add new fields if missing
      return {
          ...parsed,
          pricing: parsed.pricing || defaultPricing,
          terms: parsed.terms || defaultTerms,
          calendarOverrides: parsed.calendarOverrides || []
      };
    }
    return {
      name: 'Jan Kowalski',
      bio: 'Pasjonat matematyki z 5-letnim doświadczeniem. Pomagam uczniom zrozumieć trudne zagadnienia w prosty sposób.',
      photoUrl: '',
      contactEmail: 'kontakt@mathtutor.pl',
      contactPhone: '500 000 000',
      topics: {
        primary: ['Ułamki', 'Geometria'],
        highSchool: ['Równania', 'Funkcje']
      },
      pricing: defaultPricing,
      terms: defaultTerms,
      calendarOverrides: []
    };
  });

  // -- PERSISTENCE --
  useEffect(() => { localStorage.setItem('mathTutor_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('mathTutor_profile', JSON.stringify(profile)); }, [profile]);

  // -- HANDLERS --
  const handleAddBooking = (booking: Booking) => {
    setBookings([...bookings, booking]);
  };

  const handleUpdateStatus = (id: string, status: 'confirmed' | 'rejected') => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const handleUpdateProfile = (newProfile: TutorProfile) => {
    setProfile(newProfile);
  };

  // -- COMPONENTS --

  const MathCaptcha = () => {
    const [solved, setSolved] = useState(false);
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(false);
    const [challenge, setChallenge] = useState({ q: '', a: '' });

    useEffect(() => {
        // Updated Logic: Smaller numbers, Result between 1 and 10
        const op = Math.random() > 0.5 ? '+' : '-';
        let a, b;

        if (op === '+') {
            // Sum max 10
            a = Math.floor(Math.random() * 5) + 1; // 1-5
            b = Math.floor(Math.random() * (10 - a)) + 1; // 1 to (10-a)
        } else {
            // Subtraction, result min 1
            a = Math.floor(Math.random() * 9) + 2; // 2-10
            b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to (a-1)
        }

        const res = op === '+' ? a + b : a - b;
        setChallenge({ q: `${a} ${op} ${b} = ?`, a: res.toString() });
    }, []);

    const checkAnswer = () => {
      if (answer.trim() === challenge.a) {
        setSolved(true);
        setError(false);
      } else {
        setError(true);
        setAnswer('');
      }
    };

    if (solved) {
      return (
        <div className="animate-in fade-in duration-500 space-y-3 mt-4">
          <div className="flex items-center gap-3 text-gray-200">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Phone size={18} /></div>
            <span className="font-mono text-lg">{profile.contactPhone}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-200">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Mail size={18} /></div>
            <span className="font-mono text-lg">{profile.contactEmail}</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">
             Nie gwarantuję że odpowiem na Messenger!
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <Lock size={14} /> Rozwiąż zadanie, aby zobaczyć dane:
        </p>
        <div className="flex gap-2">
          <div className="px-3 py-2 bg-black/40 rounded-lg text-gray-300 font-mono select-none w-40 text-center">
            {challenge.q}
          </div>
          <input 
            type="text" 
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-20 px-3 py-2 rounded-lg glass-input text-center focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Wynik"
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
          />
          <button 
            onClick={checkAnswer}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            Pokaż
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2 animate-pulse">Błędny wynik, spróbuj ponownie.</p>}
      </div>
    );
  };

  // -- PUBLIC VIEW --
  const PublicView = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12 relative z-10">
      {/* Hero Section */}
      <section className="text-center space-y-6 animate-in slide-in-from-bottom duration-700">
         <div className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/20">
            <div className="bg-black rounded-full px-4 py-1 text-sm font-medium text-white">
              Profesjonalne Korepetycje
            </div>
         </div>
         <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
           Zrozum matematykę <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
             raz a dobrze.
           </span>
         </h1>
      </section>

      {/* Main Grid: 2 Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Box 1: About Me (Left Top) */}
        <div className="glass-panel p-8 rounded-3xl hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 relative overflow-hidden animate-in slide-in-from-left duration-700 delay-150">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <UserCircle className="text-blue-500" /> O Mnie
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
                {profile.photoUrl && (
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <img 
                            src={profile.photoUrl} 
                            alt={profile.name} 
                            className="w-32 h-32 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                        />
                    </div>
                )}
                <div className="space-y-4 text-gray-300 leading-relaxed">
                    <p className="font-medium text-white text-lg">{profile.name}</p>
                    <p>{profile.bio}</p>
                </div>
            </div>
        </div>

        {/* Box 2: Topics (Right Top) */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group transform hover:scale-[1.01] transition-all duration-300 animate-in slide-in-from-right duration-700 delay-150 border-t border-white/10 hover:border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="p-4 bg-white/5 rounded-full mb-2 group-hover:bg-white/10 transition-colors relative z-10">
             <BookOpen size={48} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10">Co omawiamy?</h2>
          <p className="text-gray-400 max-w-md relative z-10">
            Sprawdź pełną listę zagadnień dla szkół podstawowych oraz średnich.
          </p>
          <button 
            onClick={() => setCurrentView('public-topics')}
            className="relative z-10 px-8 py-4 bg-white text-black text-lg font-bold rounded-2xl hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 shadow-xl shadow-white/5 hover:shadow-white/20 active:scale-95 group-hover:translate-y-[-2px]"
          >
            Dostępne Tematy <ChevronRight size={20} />
          </button>
        </div>

        {/* Box 3: Pricing & Terms (Left Bottom - SWAPPED) */}
        <div className="glass-panel p-8 rounded-3xl border-t-4 border-t-yellow-500/50 hover:border-t-yellow-400 transition-all duration-300 animate-in slide-in-from-right duration-700 delay-200 flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Coins className="text-yellow-500" /> Cennik i Warunki
                </h2>
                <div className="space-y-4 mb-6">
                    {/* Preview first 2 prices */}
                    {profile.pricing.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                            <div>
                                <span className="text-gray-200 block">{item.title}</span>
                                <span className="text-xs text-gray-500">{item.subtitle}</span>
                            </div>
                            <span className="text-yellow-400 font-bold">{item.price}</span>
                        </div>
                    ))}
                    {profile.pricing.length > 2 && <p className="text-xs text-gray-500 italic">...i więcej opcji</p>}
                </div>
            </div>
            
            <button 
                onClick={() => setCurrentView('pricing')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5 group"
            >
                Zobacz pełny cennik <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Box 4: Contact (Right Bottom - SWAPPED) */}
        <div className="glass-panel p-8 rounded-3xl border-l-4 border-l-green-500/50 hover:border-l-green-400 transition-colors duration-300 animate-in slide-in-from-left duration-700 delay-200">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              Kontakt
            </h2>
            <p className="text-gray-400 text-sm">Masz pytania? Skontaktuj się bezpośrednio.</p>
            <MathCaptcha />
        </div>

      </section>

      {/* Booking Section */}
      <section id="booking" className="scroll-mt-8 animate-in fade-in duration-1000 delay-300">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Zarezerwuj Termin</h2>
        <div className="max-w-4xl mx-auto transform transition-all hover:scale-[1.005] duration-500">
           <PublicCalendar 
             bookings={bookings} 
             profile={profile} 
             onAddBooking={handleAddBooking} 
             onOpenPricing={() => setCurrentView('pricing')}
           />
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} MathTutor. Wszystkie prawa zastrzeżone.</p>
        <button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">
          Panel Administratora
        </button>
      </footer>
    </div>
  );

  // -- TOPICS VIEW --
  const TopicsView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setCurrentView('public')}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-bold text-white">Dostępne Tematy</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
         {/* Primary School (Left) */}
        <div className="glass-panel p-8 rounded-3xl hover:border-green-500/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-green-500/20 rounded-2xl text-green-400">
              <School size={32} />
            </div>
             <div>
              <h2 className="text-2xl font-bold text-white">Szkoła Podstawowa</h2>
              <p className="text-gray-400 text-sm">Egzamin ósmoklasisty i nadrabianie zaległości</p>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {profile.topics.primary.length > 0 ? (
               profile.topics.primary.map(topic => (
                 <li key={topic} className="flex items-center gap-2 text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500" />
                   {topic}
                 </li>
               ))
             ) : (
               <p className="text-gray-500 italic col-span-2">Brak tematów w tej kategorii.</p>
             )}
          </ul>
        </div>

        {/* High School (Right) */}
        <div className="glass-panel p-8 rounded-3xl hover:border-blue-500/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <GraduationCap size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Liceum i Technikum</h2>
              <p className="text-gray-400 text-sm">Przygotowanie do matury i bieżący materiał</p>
            </div>
          </div>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {profile.topics.highSchool.length > 0 ? (
               profile.topics.highSchool.map(topic => (
                 <li key={topic} className="flex items-center gap-2 text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
                   {topic}
                 </li>
               ))
             ) : (
               <p className="text-gray-500 italic col-span-2">Brak tematów w tej kategorii.</p>
             )}
          </ul>
        </div>
      </div>
    </div>
  );

  // -- PRICING VIEW --
  const PricingView = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
            <button 
            onClick={() => setCurrentView('public')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hover:scale-110 active:scale-95"
            >
            <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-4xl font-bold text-white">Cennik i Warunki</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-3xl border-t border-white/10">
                <div className="p-3 bg-yellow-500/20 w-fit rounded-xl text-yellow-400 mb-6">
                    <Coins size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-6">Cennik Zajęć</h2>
                <div className="space-y-6">
                    {profile.pricing.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                            <div>
                                <h3 className="text-lg font-medium text-white">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.subtitle}</p>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">{item.price}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-t border-white/10">
                 <div className="p-3 bg-blue-500/20 w-fit rounded-xl text-blue-400 mb-6">
                    <FileText size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-6">Regulamin i Warunki</h2>
                <div className="text-gray-300 prose prose-invert">
                    <ReactMarkdown>{profile.terms}</ReactMarkdown>
                </div>
            </div>
        </div>
        
        <div className="text-center">
            <button 
                onClick={() => setCurrentView('public')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
                Wróć do Rezerwacji
            </button>
        </div>
    </div>
  );

  // -- ADMIN VIEW --
  const AdminView = () => (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 flex flex-col border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl z-20">
         <div className="p-6 flex items-center justify-center md:justify-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">M</div>
            <span className="hidden md:block font-bold text-white">Admin</span>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setCurrentView('admin-dashboard')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${currentView === 'admin-dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard size={20} /> <span className="hidden md:block">Rezerwacje</span>
            </button>
            <button 
              onClick={() => setCurrentView('admin-profile')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${currentView === 'admin-profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <UserCircle size={20} /> <span className="hidden md:block">Profil & Treść</span>
            </button>
         </nav>

         <div className="p-4 border-t border-white/5">
            <button onClick={() => setIsAdmin(false)} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut size={20} /> <span className="hidden md:block">Wyloguj</span>
            </button>
         </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8 relative z-10">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
          {currentView === 'admin-dashboard' && (
             <AdminDashboard bookings={bookings} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteBooking} />
          )}
          {currentView === 'admin-profile' && (
             <AdminProfile profile={profile} onUpdateProfile={handleUpdateProfile} />
          )}
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
       {/* Background blobs with animation */}
       <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
       <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
       
       {isAdmin ? (
         <AdminView />
       ) : (
         currentView === 'pricing' ? <PricingView /> :
         currentView === 'public-topics' ? <TopicsView /> : <PublicView />
       )}
       
       {showLogin && (
         <Login 
           onLogin={() => { setIsAdmin(true); setShowLogin(false); setCurrentView('admin-dashboard'); }} 
           onCancel={() => setShowLogin(false)} 
         />
       )}
    </div>
  );
};

export default App;
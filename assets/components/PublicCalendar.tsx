import React, { useState, useEffect } from 'react';
import { Booking, TutorProfile } from '../types';
import { ChevronLeft, ChevronRight, Clock, User, Phone, BookOpen, Check, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

interface PublicCalendarProps {
  bookings: Booking[];
  profile: TutorProfile;
  onAddBooking: (booking: Booking) => void;
  onOpenPricing: () => void;
}

const PublicCalendar: React.FC<PublicCalendarProps> = ({ bookings, profile, onAddBooking, onOpenPricing }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'date' | 'time' | 'form' | 'success'>('date');
  
  // Captcha State
  const [captchaChallenge, setCaptchaChallenge] = useState({ a: 0, b: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    topic: '',
    customTopic: '',
    additionalInfo: '',
    acceptedTerms: false
  });

  // Generate captcha when step changes to form
  useEffect(() => {
      if (step === 'form') {
          setCaptchaChallenge({
              a: Math.floor(Math.random() * 5) + 1,
              b: Math.floor(Math.random() * 5) + 1
          });
          setCaptchaAnswer('');
      }
  }, [step]);

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
  const startingPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust to Monday start

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper for consistent date strings (YYYY-MM-DD based on local time)
  const getDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Determine availability logic
  const now = new Date();
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    
    // Safety check if clicked via keyboard or bypass
    if (clickedDate < minDate) return;

    // Check availability override using consistent date string
    const dateStr = getDateStr(clickedDate);
    const override = profile.calendarOverrides?.find(o => o.date === dateStr);
    if (override?.type === 'unavailable') return;

    setSelectedDate(clickedDate);
    setStep('time');
    setSelectedTime(null);
  };

  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 10); // 10 to 20

  const isSlotTaken = (hour: number) => {
    if (!selectedDate) return false;
    const dateStr = getDateStr(selectedDate);
    
    // Buffer logic
    const isExactTaken = bookings.some(b => b.date === dateStr && b.time === `${hour}:00` && b.status !== 'rejected');
    const isPrevTaken = bookings.some(b => b.date === dateStr && b.time === `${hour - 1}:00` && b.status !== 'rejected');
    const isNextTaken = bookings.some(b => b.date === dateStr && b.time === `${hour + 1}:00` && b.status !== 'rejected');

    return isExactTaken || isPrevTaken || isNextTaken;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    
    // Captcha Check
    const expected = captchaChallenge.a + captchaChallenge.b;
    if (parseInt(captchaAnswer) !== expected) {
        alert("Błędny wynik działania matematycznego.");
        return;
    }

    if (!formData.acceptedTerms) {
        alert("Proszę zaakceptować Cennik i Warunki.");
        return;
    }

    const topicFinal = formData.topic === 'Inne' ? formData.customTopic : formData.topic;

    const newBooking: Booking = {
      id: crypto.randomUUID(),
      date: getDateStr(selectedDate),
      time: selectedTime,
      clientName: formData.name,
      clientPhone: formData.phone,
      topic: topicFinal,
      additionalInfo: formData.additionalInfo,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddBooking(newBooking);
    playSuccessSound();
    setStep('success');
  };

  const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

  // --- RENDERING SUB-VIEWS ---

  if (step === 'success') {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 animate-bounce">
          <Check size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Termin zarezerwowany!</h3>
        <p className="text-gray-400 mb-6 max-w-sm mx-auto">
          Potwierdzenie rezerwacji zostanie wysłane na podany numer, nie później niż 18h przed korepetycjami.
        </p>
        <button 
          onClick={() => {
            setStep('date');
            setFormData({ name: '', phone: '', topic: '', customTopic: '', additionalInfo: '', acceptedTerms: false });
            setSelectedDate(null);
            setSelectedTime(null);
          }}
          className="px-6 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Wróć do kalendarza
        </button>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="glass-panel p-6 rounded-2xl max-w-lg mx-auto animate-in slide-in-from-right duration-300">
        <header className="mb-6 border-b border-white/10 pb-4">
            <button onClick={() => setStep('time')} className="text-sm text-gray-400 hover:text-white mb-2">← Wróć</button>
            <h3 className="text-xl font-bold text-white">Uzupełnij dane</h3>
            <p className="text-blue-400 text-sm mt-1">
              {selectedDate?.toLocaleDateString('pl-PL')} • godz. {selectedTime}
            </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
              <User size={14} /> Imię i Nazwisko
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl glass-input"
              placeholder="np. Anna Nowak"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
              <Phone size={14} /> Numer Telefonu
            </label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl glass-input"
              placeholder="np. 500 123 456"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
              <BookOpen size={14} /> Temat
            </label>
            <select
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
              className="w-full px-4 py-3 rounded-xl glass-input appearance-none mb-2"
            >
              <option value="" className="bg-gray-900">-- Wybierz temat --</option>
              <optgroup label="Liceum / Technikum" className="bg-gray-900">
                 {profile.topics.highSchool.map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
              <optgroup label="Szkoła Podstawowa" className="bg-gray-900">
                 {profile.topics.primary.map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
              <option value="Inne" className="bg-gray-900">Inne (wpisz własny)</option>
            </select>
            
            {formData.topic === 'Inne' && (
              <input
                required
                type="text"
                value={formData.customTopic}
                onChange={e => setFormData({...formData, customTopic: e.target.value})}
                className="w-full px-4 py-3 rounded-xl glass-input animate-in fade-in"
                placeholder="Jaki to temat?"
              />
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
              <MessageSquare size={14} /> Dodatkowa wiadomość
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
              className="w-full px-4 py-3 rounded-xl glass-input resize-none"
              rows={2}
              placeholder="Np. proszę o skupienie się na zadaniach tekstowych..."
            />
          </div>
          
          {/* Terms */}
          <div className="flex items-start gap-3 mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
             <input
               type="checkbox"
               id="terms"
               required
               checked={formData.acceptedTerms}
               onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})}
               className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
             />
             <label htmlFor="terms" className="text-sm text-gray-400">
                Zapoznałem/am się z <button type="button" onClick={onOpenPricing} className="text-blue-400 hover:text-blue-300 underline font-medium">Cennikiem i Warunkami</button>.
             </label>
          </div>

          {/* Captcha */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <ShieldCheck size={16} /> Potwierdź, że nie jesteś robotem:
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-3 rounded-xl bg-black/40 text-gray-300 font-mono w-20 text-center select-none">
                    {captchaChallenge.a} + {captchaChallenge.b}
                </div>
                <input
                    type="number"
                    required
                    value={captchaAnswer}
                    onChange={e => setCaptchaAnswer(e.target.value)}
                    placeholder="Wynik"
                    className="flex-1 px-4 py-3 rounded-xl glass-input text-center"
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Zarezerwuj Termin
          </button>
        </form>
      </div>
    );
  }

  if (step === 'time') {
    return (
      <div className="glass-panel p-6 rounded-2xl max-w-lg mx-auto animate-in slide-in-from-right duration-300">
        <header className="mb-6 flex justify-between items-center">
             <button onClick={() => setStep('date')} className="text-sm text-gray-400 hover:text-white">← Kalendarz</button>
             <h3 className="text-xl font-bold text-white text-right">
               {selectedDate?.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
             </h3>
        </header>
        
        <p className="text-center text-gray-400 mb-6">Wybierz godzinę rozpoczęcia:</p>
        
        <div className="grid grid-cols-3 gap-3">
          {timeSlots.map(hour => {
            const taken = isSlotTaken(hour);
            return (
              <button
                key={hour}
                disabled={taken}
                onClick={() => {
                  setSelectedTime(`${hour}:00`);
                  setStep('form');
                }}
                className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2
                  ${taken 
                    ? 'border-white/5 bg-white/5 text-gray-600 cursor-not-allowed line-through' 
                    : 'border-white/20 bg-white/5 hover:bg-blue-600 hover:border-blue-500 text-white hover:shadow-lg hover:shadow-blue-900/40'
                  }`}
              >
                <Clock size={16} />
                {hour}:00
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // DEFAULT: Date View
  return (
    <div className="glass-panel p-4 md:p-8 rounded-3xl select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white capitalize">
          {monthNames[month]} <span className="text-gray-500">{year}</span>
        </h2>
        <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-4 text-center">
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
          <div key={d} className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {/* Padding */}
        {Array.from({ length: startingPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(year, month, day);
          const dateStr = getDateStr(dateObj);
          
          // Conditions
          const isTooSoon = dateObj < minDate;
          const override = profile.calendarOverrides?.find(o => o.date === dateStr);
          const hasBookings = bookings.some(b => b.date === dateStr && b.status !== 'rejected');
          
          const isSpecial = override?.type === 'special';
          const isUnavailable = override?.type === 'unavailable' || isTooSoon;

          // Dynamic Styles
          let baseClasses = "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 border";
          let stateClasses = "text-gray-200 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105";

          if (isUnavailable) {
            stateClasses = "text-gray-700 bg-transparent border-transparent cursor-not-allowed";
          } else if (isSpecial) {
            stateClasses = "bg-orange-500/20 text-orange-200 border-orange-500/50 hover:bg-orange-500/30 shadow-lg shadow-orange-900/20";
          } else if (hasBookings) {
            stateClasses = "bg-blue-900/20 text-blue-100 border-blue-500/20 hover:bg-blue-900/30";
          }

          return (
            <button
              key={day}
              disabled={isUnavailable}
              onClick={() => handleDayClick(day)}
              className={`${baseClasses} ${stateClasses}`}
            >
              <span className={`text-sm md:text-lg font-medium`}>{day}</span>
              {/* Dots indicator */}
              <div className="flex gap-0.5 mt-1 h-1">
                 {hasBookings && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                 {isSpecial && <div className="w-1 h-1 rounded-full bg-orange-400" />}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 text-center flex flex-col gap-2 justify-center items-center">
        <p className="text-sm text-gray-500">Kliknij w dzień, aby sprawdzić dostępne godziny.</p>
        <div className="flex gap-4 text-xs text-gray-600">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500/50"></div> Dni wyjątkowe</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500/50"></div> Zajęte terminy</span>
        </div>
      </div>
    </div>
  );
};

export default PublicCalendar;
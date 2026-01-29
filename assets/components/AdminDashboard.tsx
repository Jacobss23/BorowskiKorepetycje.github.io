import React from 'react';
import { Booking } from '../types';
import { Check, X, Calendar as CalIcon, Phone, Clock, User } from 'lucide-react';

interface AdminDashboardProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'rejected') => void;
  onDelete: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ bookings, onUpdateStatus, onDelete }) => {
  const pending = bookings.filter(b => b.status === 'pending');
  const upcoming = bookings
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white">Panel Rezerwacji</h2>
        <p className="text-gray-400">Zarządzaj zgłoszeniami klientów.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="glass-panel p-4 rounded-xl">
            <p className="text-gray-500 text-xs uppercase font-semibold">Oczekujące</p>
            <p className="text-2xl font-bold text-orange-400">{pending.length}</p>
         </div>
         <div className="glass-panel p-4 rounded-xl">
            <p className="text-gray-500 text-xs uppercase font-semibold">Nadchodzące</p>
            <p className="text-2xl font-bold text-green-400">{upcoming.length}</p>
         </div>
         <div className="glass-panel p-4 rounded-xl">
            <p className="text-gray-500 text-xs uppercase font-semibold">Wszystkie</p>
            <p className="text-2xl font-bold text-blue-400">{bookings.length}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            Nowe Zgłoszenia
          </h3>
          
          {pending.length === 0 ? (
            <p className="text-gray-500 italic">Brak nowych zgłoszeń.</p>
          ) : (
            pending.map(booking => (
              <div key={booking.id} className="glass-panel p-5 rounded-2xl border-l-4 border-l-orange-500 animate-in slide-in-from-left duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg">{booking.clientName}</h4>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Phone size={12} /> {booking.clientPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono bg-white/10 px-2 py-1 rounded-lg text-sm">{booking.date}</p>
                    <p className="text-blue-400 font-bold text-lg">{booking.time}</p>
                  </div>
                </div>
                
                <div className="bg-black/20 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-300"><span className="text-gray-500">Temat:</span> {booking.topic}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                    className="flex-1 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 rounded-xl flex justify-center items-center gap-2 transition-colors"
                  >
                    <Check size={18} /> Potwierdź
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(booking.id, 'rejected')}
                    className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-xl flex justify-center items-center gap-2 transition-colors"
                  >
                    <X size={18} /> Odrzuć
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Zatwierdzone Lekcje
          </h3>
          
          <div className="glass-panel rounded-2xl overflow-hidden">
            {upcoming.length === 0 ? (
               <div className="p-8 text-center text-gray-500">Kalendarz jest pusty.</div>
            ) : (
              upcoming.map((booking, idx) => (
                <div key={booking.id} className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${idx !== upcoming.length -1 ? 'border-b border-white/5' : ''}`}>
                   <div className="flex items-center gap-4">
                      <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20 font-bold text-center w-16">
                        <div className="text-xs uppercase">{new Date(booking.date).toLocaleString('pl-PL', {month: 'short'})}</div>
                        <div className="text-lg">{new Date(booking.date).getDate()}</div>
                      </div>
                      <div>
                        <p className="text-white font-medium">{booking.clientName}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><Clock size={12}/> {booking.time}</span>
                          <span className="flex items-center gap-1"><User size={12}/> {booking.topic}</span>
                        </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => {
                        if(confirm('Czy na pewno chcesz usunąć tę lekcję?')) onDelete(booking.id);
                     }}
                     className="text-gray-600 hover:text-red-400 p-2"
                   >
                     <X size={16} />
                   </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
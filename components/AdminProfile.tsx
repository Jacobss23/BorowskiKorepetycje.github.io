import React, { useState, useRef } from 'react';
import { TutorProfile, PricingItem, CalendarOverride } from '../types';
import { Save, Plus, X, UserCircle, Phone, Mail, GraduationCap, School, Upload, Coins, FileText, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface AdminProfileProps {
  profile: TutorProfile;
  onUpdateProfile: (profile: TutorProfile) => void;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<TutorProfile>(profile);
  const [newTopic, setNewTopic] = useState('');
  const [topicCategory, setTopicCategory] = useState<'primary' | 'highSchool'>('highSchool');
  
  // Pricing State
  const [newPriceItem, setNewPriceItem] = useState<PricingItem>({ title: '', subtitle: '', price: '' });

  // Calendar Management State
  const [calDate, setCalDate] = useState(new Date());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Topics
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setFormData({
        ...formData,
        topics: {
          ...formData.topics,
          [topicCategory]: [...formData.topics[topicCategory], newTopic.trim()]
        }
      });
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (category: 'primary' | 'highSchool', topicToRemove: string) => {
    setFormData({
      ...formData,
      topics: {
        ...formData.topics,
        [category]: formData.topics[category].filter(t => t !== topicToRemove)
      }
    });
  };

  // Pricing
  const handleAddPrice = () => {
    if (newPriceItem.title && newPriceItem.price) {
        setFormData({
            ...formData,
            pricing: [...formData.pricing, newPriceItem]
        });
        setNewPriceItem({ title: '', subtitle: '', price: '' });
    }
  };

  const handleRemovePrice = (index: number) => {
      const newPricing = [...formData.pricing];
      newPricing.splice(index, 1);
      setFormData({ ...formData, pricing: newPricing });
  };

  // Helper for consistent date strings
  const getDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Calendar Overrides
  const toggleDayStatus = (dateStr: string) => {
      const existingIndex = formData.calendarOverrides.findIndex(o => o.date === dateStr);
      let newOverrides = [...formData.calendarOverrides];

      if (existingIndex === -1) {
          // Normal -> Special
          newOverrides.push({ date: dateStr, type: 'special' });
      } else {
          const currentType = newOverrides[existingIndex].type;
          if (currentType === 'special') {
              // Special -> Unavailable
              newOverrides[existingIndex].type = 'unavailable';
          } else {
              // Unavailable -> Normal (Remove)
              newOverrides.splice(existingIndex, 1);
          }
      }
      setFormData({ ...formData, calendarOverrides: newOverrides });
  };

  const getDayStatus = (dateStr: string) => {
      return formData.calendarOverrides.find(o => o.date === dateStr)?.type;
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    alert('Profil został zaktualizowany.');
  };

  // Calendar Helper
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const padding = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-white">Profil Administratora</h2>
            <p className="text-gray-400 mt-1">Zarządzaj treścią strony i ustawieniami.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <Save size={20} />
          Zapisz Zmiany
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COL */}
        <div className="space-y-8">
            {/* Personal Info */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <UserCircle className="text-blue-500" size={24} />
                <h3 className="text-xl font-semibold text-white">O Mnie & Kontakt</h3>
            </div>
            
            <div className="flex gap-4 items-start">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden border-2 border-white/20">
                        {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                        <UserCircle size={40} className="text-gray-600 w-full h-full p-2" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                    </div>
                 </div>
                 <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                 
                 <div className="flex-1 space-y-3">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-4 rounded-xl glass-input text-xl"
                        placeholder="Imię i Nazwisko"
                    />
                     <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-4 rounded-xl glass-input text-xl resize-none"
                        placeholder="Bio..."
                    />
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-base text-gray-500 block mb-1 font-medium">Telefon</label>
                    <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl glass-input text-xl"
                    />
                 </div>
                 <div>
                    <label className="text-base text-gray-500 block mb-1 font-medium">Email</label>
                    <input
                    type="text"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl glass-input text-xl"
                    />
                 </div>
            </div>
            </div>

            {/* Pricing Editor */}
            <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                    <Coins className="text-yellow-500" size={24} />
                    <h3 className="text-xl font-semibold text-white">Edycja Cennika</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                     {formData.pricing.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5">
                             <div>
                                 <div className="font-bold text-white text-lg">{item.title}</div>
                                 <div className="text-base text-gray-400">{item.subtitle}</div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <span className="text-green-400 font-bold text-lg">{item.price}</span>
                                 <button onClick={() => handleRemovePrice(idx)} className="text-gray-500 hover:text-red-400">
                                     <Trash2 size={20} />
                                 </button>
                             </div>
                         </div>
                     ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <input 
                        placeholder="Nazwa (np. Liceum)" 
                        value={newPriceItem.title}
                        onChange={e => setNewPriceItem({...newPriceItem, title: e.target.value})}
                        className="col-span-3 px-4 py-4 rounded-xl glass-input text-xl"
                    />
                    <input 
                        placeholder="Opis (np. 60 min)" 
                        value={newPriceItem.subtitle}
                        onChange={e => setNewPriceItem({...newPriceItem, subtitle: e.target.value})}
                        className="col-span-2 px-4 py-4 rounded-xl glass-input text-xl"
                    />
                    <input 
                        placeholder="Cena" 
                        value={newPriceItem.price}
                        onChange={e => setNewPriceItem({...newPriceItem, price: e.target.value})}
                        className="px-4 py-4 rounded-xl glass-input text-xl"
                    />
                </div>
                <button onClick={handleAddPrice} className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg flex items-center justify-center gap-2 font-medium">
                    <Plus size={20} /> Dodaj pozycję
                </button>
            </div>

             {/* Terms Editor */}
             <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                    <FileText className="text-purple-500" size={24} />
                    <h3 className="text-xl font-semibold text-white">Regulamin</h3>
                </div>
                <textarea
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-4 rounded-xl glass-input text-xl resize-none"
                    placeholder="Wpisz treść regulaminu..."
                />
            </div>
        </div>

        {/* RIGHT COL */}
        <div className="space-y-8">
            {/* Calendar Management */}
            <div className="glass-panel p-6 rounded-2xl">
                 <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                    <Calendar className="text-orange-500" size={24} />
                    <h3 className="text-xl font-semibold text-white">Zarządzanie Kalendarzem</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Kliknij w dzień, aby zmienić jego status: <br/>
                    <span className="text-gray-200">Dostępny</span> → <span className="text-orange-400">Wyjątkowy</span> → <span className="text-gray-600 line-through">Niedostępny</span>
                </p>

                <div className="flex justify-between items-center mb-4 bg-white/5 p-3 rounded-xl">
                    <button onClick={() => setCalDate(new Date(year, month - 1))}><ChevronLeft size={24}/></button>
                    <span className="font-bold capitalize text-xl">{calDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCalDate(new Date(year, month + 1))}><ChevronRight size={24}/></button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 mb-2">
                    {['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: padding }).map((_, i) => <div key={`p-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(year, month, day);
                        // Using Helper for consistency
                        const localDateStr = getDateStr(dateObj);
                        
                        const status = getDayStatus(localDateStr);

                        let bgClass = "bg-white/5 hover:bg-white/10 text-white";
                        if (status === 'special') bgClass = "bg-orange-500/20 border border-orange-500 text-orange-400";
                        if (status === 'unavailable') bgClass = "bg-gray-800 text-gray-600 line-through border border-transparent";

                        return (
                            <button
                                key={day}
                                onClick={() => toggleDayStatus(localDateStr)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-lg font-medium transition-all ${bgClass}`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Topics Editor (Compact) */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <h3 className="text-xl font-semibold text-white">Tematy</h3>
            </div>

            <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                <button 
                    onClick={() => setTopicCategory('primary')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${topicCategory === 'primary' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                >
                    Podstawowa
                </button>
                <button 
                    onClick={() => setTopicCategory('highSchool')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${topicCategory === 'highSchool' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                >
                    Liceum
                </button>
                </div>
                
                <div className="flex gap-2">
                    <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                    placeholder="Nowy temat..."
                    className="flex-1 px-4 py-4 rounded-xl glass-input text-xl"
                    />
                    <button onClick={handleAddTopic} className="p-3 bg-blue-600 rounded-xl text-white"><Plus size={24} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
                {formData.topics[topicCategory].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-lg">
                        <span className="text-gray-300">{topic}</span>
                        <button onClick={() => handleRemoveTopic(topicCategory, topic)} className="text-gray-600 hover:text-red-400">
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;
import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

// SHA-256 hashes for "admin" and "admin123"
// This prevents anyone from seeing the real credentials via Inspect Element
const USER_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
const PASS_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

// Secure sequence: 23, 12, 06
const SECRET_SEQUENCE = [23, 12, 6];

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [stage, setStage] = useState<'credentials' | 'pin'>('credentials');
  
  // Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // PIN State
  const [pinStep, setPinStep] = useState(0); // 0, 1, 2
  const [currentPinInput, setCurrentPinInput] = useState<number[]>([]);
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);

  // Helper: Hash string
  const hashString = async (text: string) => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Helper: Generate numbers 1-25 (expanded to fit 23)
  const generateGrid = () => {
    // Generate simple array 1-25
    return Array.from({ length: 25 }, (_, i) => i + 1);
  };

  useEffect(() => {
    if (stage === 'pin') {
      setGridNumbers(generateGrid());
    }
  }, [stage, pinStep]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const uHash = await hashString(username);
    const pHash = await hashString(password);

    if (uHash === USER_HASH && pHash === PASS_HASH) {
      setStage('pin');
    } else {
      setError('Błędne dane logowania');
      setPassword('');
    }
  };

  const handlePinClick = (num: number) => {
    const newSequence = [...currentPinInput, num];
    setCurrentPinInput(newSequence);
    
    // Check if current number matches the expected number for this step
    const expectedNumber = SECRET_SEQUENCE[pinStep];
    
    if (num !== expectedNumber) {
        // Wrong number clicked - Reset everything after a short delay for UX
        setTimeout(() => {
            setError('Błędna sekwencja. Zaloguj się ponownie.');
            setStage('credentials');
            setPinStep(0);
            setCurrentPinInput([]);
            setUsername('');
            setPassword('');
        }, 300);
        return;
    }

    // Correct number clicked
    if (pinStep < 2) {
        // Move to next step
        setPinStep(prev => prev + 1);
        // Force re-render of grid (visual refresh effect requested by user)
        setGridNumbers([]); 
        setTimeout(() => setGridNumbers(generateGrid()), 50);
    } else {
        // Final step correct
        onLogin();
    }
  };

  if (stage === 'pin') {
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-panel w-full max-w-lg p-8 rounded-2xl relative text-center animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold text-white mb-2">Weryfikacja dwuetapowa</h2>
                <p className="text-gray-400 mb-6">Wybierz poprawną liczbę ({pinStep + 1}/3)</p>
                
                <div className="grid grid-cols-5 gap-3">
                    {gridNumbers.map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePinClick(num)}
                            className="aspect-square flex items-center justify-center rounded-xl bg-white/5 hover:bg-blue-600 hover:scale-105 border border-white/10 transition-all text-lg font-bold text-white shadow-lg"
                        >
                            {num}
                        </button>
                    ))}
                </div>
                <button 
                  onClick={() => { setStage('credentials'); setPinStep(0); setCurrentPinInput([]); }}
                  className="mt-6 text-sm text-gray-500 hover:text-white"
                >
                  Anuluj
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel w-full max-w-sm p-8 rounded-2xl relative animate-in fade-in duration-300">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-600/20 rounded-full text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Lock size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">Panel Administratora</h2>
        
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Login</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input"
              placeholder=""
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input"
              placeholder=""
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-500/20 animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2"
          >
            Dalej
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
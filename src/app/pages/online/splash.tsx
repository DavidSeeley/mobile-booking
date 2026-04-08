/**
 * =========================================================================
 * Splash Page - Landing/Welcome Screen
 * =========================================================================
 * First page of the multi-step form
 */

import { useState, useRef, useEffect } from 'react';
import { Box, Truck, Container, Users, Archive, Hand, KeyRound, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoImage from '../../../assets/BookingLogo.png';
import { supabase } from '@/lib/supabase';
import { useFormData } from '@/context/FormContext';

const services = [
  { label: 'Storage',  Icon: Archive,    color: 'text-amber-400' },
  { label: 'Boxes',    Icon: Box,        color: 'text-orange-400' },
  { label: 'Trailers', Icon: Container,  color: 'text-sky-400' },
  { label: 'Trucks',   Icon: Truck,      color: 'text-emerald-400' },
  { label: 'Movers',   Icon: Users,      color: 'text-violet-400' },
  { label: 'Packers',  Icon: Hand,       color: 'text-rose-400' },
];

function ServiceGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-4 w-fit mx-auto">
      {services.map(({ label, Icon, color }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
          <span className="splash-service-label font-bold text-white drop-shadow">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Splash() {
  const navigate  = useNavigate();
  const { setBuildingId } = useFormData();

  const [pinOpen,   setPinOpen]   = useState(false);
  const [pin,       setPin]       = useState('');
  const [checking,  setChecking]  = useState(false);
  const [pinError,  setPinError]  = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pinOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [pinOpen]);

  const openPin = () => {
    setPin('');
    setPinError(null);
    setPinOpen(true);
  };

  async function handlePinSubmit() {
    if (pin.length !== 4) { setPinError('Please enter a 4-digit PIN.'); return; }
    setChecking(true);
    setPinError(null);
    try {
      if (!supabase) throw new Error('Not connected.');
      const { data, error } = await supabase
        .from('buildings')
        .select('id')
        .eq('pin_code', pin)
        .maybeSingle();
      if (error) throw error;
      if (!data) { setPinError('PIN not recognised. Please try again.'); return; }
      setBuildingId(data.id);
      window.__appStarted = true;
      navigate('/welcome');
    } catch (err) {
      setPinError((err as Error).message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">

      {/* ── Full-screen video background ── */}
      <div className="splash-video-wrap absolute inset-0">
        {/* Oversized iframe trick: scale up so YouTube bars are hidden */}
        <iframe
          src="https://www.youtube.com/embed/x6UOh25MbiQ?autoplay=1&mute=1&loop=1&playlist=x6UOh25MbiQ&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0"
          title="Local Motion background"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="splash-iframe"
        />
        {/* Dark gradient overlay for readability */}
        <div className="splash-overlay absolute inset-0" />
      </div>

      {/* ── Header ── */}
      <header className="splash-header relative w-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* ── Content — centred over video ── */}
      <div className="splash-content relative flex flex-col items-center justify-center text-center px-7">
        <div className="flex flex-col items-center gap-7">
          <h1 className="text-7xl md:text-8xl font-bold text-white drop-shadow-lg leading-tight">
            Moving?
          </h1>

          <ServiceGrid />

          <div className="flex flex-col items-center gap-3 mt-5">
            <button
              type="button"
              onClick={openPin}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl inline-flex items-center gap-2 transition-colors shadow-xl"
            >
              Get Started
              <span className="text-2xl">→</span>
            </button>
            <p className="text-sm font-bold text-white/70">Takes less than 2 minutes</p>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {pinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-500" />
                <h2 className="text-base font-bold text-gray-900">Enter Your PIN</h2>
              </div>
              <button type="button" onClick={() => setPinOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500 text-center">Enter the 4-digit PIN provided by your community.</p>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(null); }}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                placeholder="• • • •"
                className="w-32 text-center text-3xl font-bold tracking-widest border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-gray-900"
              />
              {pinError && (
                <p className="text-sm text-red-500">{pinError}</p>
              )}
              <button
                type="button"
                onClick={handlePinSubmit}
                disabled={checking || pin.length !== 4}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {checking ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : 'Continue →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
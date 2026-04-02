/**
 * =========================================================================
 * Splash Page - Landing/Welcome Screen
 * =========================================================================
 * First page of the multi-step form
 */

import { Settings, Box, Truck, Container, Users, Archive, Hand } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoImage from '../../../assets/BookingLogo.png';

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
  const navigate = useNavigate();

  const handleGetStarted = () => {
    window.__appStarted = true;
    navigate('/welcome');
  };

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
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="splash-settings-btn p-2 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6 text-white" />
        </button>
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
              onClick={handleGetStarted}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl inline-flex items-center gap-2 transition-colors shadow-xl"
            >
              Get Started
              <span className="text-2xl">→</span>
            </button>
            <p className="text-sm font-bold text-white/70">Takes less than 2 minutes</p>
          </div>
        </div>
      </div>

    </div>
  );
}
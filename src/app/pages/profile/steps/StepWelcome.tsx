import logoImage from '../../../../assets/BookingLogo.png';

interface Props {
  onNext: () => void;
}

export function StepWelcome({ onNext }: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">

      {/* ── Full-screen video background ── */}
      <div className="splash-video-wrap absolute inset-0">
        <iframe
          src="https://www.youtube.com/embed/x6UOh25MbiQ?autoplay=1&mute=1&loop=1&playlist=x6UOh25MbiQ&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0"
          title="background"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="splash-iframe"
        />
        <div className="splash-overlay absolute inset-0" />
      </div>

      {/* ── Header ── */}
      <header className="splash-header relative w-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* ── Centred content ── */}
      <div className="splash-content relative flex flex-col items-center justify-center text-center px-7">
        <div className="flex flex-col items-center gap-7">
          <h1 className="text-7xl md:text-8xl font-bold text-white drop-shadow-lg leading-tight">
            Time to Enroll!
          </h1>
          <p className="text-white/70 font-medium text-lg max-w-sm">
            Set up your contact info, buildings, and unit pricing.
          </p>
          <div className="flex flex-col items-center gap-3 mt-5">
            <button
              type="button"
              onClick={onNext}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl inline-flex items-center gap-2 transition-colors shadow-xl"
            >
              Get Started
              <span className="text-2xl">→</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

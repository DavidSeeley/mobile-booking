import { useEffect, useState } from 'react';

interface Props {
  onFinish: () => void;
}

export function StepDone({ onFinish }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay so the animation triggers after mount
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-6">

      {/* Animated checkmark */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 80 80"
          className="w-28 h-28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circle */}
          <circle
            cx="40" cy="40" r="36"
            stroke="#22c55e"
            strokeWidth="5"
            fill="#f0fdf4"
            strokeDasharray="226"
            strokeDashoffset={visible ? 0 : 226}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
          {/* Check */}
          <polyline
            points="22,42 35,55 58,28"
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset={visible ? 0 : 60}
            style={{ transition: 'stroke-dashoffset 0.4s ease-out 0.5s' }}
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Profile Complete!</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Your contact info, buildings, and unit pricing are all set up and saved.
        </p>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="px-10 py-3 rounded-2xl text-sm font-bold text-white bg-[#3d5068] hover:bg-[#2e3d51] transition-colors shadow-md"
      >
        Finish
      </button>

    </div>
  );
}

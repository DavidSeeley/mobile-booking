/**
 * =========================================================================
 * Miscellaneous Page — Multi-Step Form Step 4
 * =========================================================================
 * Asks "What unboxed items are we moving?" with category cards.
 * Multi-select with a slider counter for number of boxes to move.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Guitar, Box } from 'lucide-react';
import logoImage from '../../../assets/BookingLogo.png';
import lampsImage from '../../../assets/Lamps.png';
import cleaningImage from '../../../assets/Cleaning.png';
import screensImage from '../../../assets/Screens.png';
import musicImage from '../../../assets/MusicEquiptment.png';
import sportingImage from '../../../assets/SportingGoods.png';
import kidsImage from '../../../assets/KidsStuff.png';
import { useAppStarted } from '@/hooks/useAppStarted';
import { useFormData } from '@/context/FormContext';
import '@/types'; // Import type definitions

const MISC_CATEGORIES = [
  { id: 'lighting',        label: 'Lighting',        image: lampsImage,    scale: 1.20 },
  { id: 'cleaning',        label: 'Cleaning',        image: cleaningImage, scale: 1.20 },
  { id: 'tvs-monitors',    label: 'TVs and Monitors', image: screensImage,  scale: 1.20 },
  { id: 'music-equipment', label: 'Music Equipment', image: musicImage,    scale: 1.20 },
  { id: 'sporting-goods',  label: 'Sporting Goods',  image: sportingImage, scale: 1.20 },
  { id: 'kids-stuff',      label: 'Kids Stuff',      image: kidsImage,     scale: 1.20 },
];

const SLIDER_MIN = 1;
const SLIDER_MAX = 100;


export default function Miscellaneous() {
  const navigate = useNavigate();
  useAppStarted();
  const { formData, setMiscellaneous } = useFormData();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => formData.miscellaneous?.selectedCategories ?? []
  );
  const [boxCount, setBoxCount] = useState<number>(
    () => formData.miscellaneous?.boxCount ?? 1
  );
  const [boxCountTouched, setBoxCountTouched] = useState<boolean>(
    () => formData.miscellaneous?.boxCount !== undefined
  );

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const sliderPercent = ((boxCount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-2 flex items-center justify-between bg-white flex-shrink-0">
        <img src={logoImage} alt="Local Motion" className="h-7 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 md:px-8 py-3 overflow-y-auto">
        <div className="max-w-3xl">

          {/* Box Count Slider */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Box className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <h2 className="text-gray-900 font-bold" style={{ fontSize: '16px' }}>
                How many boxes would you like moved?
              </h2>
              <span
                className="font-bold text-blue-600 bg-blue-50 rounded-lg px-2 py-0.5 flex-shrink-0"
                style={{ fontSize: '16px', minWidth: '2.5rem', textAlign: 'center' }}
              >
                {boxCount}
              </span>
            </div>
            <div className="relative px-1">
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={1}
                value={boxCount}
                onChange={e => { setBoxCount(Number(e.target.value)); setBoxCountTouched(true); }}
                className="w-full appearance-none h-2 rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--blue-600, #2563eb) ${sliderPercent}%, #d1d5db ${sliderPercent}%)`,
                }}
              />
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Page Title */}
          <div className="flex items-center gap-2 mb-5">
            <Guitar className="h-5 w-5 text-pink-500" />
            <h1 className="text-gray-900 font-bold" style={{ fontSize: '16px' }}>What unboxed items are we moving?</h1>
          </div>

          {/* Category Options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {MISC_CATEGORIES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleCategory(option.id)}
                className="load-size-card"
                data-selected={selectedCategories.includes(option.id)}
              >
                <div className="load-size-icon-wrapper">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className="load-size-icon"
                      style={{ transform: `scale(${option.scale})` }}
                    />
                  ) : (
                    <div className="load-size-icon-placeholder">
                      {option.label.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="load-size-label">{option.label}</span>
              </button>
            ))}
          </div>


        </div>
      </div>

      {/* Footer - Sticky */}
      <footer className="w-full px-6 md:px-8 py-2.5 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            <span className="text-base">←</span>
            Back
          </button>
          <button
            type="button"
            disabled={!boxCountTouched}
            onClick={() => {
              setMiscellaneous({ selectedCategories, boxCount });
              navigate('/confirmation');
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <span className="text-base">→</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
/**
 * =========================================================================
 * Welcome Page - Multi-Step Form Step 1
 * =========================================================================
 * First step of the multi-step form flow
 */

import { useEffect, useState } from 'react';
import { MapPin, Home, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoImage from '../../../assets/BookingLogo.png';
import { AllowanceModal } from '../../components/allowance-modal';
import { DetailCard } from '../../components/detail-card';
import { CalendarPicker } from '../../components/embed-calendar';
import { useAppStarted } from '@/hooks/useAppStarted';
import { useFormData } from '@/context/FormContext';
import { useProfile } from '@/hooks/useProfile';


function toServiceDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default function Welcome() {
  const navigate = useNavigate();
  useAppStarted();
  const { formData, setWelcome } = useFormData();
  const { buildings, loading: buildingsLoading } = useProfile();

  // Filter to only the PIN-selected building
  const filteredBuildings = formData.buildingId
    ? buildings.filter(b => b.id === formData.buildingId)
    : buildings;
  
  const [selectedId, setSelectedId] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{ unitName: string; allowance: number } | null>(null);
  const [moveDate, setMoveDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!calendarOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCalendarOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [calendarOpen]);

  useEffect(() => {
    if (calendarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [calendarOpen]);

  const selectedAddress = filteredBuildings.find((b) => b.id === selectedId) ?? null;
  const aptSizes = selectedAddress?.apartment_sizes ?? [];

  const isValid = !!selectedId && unit.trim() !== '';

  function handleUnitChange(value: string) {
    setUnit(value);
    if (value) {
      const matched = aptSizes.find((a) => a.name === value);
      setModalData({ unitName: value, allowance: matched?.allowance ?? 0 });
    }
  }

  function handleContinue() {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    if (selectedAddress) {
      const matched = aptSizes.find((a) => a.name === unit.trim());
      setWelcome({
        locationLabel: selectedAddress.name,
        locationStreet: selectedAddress.address,
        locationCity: selectedAddress.city,
        locationState: selectedAddress.state,
        locationZip: selectedAddress.zip,
        unitType: unit.trim(),
        allowance: matched?.allowance ?? 0,
      });
      navigate('/contact', {
        state: {
          address: selectedAddress,
          unit: unit.trim(),
          service_date: moveDate ? toServiceDate(moveDate) : '',
          serviceDateDisplay: moveDate ? formatDate(moveDate) : '',
        },
      });
    }
  }

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
      {/* Allowance surprise modal */}
      {modalData && (
        <AllowanceModal
          unitName={modalData.unitName}
          allowance={modalData.allowance}
          onClose={() => setModalData(null)}
          onContinue={() => {
            setModalData(null);
            handleContinue();
          }}
        />
      )}

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-3 md:py-4 flex items-center justify-between bg-white flex-shrink-0">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-4 pb-3">
        <div className="max-w-3xl">
          {/* Address Section Heading */}
          <h2 className="text-gray-900 mb-3 font-bold flex items-center gap-2 section-heading">
            <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
            Which location are you moving to?
          </h2>

          {/* Address Options */}
          <div className="flex flex-col gap-3">
            {buildingsLoading ? (
              <p className="text-gray-400 text-sm">Loading locations…</p>
            ) : filteredBuildings.length === 0 ? (
              <p className="text-gray-400 text-sm">No locations configured. Add buildings in the Profile page.</p>
            ) : (
              filteredBuildings.map((building) => {
                const isSelected = selectedId === building.id;
                return (
                  <label
                    key={building.id}
                    htmlFor={building.id}
                    className={[
                      'location-option-card',
                      isSelected ? 'location-option-card--selected' : '',
                      showErrors && !selectedId ? 'border-red-500' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <input
                      type="radio"
                      id={building.id}
                      name="destination-address"
                      value={building.id}
                      checked={isSelected}
                      onChange={() => { setSelectedId(building.id); setUnit(''); }}
                      className="location-option-radio"
                    />
                    <div className="flex flex-col">
                      <span className="location-option-label">{building.name}</span>
                      <div className="flex flex-row gap-1">
                        <span className="location-option-address">{building.address},</span>
                        <span className="location-option-address">
                          {building.city}, {building.state} {building.zip}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
          {showErrors && !selectedId && (
            <p className="text-red-500 text-sm mt-2">Please select a location.</p>
          )}

          {/* Move Date Card */}
          <div className="mt-5">
            <h2 className="text-gray-900 mb-3 font-bold flex items-center gap-2 section-heading">
              <Calendar className="h-5 w-5 text-teal-500 flex-shrink-0" />
              What date would you like to move?
            </h2>
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="w-full max-w-xs px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-left focus:outline-none focus:border-blue-500 hover:border-blue-400 transition-colors"
            >
              {moveDate ? (
                <span className="text-gray-900">{formatDate(moveDate)}</span>
              ) : (
                <span className="text-gray-500">Select a date...</span>
              )}
            </button>
          </div>

          {/* Unit Section */}
          <div className="mt-5 mb-4">
            <h2 className="text-gray-900 mb-3 font-bold flex items-center gap-2 section-heading">
              <Home className="h-5 w-5 text-orange-500 flex-shrink-0" />
              What type of unit are you moving into?
            </h2>
            <select
              id="unit-number"
              value={unit}
              disabled={!selectedId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className={[
                'w-full max-w-xs px-4 py-3 border-2 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed',
                showErrors && unit.trim() === '' ? 'border-red-500' : 'border-gray-300',
              ].join(' ')}
            >
              <option value="">{selectedId ? 'Select unit type…' : 'Select a location first…'}</option>
              {aptSizes.map((apt) => (
                <option key={apt.id} value={apt.name}>{apt.name}</option>
              ))}
            </select>
            {showErrors && unit.trim() === '' && (
              <p className="text-red-500 text-sm mt-2">Please enter your unit number.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Button */}
      <footer className="w-full px-6 md:px-8 py-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl">
          <button
            type="button"
            onClick={handleContinue}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            Continue
            <span className="text-base">→</span>
          </button>
        </div>
      </footer>

      {/* Calendar Modal */}
      {calendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-dark"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCalendarOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Pick a move date"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl p-2">
            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close calendar"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
            <div className="px-4 pt-4 pb-2">
              <p className="text-gray-700 font-semibold text-sm mb-3">Select your move date</p>
            </div>
            <CalendarPicker
              value={moveDate}
              onChange={(date) => {
                setMoveDate(date);
                setCalendarOpen(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
/**
 * =========================================================================
 * Inventory Page - Multi-Step Form Step 3 of 3 ("Inventory")
 * =========================================================================
 * Asks "How much furniture would you like us to move?" with room cards.
 * Multi-select. If Bedroom is selected and unit is 2 or 3 Bedroom, a modal
 * asks how many bedrooms to move (counter capped at unit size).
 */

import { useState } from 'react';
import { Settings, Package, Minus, Plus, Drill } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoImage from '../../../assets/BookingLogo.png';
import studioIcon from '../../../assets/Studio.png';
import patioIcon from '../../../assets/Patio.png';
import bedroomIcon from '../../../assets/Bedroom.png';
import denIcon from '../../../assets/Den.png';
import livingRoomIcon from '../../../assets/LivingRoom.png';
import diningIcon from '../../../assets/Kitchen.png';
import { useAppStarted } from '@/hooks/useAppStarted';
import { useFormData } from '@/context/FormContext';

const LOAD_SIZES = [
  { id: 'studio',      label: 'Studio',      icon: studioIcon,     scale: 1.56 },
  { id: 'bedroom',     label: 'Bedroom',     icon: bedroomIcon,    scale: 1.56 },
  { id: 'living-room', label: 'Living Room', icon: livingRoomIcon, scale: 1.56 },
  { id: 'dining',      label: 'Dining',      icon: diningIcon,     scale: 1.56 },
  { id: 'den',         label: 'Den',         icon: denIcon,        scale: 1.56 },
  { id: 'patio',       label: 'Patio',       icon: patioIcon,      scale: 1.56 },
];

export default function Inventory() {
  const navigate = useNavigate();
  useAppStarted();
  const { formData, setInventory } = useFormData();

  // Restore selections if user navigated back from Confirmation
  const [selectedLoadSize, setSelectedLoadSize] = useState<string[]>(
    () => formData.inventory?.selectedRooms ?? []
  );
  const [bedroomCount, setBedroomCount] = useState<number>(
    () => formData.inventory?.bedroomCount ?? 1
  );
  const [disassembleBeds, setDisassembleBeds] = useState<boolean | undefined>(
    () => formData.inventory?.disassembleBeds ?? undefined
  );

  // Bedroom-count modal
  const [showBedroomModal, setShowBedroomModal] = useState(false);
  const [modalCount, setModalCount] = useState(1);

  const unitType = formData.welcome?.unitType ?? '';
  const maxBedrooms = unitType === '3 Bedroom' ? 3 : unitType === '2 Bedroom' ? 2 : 1;
  const isMultiBedroom = maxBedrooms >= 2;

  const toggleLoadSize = (id: string) => {
    if (id === 'bedroom') {
      if (selectedLoadSize.includes('bedroom')) {
        // Deselect — clear bedroom from selection and reset count
        setSelectedLoadSize(prev => prev.filter(s => s !== 'bedroom'));
        setBedroomCount(1);
      } else if (isMultiBedroom) {
        // Open modal to ask how many bedrooms
        setModalCount(bedroomCount > 1 ? bedroomCount : 1);
        setShowBedroomModal(true);
      } else {
        // Single-bedroom unit — just select directly
        setSelectedLoadSize(prev => [...prev, 'bedroom']);
        setBedroomCount(1);
      }
      return;
    }
    setSelectedLoadSize(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const confirmBedrooms = () => {
    setBedroomCount(modalCount);
    setSelectedLoadSize(prev =>
      prev.includes('bedroom') ? prev : [...prev, 'bedroom']
    );
    setShowBedroomModal(false);
  };

  const cancelBedrooms = () => {
    setShowBedroomModal(false);
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-2 flex items-center justify-between bg-white flex-shrink-0">
        <img src={logoImage} alt="Local Motion" className="h-7 w-auto" />
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 text-gray-700" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 md:px-8 py-3 overflow-y-auto">
        <div className="max-w-3xl">

          {/* Page Title */}
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-orange-500" />
            <h1 className="text-gray-900 font-bold section-heading">What rooms are we moving?</h1>
          </div>

          {/* Load Size Options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {LOAD_SIZES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleLoadSize(option.id)}
                className="load-size-card"
                data-selected={selectedLoadSize.includes(option.id)}
              >
                <div className="load-size-icon-wrapper">
                  <img
                    src={option.icon}
                    alt={option.label}
                    className="load-size-icon"
                    style={{ transform: `scale(${option.scale})` }}
                  />
                </div>
                <span className="load-size-label">{option.label}</span>

                {/* Bedroom count badge */}
                {option.id === 'bedroom' && selectedLoadSize.includes('bedroom') && bedroomCount > 1 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full inventory-bedroom-badge">
                    {bedroomCount} bedrooms
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bed Disassembly Question */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Drill className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <h2 className="text-gray-900 font-bold section-heading">
                Would you like us to disassemble beds?
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDisassembleBeds(true)}
                className={`inventory-choice-btn ${disassembleBeds === true ? 'inventory-choice-btn-yes' : 'inventory-choice-btn-inactive'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setDisassembleBeds(false)}
                className={`inventory-choice-btn ${disassembleBeds === false ? 'inventory-choice-btn-no' : 'inventory-choice-btn-inactive'}`}
              >
                No
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer - Sticky */}
      <footer className="w-full px-6 md:px-8 py-2.5 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/address')}
            className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            <span className="text-base">←</span>
            Back
          </button>
          <button
            type="button"
            disabled={disassembleBeds === undefined}
            onClick={() => {
              setInventory({ selectedRooms: selectedLoadSize, bedroomCount, disassembleBeds });
              navigate('/miscellaneous');
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <span className="text-base">→</span>
          </button>
        </div>
      </footer>

      {/* Bedroom count modal */}
      {showBedroomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-dark"
        >
          <div className="bg-white rounded-2xl shadow-2xl mx-4 w-full max-w-sm p-6 flex flex-col items-center gap-6">
            {/* Icon + question */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <img src={bedroomIcon} alt="Bedroom" className="h-7 w-7 object-contain" />
              </div>
              <h2 className="text-gray-900 font-bold text-18px">
                How many bedrooms do you want moved?
              </h2>
              <p className="text-gray-500 text-14px">
                Your unit has {maxBedrooms} bedrooms. Select how many to include.
              </p>
            </div>

            {/* Counter */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setModalCount(c => Math.max(1, c - 1))}
                disabled={modalCount <= 1}
                className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>

              <span className="text-gray-900 font-bold inventory-bedroom-count">
                {modalCount}
              </span>

              <button
                type="button"
                onClick={() => setModalCount(c => Math.min(maxBedrooms, c + 1))}
                disabled={modalCount >= maxBedrooms}
                className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <p className="inventory-bedroom-selected">
              {modalCount === 1 ? '1 bedroom' : `${modalCount} bedrooms`} selected
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={cancelBedrooms}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBedrooms}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
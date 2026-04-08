/**
 * =========================================================================
 * Service Selection Page - Multi-Step Form (after Contact, before Address)
 * =========================================================================
 * Collects service preferences and equipment preferences.
 * Refactored to use FormContext for centralized state management.
 * v1.12.305
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Archive, Hand, Users, Box, Truck, Container } from 'lucide-react';
import logoImage from '../../../assets/BookingLogo.png';
import { DetailCard } from '@/components/detail-card';
import { useFormData } from '@/context/FormContext';

const ghostStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  marginBottom: 0,
};

const SERVICES = [
  { id: 'storage',  label: 'Storage',  Icon: Archive,   color: '#f59e0b' },
  { id: 'packers',  label: 'Packers',  Icon: Hand,      color: '#fb7185' },
  { id: 'movers',   label: 'Movers',   Icon: Users,     color: '#a78bfa' },
];

const PREFER_SERVICES = [
  { id: 'boxes',    label: 'Boxes',    Icon: Box,       color: '#f97316' },
  { id: 'trucks',   label: 'Trucks',   Icon: Truck,     color: '#34d399' },
  { id: 'trailers', label: 'Trailers', Icon: Container, color: '#38bdf8' },
];

export default function Service() {
  const navigate = useNavigate();
  const { formData, setService } = useFormData();

  // Navigation guard
  useEffect(() => {
    if (!window.__appStarted) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Local state for selections
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Restore from FormContext on mount
  useEffect(() => {
    if (formData.service?.selectedServices) {
      setSelectedServices(formData.service.selectedServices);
    }
  }, []);

  function toggleService(id: string) {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function handleNext() {
    setService({ selectedServices });
    navigate('/address');
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between bg-white">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 md:px-8 py-8">
        <div className="max-w-3xl flex flex-col gap-2">

          {/* Page Title */}
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 text-orange-500" />
            <h1 className="text-gray-900 font-bold" style={{ fontSize: '22px' }}>Service Selection</h1>
          </div>

          {/* Card — What services work for you? */}
          <DetailCard style={ghostStyle}>
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-orange-500" />
              <h2 className="text-gray-900 font-bold" style={{ fontSize: '16px' }}>What services work for you?</h2>
            </div>
            <div className="flex flex-col gap-3">
              {SERVICES.map(({ id, label, Icon, color }) => {
                const selected = selectedServices.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleService(id)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left w-full',
                      selected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" style={{ color: color }} />
                    <span className="font-semibold" style={{ fontSize: '14px', color: selected ? '#1e40af' : '#374151' }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </DetailCard>

          <hr className="border-t border-slate-500" />

          {/* Card — What do you prefer? */}
          <DetailCard style={ghostStyle}>
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-purple-500" />
              <h2 className="text-gray-900 font-bold" style={{ fontSize: '16px' }}>What do you prefer?</h2>
            </div>
            <div className="flex flex-col gap-3">
              {PREFER_SERVICES.map(({ id, label, Icon, color }) => {
                const selected = selectedServices.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleService(id)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left w-full',
                      selected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" style={{ color: color }} />
                    <span className="font-semibold" style={{ fontSize: '14px', color: selected ? '#1e40af' : '#374151' }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </DetailCard>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 md:px-8 py-3 bg-white border-t border-gray-200">
        <div className="max-w-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            <span className="text-base">←</span>
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            Next
            <span className="text-base">→</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

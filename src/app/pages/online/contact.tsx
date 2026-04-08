/**
 * =========================================================================
 * Contact Page - Multi-Step Form (after Welcome, before Service Selection)
 * =========================================================================
 * Collects name, phone, and preferred time. Move date is collected on Welcome.
 */

import { useState } from 'react';
import { User, Sun, Cloud, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import logoImage from '../../../assets/BookingLogo.png';
import { DetailCard } from '@/components/detail-card';
import FloatingLabelInput from '@/components/floating-label-input';
import { useAppStarted } from '@/hooks/useAppStarted';
import { useFormData } from '@/context/FormContext';

export default function Contact() {
  const navigate = useNavigate();
  const { state } = useLocation();
  useAppStarted();
  const { setContact } = useFormData();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | undefined>(undefined);

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-3 md:py-4 flex items-center justify-between bg-white flex-shrink-0">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-4 pb-3">
        <div className="max-w-3xl flex flex-col gap-2">

          {/* Page Title */}
          <div className="flex items-center gap-3 mb-1">
            <User className="h-6 w-6 text-teal-500" />
            <h1 className="text-gray-900 font-bold" style={{ fontSize: '16px' }}>Let's get to know you!</h1>
          </div>

          {/* Card: Contact Info */}
          <DetailCard>
            <FloatingLabelInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} inputClassName="contact-info-field" />
            <FloatingLabelInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} inputClassName="contact-info-field" />
            <FloatingLabelInput label="Cell Phone" type="tel" format="phone" value={cellPhone} onChange={(e) => setCellPhone(e.target.value)} inputClassName="contact-info-field" />
            <FloatingLabelInput label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} inputClassName="contact-info-field" />
          </DetailCard>

          {/* Time preference heading */}
          <p className="text-gray-900 font-bold mt-3 mb-1 flex items-center gap-2" style={{ fontSize: '16px' }}>
            <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
            What time of day would you like us to arrive?
          </p>

          {/* Time preference card */}
          <DetailCard>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPreferredTime(preferredTime === 'morning' ? undefined : 'morning')}
                className={[
                  'flex-1 flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl border-2 transition-all',
                  preferredTime === 'morning'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                ].join(' ')}
              >
                <Sun className="h-4 w-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                <span className="font-semibold" style={{ fontSize: '14px', color: preferredTime === 'morning' ? '#1e40af' : '#374151' }}>Morning</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredTime(preferredTime === 'afternoon' ? undefined : 'afternoon')}
                className={[
                  'flex-1 flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl border-2 transition-all',
                  preferredTime === 'afternoon'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                ].join(' ')}
              >
                <Cloud className="h-4 w-4 flex-shrink-0" style={{ color: '#38bdf8' }} />
                <span className="font-semibold" style={{ fontSize: '14px', color: preferredTime === 'afternoon' ? '#1e40af' : '#374151' }}>Afternoon</span>
              </button>
            </div>
          </DetailCard>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 md:px-8 py-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/welcome')}
            className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            <span className="text-base">←</span>
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              const service_date = state?.service_date ?? '';
              const serviceDateDisplay = state?.serviceDateDisplay ?? '';
              setContact({ firstName, lastName, cellPhone, email, serviceDate: service_date, serviceDateDisplay, preferredTime });
              navigate('/address', {
                state: {
                  ...state,
                  firstName,
                  lastName,
                  cellPhone,
                  service_date,
                },
              });
            }}
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
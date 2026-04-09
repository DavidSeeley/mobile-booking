/**
 * =========================================================================
 * Profile — Multi-Step Form Controller
 * =========================================================================
 * Steps: Welcome → Contact → Buildings → Units → Review → Done
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useProfile } from '@/hooks/useProfile';
import { createContact } from '../../../api/contactApi';
import type { BuildingAptSizeRow } from '@/lib/supabase';
import { StepWelcome }  from './steps/StepWelcome';
import { StepContact }  from './steps/StepContact';
import { StepBuilding } from './steps/StepBuilding';
import { StepUnits }    from './steps/StepUnits';
import { StepReview }   from './steps/StepReview';
import { StepDone }     from './steps/StepDone';
import { StepFooter }   from './steps/StepFooter';

import type { ContactState } from '@/types/profile';

const STEP_LABELS = ['Welcome', 'Contact', 'Buildings', 'Units', 'Review', 'Done'];
const TOTAL_STEPS = STEP_LABELS.length;

export default function Profile() {
  const navigate = useNavigate();
  const {
    profile, buildings, loading, error,
    insertProfile, addBuilding, updateBuilding, deleteBuilding,
    saveApartmentSizes, addApartmentSize, deleteApartmentSize,
  } = useProfile({ blank: true });

  const [step, setStep] = useState(0);

  // ── Contact ──────────────────────────────────────────────────────────────
  const [contact, setContact] = useState<ContactState>({
    company: '', first_name: '', last_name: '', email: '', phone: '',
    remit_address1: '', remit_address2: '', remit_city: '', remit_state: '', remit_zip: '',
  });
  const [contactSaving, setContactSaving]     = useState(false);
  const [contactSaved, setContactSaved]       = useState(false);
  const [enrolling, setEnrolling]             = useState(false);
  const [enrollError, setEnrollError]         = useState<string | null>(null);

  // Enrollment always starts blank — no pre-fill from existing profile

  async function handleSaveContact() {
    setContactSaving(true);
    try {
      await insertProfile(contact);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2000);
    } finally {
      setContactSaving(false);
    }
  }

  // ── Apartment sizes ──────────────────────────────────────────────────────
  const [aptEdits, setAptEdits] = useState<Record<string, BuildingAptSizeRow[]>>({});
  const [aptSaved, setAptSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    buildings.forEach(b => {
      setAptEdits(prev => ({ ...prev, [b.id]: [...b.apartment_sizes] }));
    });
  }, [buildings]);

  function handleAptChange(buildingId: string, aptRowId: string, field: 'name' | 'allowance', value: string) {
    setAptEdits(prev => ({
      ...prev,
      [buildingId]: (prev[buildingId] ?? []).map(row => {
        if (row.id !== aptRowId) return row;
        if (field === 'allowance') {
          const num = value === '' ? 0 : parseFloat(value);
          return { ...row, allowance: isNaN(num) ? 0 : num };
        }
        return { ...row, name: value };
      }),
    }));
  }

  async function handleDeleteApt(buildingId: string, aptRowId: string) {
    await deleteApartmentSize(buildingId, aptRowId);
    setAptEdits(prev => ({
      ...prev,
      [buildingId]: (prev[buildingId] ?? []).filter(r => r.id !== aptRowId),
    }));
  }

  async function handleAddAptRow(buildingId: string, name: string, allowance: number) {
    await addApartmentSize(buildingId, name, allowance);
  }

  async function handleSaveApts(buildingId: string) {
    const sizes = aptEdits[buildingId] ?? [];
    await saveApartmentSizes(buildingId, sizes);
    setAptSaved(prev => ({ ...prev, [buildingId]: true }));
    setTimeout(() => setAptSaved(prev => ({ ...prev, [buildingId]: false })), 2000);
  }

  // ── Enrollment API ────────────────────────────────────────────────────────
  async function handleConfirm() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      // Compute the max allowance across all unit types for all enrolled buildings
      const allAllowances = buildings.flatMap(b => b.apartment_sizes.map(a => a.allowance));
      const maxAllowance = allAllowances.length > 0 ? Math.max(...allAllowances) : undefined;

      await createContact({
        first_name:   contact.first_name  || undefined,
        last_name:    contact.last_name   || undefined,
        company_name: contact.company     || undefined,
        email:        contact.email,
        main_phone:   contact.phone       || undefined,
        address:      contact.remit_address1 || undefined,
        secondary_address: contact.remit_address2 || undefined,
        city:         contact.remit_city  || undefined,
        state:        contact.remit_state || undefined,
        zip:          contact.remit_zip   || undefined,
        payee:     1,
        allowance: maxAllowance,
      });
      goNext();
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  }

  // ── Nav ───────────────────────────────────────────────────────────────────
  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  async function handleNext() {
    if (step === 1) {
      await handleSaveContact();
    }
    goNext();
  }

  // Footer config per step
  const footerProps = () => {
    switch (step) {
      case 1: return {
        onBack: goBack,
        nextLabel: 'Save & Continue',
        nextDisabled: !contact.company.trim(),
        nextLoading: contactSaving,
        nextSaved: contactSaved,
        onNext: handleNext,
      };
      case 2: return {
        onBack: goBack,
        nextDisabled: buildings.length === 0,
        onNext: goNext,
      };
      case 3: return {
        onBack: goBack,
        onNext: goNext,
      };
      case 4: return {
        onBack: goBack,
        nextLabel: 'Confirm',
        nextLoading: enrolling,
        onNext: handleConfirm,
      };
      case 5: return null; // StepDone has its own buttons
      default: return { onBack: goBack, onNext: goNext };
    }
  };

  const footer = footerProps();

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile…</p>
      </div>
    );
  }

  // Welcome step — full screen, no chrome
  if (step === 0) {
    return <StepWelcome onNext={goNext} />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <h1 className="text-gray-900 font-bold flex-1 text-lg">Payee Profile</h1>
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.slice(1, -1).map((label, i) => {
              const stepIndex = i + 1;
              const isActive  = stepIndex === step;
              const isDone    = stepIndex < step;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`flex items-center justify-center rounded-full text-xs font-bold w-6 h-6 transition-colors ${
                    isActive ? 'bg-[#3d5068] text-white' :
                    isDone   ? 'bg-green-500 text-white' :
                               'bg-gray-200 text-gray-400'
                  }`}>
                    {isDone ? '✓' : stepIndex}
                  </div>
                  {i < STEP_LABELS.slice(1, -1).length - 1 && (
                    <div className={`h-px w-4 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mx-6 mt-4">
          {error}
        </p>
      )}
      {enrollError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mx-6 mt-4">
          Enrollment failed: {enrollError}
        </p>
      )}

      {/* Step content */}
      <div className="flex-1 px-6 md:px-8 py-8 flex flex-col items-center">
        {step === 1 && (
          <StepContact contact={contact} onChange={setContact} />
        )}
        {step === 2 && (
          <StepBuilding
            buildings={buildings}
            onAdd={addBuilding}
            onUpdate={updateBuilding}
            onDelete={deleteBuilding}
          />
        )}
        {step === 3 && (
          <StepUnits
            buildings={buildings}
            aptEdits={aptEdits}
            onAptChange={handleAptChange}
            onAddAptRow={handleAddAptRow}
            onDeleteApt={handleDeleteApt}
            onSaveApts={handleSaveApts}
            aptSaved={aptSaved}
          />
        )}
        {step === 4 && (
          <StepReview contact={contact} buildings={buildings} />
        )}
        {step === 5 && (
          <StepDone onFinish={() => navigate('/profile')} />
        )}
      </div>

      {/* Shared footer nav */}
      {footer && <StepFooter {...footer} />}

    </div>
  );
}

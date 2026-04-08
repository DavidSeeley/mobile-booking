import { UserCircle, MapPin } from 'lucide-react';
import { DetailCard } from '../../../components/detail-card';
import type { ContactState } from '@/types/profile';
import { formatPhone } from '@/utils/formatPhone';

interface Props {
  contact: ContactState;
  onChange: (contact: ContactState) => void;
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function StepContact({ contact, onChange }: Props) {
  return (
    <div className="max-w-3xl w-full mx-auto space-y-5">

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-6 items-start">

        {/* ── Left: Contact Information ── */}
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 rounded-xl p-2.5 mt-0.5">
              <UserCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contact information</h2>
              <p className="text-sm text-gray-500 mt-1">This will appear on invoices and communications sent to your residents.</p>
            </div>
          </div>
          <DetailCard className="admin-table-card overflow-hidden">
            <div className="p-5 grid grid-cols-1 gap-4">

              <Field label="Company">
                <input
                  type="text"
                  placeholder="Acme Properties"
                  value={contact.company}
                  onChange={e => onChange({ ...contact, company: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name">
                  <input
                    type="text"
                    placeholder="Jane"
                    value={contact.first_name}
                    onChange={e => onChange({ ...contact, first_name: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text"
                    placeholder="Smith"
                    value={contact.last_name}
                    onChange={e => onChange({ ...contact, last_name: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={contact.email}
                    onChange={e => onChange({ ...contact, email: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    placeholder="(612) 555-0100"
                    value={contact.phone}
                    onChange={e => onChange({ ...contact, phone: formatPhone(e.target.value) })}
                    inputMode="numeric"
                    maxLength={14}
                    className={inputCls}
                  />
                </Field>
              </div>

            </div>
          </DetailCard>
        </div>

        {/* ── Right: Remittance Address ── */}
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="bg-orange-50 rounded-xl p-2.5 mt-0.5">
              <MapPin className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Billing address</h2>
              <p className="text-sm text-gray-500 mt-1">Where should invoices and statements be sent?</p>
            </div>
          </div>
          <DetailCard className="admin-table-card overflow-hidden">
            <div className="p-5 grid grid-cols-1 gap-4">

              <Field label="Address 1">
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={contact.remit_address1}
                  onChange={e => onChange({ ...contact, remit_address1: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="Address 2">
                <input
                  type="text"
                  placeholder="Suite 400"
                  value={contact.remit_address2}
                  onChange={e => onChange({ ...contact, remit_address2: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="City">
                  <input
                    type="text"
                    placeholder="Minneapolis"
                    value={contact.remit_city}
                    onChange={e => onChange({ ...contact, remit_city: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="State">
                  <input
                    type="text"
                    placeholder="MN"
                    maxLength={2}
                    value={contact.remit_state}
                    onChange={e => onChange({ ...contact, remit_state: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Zip">
                <input
                  type="text"
                  placeholder="55401"
                  maxLength={10}
                  value={contact.remit_zip}
                  onChange={e => onChange({ ...contact, remit_zip: e.target.value })}
                  className={inputCls}
                />
              </Field>

            </div>
          </DetailCard>
        </div>

      </div>
    </div>
  );
}

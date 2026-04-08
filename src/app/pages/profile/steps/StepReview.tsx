import { User, Building2, ClipboardCheck, MapPin } from 'lucide-react';
import { DetailCard } from '../../../components/detail-card';
import type { BuildingWithApts } from '@/hooks/useProfile';
import type { ContactState } from '@/types/profile';

interface Props {
  contact: ContactState;
  buildings: BuildingWithApts[];
}

export function StepReview({ contact, buildings }: Props) {
  return (
    <div className="max-w-lg w-full mx-auto space-y-5">
      <div className="flex items-start gap-3">
        <div className="bg-green-50 rounded-xl p-2.5 mt-0.5">
          <ClipboardCheck className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Does everything look right?</h2>
          <p className="text-sm text-gray-500 mt-1">Review your profile below. Hit Confirm to save, or go back to make changes.</p>
        </div>
      </div>

      {/* Contact summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-orange-500" />
          <h3 className="font-bold text-gray-900 text-sm">Contact</h3>
        </div>
        <DetailCard className="admin-table-card overflow-hidden">
          <div className="px-4 py-3">
            <p className="font-semibold text-gray-900 text-sm">{contact.company || <span className="text-gray-400">—</span>}</p>
          </div>
          <div className="border-t border-gray-100" />
          <div className="px-4 py-3">
            <p className="text-sm text-gray-800">{[contact.first_name, contact.last_name].filter(Boolean).join(' ') || <span className="text-gray-400">—</span>}</p>
          </div>
          <div className="border-t border-gray-100" />
          <div className="grid grid-cols-2 px-4 py-3 gap-3">
            <p className="text-sm text-gray-500">{contact.email || <span className="text-gray-400">—</span>}</p>
            <p className="text-sm text-gray-500">{contact.phone || <span className="text-gray-400">—</span>}</p>
          </div>
        </DetailCard>
      </div>

      {/* Remittance address summary */}
      {(contact.remit_address1 || contact.remit_city) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            <h3 className="font-bold text-gray-900 text-sm">Billing Address</h3>
          </div>
          <DetailCard className="admin-table-card overflow-hidden">
            <div className="px-4 py-3">
              {contact.remit_address1 && <p className="text-sm text-gray-800">{contact.remit_address1}</p>}
              {contact.remit_address2 && <p className="text-sm text-gray-800">{contact.remit_address2}</p>}
              <p className="text-sm text-gray-500 mt-0.5">
                {[contact.remit_city, contact.remit_state, contact.remit_zip].filter(Boolean).join(', ')}
              </p>
            </div>
          </DetailCard>
        </div>
      )}

      {/* Buildings summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-orange-500" />
          <h3 className="font-bold text-gray-900 text-sm">Buildings</h3>
        </div>
        <div className="space-y-3">
          {buildings.map(b => (
            <DetailCard key={b.id} className="admin-table-card overflow-hidden">
              <div className="px-4 py-3">
                <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[b.address, b.city, b.state, b.zip].filter(Boolean).join(', ')}
                </p>
              </div>
              {b.apartment_sizes.length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="admin-table-header grid grid-cols-2 px-4 py-1.5">
                    <span className="admin-table-cell text-xs font-bold text-white">Type</span>
                    <span className="admin-table-cell text-xs font-bold text-white">Allowance</span>
                  </div>
                  {b.apartment_sizes.map(apt => (
                    <div key={apt.id} className="grid grid-cols-2 px-4 py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-700">{apt.name}</span>
                      <span className="text-sm text-gray-500">${apt.allowance}</span>
                    </div>
                  ))}
                </>
              )}
            </DetailCard>
          ))}
        </div>
      </div>

    </div>
  );
}

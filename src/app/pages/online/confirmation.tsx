/**
 * =========================================================================
 * Confirmation Page — final summary before order submission
 * =========================================================================
 * Displays all data collected across the form flow via FormContext.
 *
 * On "Submit Order":
 *   1. Validates all required data is present + email is valid
 *   2. Builds SalesOrderRequest via buildSalesOrderPayload()
 *   3. Calls createSalesOrder() — ApiSalesOrder v1.00
 *   4. Shows success panel (lead_id / order_id) or inline error
 *
 * Cards are ghost (transparent / no border) in view mode.
 * Hovering a card reveals a pencil icon; clicking opens inline edit mode.
 *
 * Refactored to use FormContext for centralized state management.
 * v1.12.305
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  CheckCircle, MapPin, Calendar, Package, Home, User, Loader2, AlertCircle,
  Pencil, Phone, Mail, Check, X, ChevronUp, ChevronDown, Sun, Cloud,
  ClipboardCopy, ClipboardCheck, PartyPopper, Building2, BedDouble, MessageSquare, ContactRound, HelpCircle
} from 'lucide-react';
import logoImage from '../../../assets/BookingLogo.png';
import { DetailCard } from '@/components/detail-card';
import { FloatingLabelInput } from '@/components/floating-label-input';
import { createSalesOrder, type SalesOrderSuccessResponse, validateSalesOrderData, formatApiError, buildSalesOrderPayload } from '../../../api/salesOrderApi';
import { SalesOrderApiError } from '../../../api/types';
import { loadAdminVars } from '@/mocks/AdminVar';
import { useRoomSizes } from '@/hooks/useRoomSizes';
import { useProfile } from '@/hooks/useProfile';
import { RouteMap } from '@/components/route-map';
import { useFormData, type ContactData, type AddressData, type WelcomeData, type InventoryData } from '@/context/FormContext';
import type { CardKey, SubmitStatus, SubmitDebugInfo } from '@/types/confirmation';

// ---------------------------------------------------------------------------
// Debug helpers
// ---------------------------------------------------------------------------
function httpStatusLabel(code: number): string {
  const labels: Record<number, string> = {
    0: 'Network Error',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  if (code === 0) return 'Network Error';
  return labels[code] ? `${code} ${labels[code]}` : `${code} Unknown`;
}

function decodePayloadEntries(encoded: string): { key: string; value: string }[] {
  if (!encoded) return [];
  return encoded.split('&').map((pair) => {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) return { key: decodeURIComponent(pair), value: '' };
    return {
      key:   decodeURIComponent(pair.slice(0, eqIdx)),
      value: decodeURIComponent(pair.slice(eqIdx + 1)),
    };
  });
}

function buildCopyText(info: SubmitDebugInfo): string {
  const lines: string[] = [
    '=== SUBMISSION FAILURE DEBUG REPORT ===',
    `Timestamp   : ${info.timestamp}`,
    `HTTP Status : ${httpStatusLabel(info.httpStatus)}`,
    `Error       : ${info.errorMessage}`,
  ];
  if (info.requestUrl) lines.push(`Request URL : ${info.requestUrl}`);
  if (info.errorName && info.errorName !== 'SalesOrderApiError') {
    lines.push('', '--- JavaScript Error ---');
    lines.push(`  Name  : ${info.errorName}`);
    if (info.errorStack) lines.push(`  Stack :\n${info.errorStack}`);
  }
  if (info.apiStatus)  lines.push(`API Status  : ${info.apiStatus}`);
  if (info.apiMessage) lines.push(`API Message : ${info.apiMessage}`);
  if (info.apiLevel !== undefined) lines.push(`API Level   : ${info.apiLevel}`);
  if (info.apiParams)  lines.push(`API Params  : ${JSON.stringify(info.apiParams, null, 2)}`);
  if (info.rawBody) {
    lines.push('', '--- Raw Response ---', info.rawBody);
  }
  if (info.sentPayload) {
    lines.push('', '--- Payload Sent ---');
    decodePayloadEntries(info.sentPayload).forEach(({ key, value }) => {
      lines.push(`  ${key.padEnd(24)} = ${value}`);
    });
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// DebugErrorPanel sub-component
// ---------------------------------------------------------------------------
function DebugErrorPanel({ info }: { info: SubmitDebugInfo }) {
  const [open,   setOpen]   = useState(true);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(buildCopyText(info)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const payloadEntries = info.sentPayload ? decodePayloadEntries(info.sentPayload) : [];

  return (
    <div className="border border-red-300 rounded-xl overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-red-800 font-semibold confirmation-error-title">
            Submission failed
          </p>
          <p className="text-red-700 mt-0.5 break-words confirmation-error-message">
            {info.errorMessage}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-300 hover:bg-red-50 text-red-700 rounded-lg transition-colors confirmation-copy-btn"
            title="Copy full debug report to clipboard"
          >
            {copied
              ? <><ClipboardCheck className="h-3.5 w-3.5" /> Copied</>
              : <><ClipboardCopy  className="h-3.5 w-3.5" /> Copy all</>
            }
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
            aria-label={open ? 'Collapse debug details' : 'Expand debug details'}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Collapsible debug body ──────────────────────────────── */}
      {open && (
        <div className="bg-gray-950 text-gray-100 divide-y divide-gray-800 confirmation-debug-body">

          {/* Request */}
          <div className="px-4 py-3 flex flex-col gap-1">
            <span className="text-gray-500 uppercase tracking-widest confirmation-debug-section-label">Request</span>
            <DebugRow label="HTTP Status" value={httpStatusLabel(info.httpStatus)} highlight={info.httpStatus >= 400} />
            <DebugRow label="Timestamp"   value={info.timestamp} />
            {info.requestUrl && <DebugRow label="URL" value={info.requestUrl} mono />}
          </div>

          {/* JavaScript Error — shown when a code bug (not an API error) caused the failure */}
          {info.errorName && info.errorName !== 'SalesOrderApiError' && (
            <div className="px-4 py-3 flex flex-col gap-1">
              <span className="text-gray-500 uppercase tracking-widest confirmation-debug-section-label">JavaScript Error</span>
              <DebugRow label="Type"    value={info.errorName} highlight />
              <DebugRow label="Message" value={info.errorMessage} />
              {info.errorStack && (
                <div className="flex gap-3 items-start mt-1">
                  <span className="text-gray-500 shrink-0 confirmation-debug-row-label">Stack</span>
                  <pre className="text-orange-300 whitespace-pre-wrap break-all leading-relaxed confirmation-debug-pre flex-1">
                    {info.errorStack}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* API Response */}
          {(info.apiStatus || info.apiMessage || info.apiLevel !== undefined || info.apiParams) && (
            <div className="px-4 py-3 flex flex-col gap-1">
              <span className="text-gray-500 uppercase tracking-widest confirmation-debug-section-label">API Response</span>
              {info.apiStatus  && <DebugRow label="Status"  value={info.apiStatus} highlight />}
              {info.apiMessage && <DebugRow label="Message" value={info.apiMessage} />}
              {info.apiLevel !== undefined && <DebugRow label="Level" value={String(info.apiLevel)} />}
              {info.apiParams && (
                <DebugRow label="Params" value={JSON.stringify(info.apiParams)} mono />
              )}
            </div>
          )}

          {/* Raw Response */}
          {info.rawBody && (
            <div className="px-4 py-3 flex flex-col gap-1">
              <span className="text-gray-500 uppercase tracking-widest confirmation-debug-section-label">Raw Response Body</span>
              <pre className="mt-1 text-green-400 whitespace-pre-wrap break-all leading-relaxed confirmation-debug-pre">
                {(() => {
                  try { return JSON.stringify(JSON.parse(info.rawBody!), null, 2); }
                  catch { return info.rawBody; }
                })()}
              </pre>
            </div>
          )}

          {/* Payload Sent */}
          {payloadEntries.length > 0 && (
            <div className="px-4 py-3 flex flex-col gap-1">
              <span className="text-gray-500 uppercase tracking-widest confirmation-debug-section-label">Payload Sent (POST body)</span>
              <table className="mt-1 w-full border-collapse">
                <tbody>
                  {payloadEntries.map(({ key, value }) => (
                    <tr key={key} className="border-b border-gray-800 last:border-0">
                      <td className="py-1 pr-4 text-yellow-400 align-top whitespace-nowrap confirmation-debug-table-key">
                        {key}
                      </td>
                      <td className="py-1 text-gray-200 break-all align-top confirmation-debug-table-value">
                        {value || <span className="text-gray-600 italic">empty</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function DebugRow({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-gray-500 shrink-0 confirmation-debug-row-label">{label}</span>
      <span
        className={`break-all ${highlight ? 'text-red-400 font-semibold' : 'text-gray-200'} ${mono ? 'confirmation-debug-table-value' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ROOM_LABELS: Record<string, string> = {
  'studio':      'Studio',
  'bedroom':     'Bedroom',
  'living-room': 'Living Room',
  'dining':      'Dining',
  'den':         'Den',
  'patio':       'Patio',
};

function roomLabel(id: string, bedroomCount: number): string {
  if (id === 'bedroom' && bedroomCount > 1) return `Bedroom × ${bedroomCount}`;
  return ROOM_LABELS[id] ?? id;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 min-h-[36px] border-b border-gray-100 last:border-0">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="text-xs text-gray-800 ml-auto text-right">{value || '—'}</span>
    </div>
  );
}

function EditActions({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSave(); }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Check className="h-4 w-4" />
        Save
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onCancel(); }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
      >
        <X className="h-4 w-4" />
        Cancel
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Confirmation() {
  const navigate = useNavigate();
  const { formData, setContact, setAddress, resetForm } = useFormData();
  const { roomSizes } = useRoomSizes();
  const { profile, member, buildings } = useProfile({ payeeId: formData.payeeId ?? undefined });
  const payeeName = profile?.company || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Your Community';

  // trumuv_member_id lives on the building, not the profile — look it up from the PIN-selected building
  const selectedBuilding = buildings.find(b => b.id === formData.buildingId);
  const memberId = selectedBuilding?.trumuv_member_id ?? profile?.trumuv_member_id;

  // Navigation guard
  useEffect(() => {
    if (!window.__appStarted) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const [editingCard, setEditingCard]   = useState<CardKey | null>(null);
  const [hoveredCard, setHoveredCard]   = useState<CardKey | null>(null);

  // Direct references to FormContext data
  const contactData = formData.contact;
  const addressData = formData.address;
  const welcomeData = formData.welcome;
  const inventoryData = formData.inventory;

  // Estimated inventory totals (derived from inventoryData + Supabase roomSizes)
  const _adminVars = loadAdminVars();
  const furnitureScore = inventoryData
    ? inventoryData.selectedRooms.reduce((sum, roomId) => {
        const row = roomSizes.find((r) => r.id === roomId);
        if (!row) return sum;
        const multiplier = roomId === 'bedroom' ? inventoryData.bedroomCount : 1;
        return sum + row.fur * multiplier;
      }, 0)
    : 0;
  const boxCount = formData.miscellaneous?.boxCount ?? 0;
  const miscScore = (formData.miscellaneous?.selectedCategories ?? []).reduce((sum, catId) => {
    const row = _adminVars.addedItems.find((r) => r.id === catId);
    return sum + (row?.ratio ?? 0);
  }, 0);
  const ratingTotal = (addressData?.homeTypeRatio ?? 1) + (inventoryData?.disassembleBeds ? 2 : 0);

  // Inline-edit working copies
  const [editContact, setEditContact] = useState<ContactData>({
    firstName: '', lastName: '', cellPhone: '', email: '', serviceDate: '', serviceDateDisplay: '',
  });
  const [editAddress, setEditAddress] = useState<AddressData>({
    formattedAddress: '', street: '', city: '', state: '', zipcode: '', lat: null, lng: null,
  });
  // Submission
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitError,  setSubmitError]  = useState('');
  const [orderId,      setOrderId]      = useState<number | null>(null);
  const [leadId,       setLeadId]       = useState<number | null>(null);
  const [debugInfo,    setDebugInfo]    = useState<SubmitDebugInfo | null>(null);

  // ------------------------------------------------------------------
  // Inline-edit handlers
  // ------------------------------------------------------------------
  function openEdit(card: CardKey) {
    if (editingCard || submitStatus !== 'idle') return;
    setEditingCard(card);
    if (card === 'contact' && contactData) setEditContact({ ...contactData });
    if (card === 'address' && addressData) setEditAddress({ ...addressData });
  }

  function cancelEdit() {
    setEditingCard(null);
  }

  function commitContact() {
    const updated: ContactData = {
      ...editContact,
      serviceDateDisplay:
        formatDateDisplay(editContact.serviceDate) || editContact.serviceDateDisplay,
    };
    setContact(updated);
    setEditingCard(null);
  }

  function commitAddress() {
    const { street, city, state, zipcode } = editAddress;
    const stateZip = [state, zipcode].filter(Boolean).join(' ');
    const parts    = [street, city, stateZip].filter(Boolean);
    const formattedAddress = parts.join(', ');
    const updated: AddressData = { ...editAddress, formattedAddress };
    setAddress(updated);
    setEditingCard(null);
  }


  // ------------------------------------------------------------------
  // Submit handler
  // ------------------------------------------------------------------
  async function handleSubmit() {
    if (!contactData || !addressData || !welcomeData || !inventoryData) {
      setSubmitError('Some required information is missing. Please go back and complete all steps.');
      setSubmitStatus('error');
      return;
    }

    const contactEmail = contactData.email ?? '';
    if (!isValidEmail(contactEmail)) {
      setSubmitError('A valid e-mail address is required. Please go back to the Contact step and add one.');
      setSubmitStatus('error');
      return;
    }

    // Build the payload using the helper function
    const payload = buildSalesOrderPayload({
      contact:       contactData,
      address:       addressData,
      welcome:       welcomeData,
      inventory:     inventoryData,
      miscellaneous: formData.miscellaneous,
      email:         contactEmail,
      roomSizes,
      memberId,
      payeeId:       profile?.trumuv_payee_id,
    });

    // Pre-flight validation
    const missing = validateSalesOrderData(payload);
    if (missing.length > 0) {
      setSubmitError(`Missing required fields: ${missing.join(', ')}`);
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('submitting');
    setSubmitError('');

    try {
      const result: SalesOrderSuccessResponse = await createSalesOrder(payload);
      setOrderId(result.order_id);
      setLeadId(result.lead_id);
      setSubmitStatus('success');
    } catch (err) {
      const apiErr = err instanceof SalesOrderApiError ? err : null;
      const jsErr  = err instanceof Error ? err : null;
      setDebugInfo({
        timestamp:    new Date().toLocaleString(),
        requestUrl:   apiErr?.requestUrl,
        httpStatus:   apiErr?.statusCode ?? 0,
        errorMessage: jsErr?.message ?? String(err),
        errorName:    jsErr?.name,
        errorStack:   jsErr?.stack,
        apiStatus:    apiErr?.response?.status,
        apiMessage:   apiErr?.response?.data,
        apiLevel:     apiErr?.response?.Level,
        apiParams:    apiErr?.response?.Params,
        rawBody:      apiErr?.rawBody,
        sentPayload:  apiErr?.sentPayload,
      });
      setSubmitError(formatApiError(err));
      setSubmitStatus('error');
    }
  }

  // ------------------------------------------------------------------
  // Card header with hover pencil
  // ------------------------------------------------------------------
  function CardHeader({
    cardKey,
    icon,
    title,
  }: {
    cardKey: CardKey;
    icon: React.ReactNode;
    title: string;
  }) {
    const showPencil =
      (hoveredCard === cardKey || editingCard === cardKey) &&
      submitStatus === 'idle';

    return (
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-sm text-gray-900 font-bold">{title}</h2>
        {showPencil && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(cardKey); }}
            className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700" />
          </button>
        )}
      </div>
    );
  }

  function cardWrapperProps(cardKey: CardKey) {
    const editable = submitStatus === 'idle';
    return {
      onMouseEnter: () => editable && setHoveredCard(cardKey),
      onMouseLeave: () => setHoveredCard(null),
      onClick:      () => editable && openEdit(cardKey),
      style: { cursor: editable && !editingCard ? 'pointer' : 'default' } as React.CSSProperties,
    };
  }

  const isSubmitting = submitStatus === 'submitting';

  // ------------------------------------------------------------------
  // Success screen
  // ------------------------------------------------------------------
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex flex-col">
        <header className="w-full px-8 md:px-10 py-5 md:py-6 flex items-center justify-between bg-white">
          <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
        </header>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <PartyPopper className="h-10 w-10 text-green-600 animate-party-pop" />
              </span>
            </div>
            <h1 className="text-xl text-gray-900 font-bold mb-3">Order submitted!</h1>
            <p className="text-sm text-gray-600 mb-6">
              Thanks, {contactData?.firstName}! Please check your email to finish booking this move.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left flex flex-col gap-3">
              {orderId !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Order ID</span>
                  <span className="text-sm text-gray-900 font-bold">#{orderId}</span>
                </div>
              )}
              {leadId !== null && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">Lead ID</span>
                  <span className="text-sm text-gray-900 font-bold">#{leadId}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-500">Confirmation sent to</span>
                <span className="text-sm text-gray-900 font-medium">{contactData?.email ?? ''}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { resetForm(); navigate('/online'); }}
              className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors"
            >
              Check Email!
            </button>

            {/* Footer info */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-gray-900 font-bold">Have questions?</p>
              </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-700">Local Motion, LLC</p>
                <p className="text-xs text-gray-500">1250 Zane Avenue N, Golden Valley MN 55442</p>
              </div>
              {(member?.first_name || member?.last_name || member?.email || member?.phone) && (
                <div className="sm:text-right">
                  <p className="text-xs font-semibold text-gray-700">Technical Account Manager</p>
                  {(member?.first_name || member?.last_name) && (
                    <p className="text-xs text-gray-500">{[member.first_name, member.last_name].filter(Boolean).join(' ')}</p>
                  )}
                  {member?.email && <p className="text-xs text-gray-500">{member.email}</p>}
                  {member?.phone && <p className="text-xs text-gray-500">{member.phone}</p>}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Main render
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-8 md:px-10 py-5 md:py-6 flex items-center justify-between bg-white">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 md:px-8 py-6 overflow-y-auto">
        <div className="max-w-5xl">

          {/* Page heading */}
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h1 className="text-base text-gray-900 font-bold">All done — here's your summary</h1>
          </div>

          {/* ── Contribution Card — full width ───────────────────────────── */}
          <DetailCard className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-gray-600" />
              <h2 className="text-sm text-gray-900 font-bold">{payeeName}</h2>
              {profile?.trumuv_payee_id != null && (
                <span className="ml-auto text-xs text-gray-400">
                  TruMuv ID: <span className="font-semibold text-gray-600">{profile.trumuv_payee_id}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              You're invited to take advantage of a great savings opportunity, and we hope it helps make your move a little less stressful. We want your move-in to be as convenient and smooth as possible, and we look forward to welcoming you as our newest resident!
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Contribution</span>
              <span className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ${(welcomeData?.allowance ?? 0).toLocaleString()}
              </span>
            </div>
          </DetailCard>

          {/* ── Date & Time Card ─────────────────────────────────────────── */}
          {contactData && (
            <DetailCard className="mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Date of Service</p>
                    <p className="text-sm font-bold text-gray-900">{contactData.serviceDateDisplay || '—'}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex items-center gap-2">
                  {contactData.preferredTime === 'morning'
                    ? <Sun className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    : contactData.preferredTime === 'afternoon'
                      ? <Cloud className="h-4 w-4 text-sky-400 flex-shrink-0" />
                      : <Sun className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  }
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Time of Service</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{contactData.preferredTime ?? '—'}</p>
                  </div>
                </div>
              </div>
            </DetailCard>
          )}

          {/* ── Route Map — full width ────────────────────────────────────── */}
          {addressData && welcomeData && (
            <DetailCard className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm text-gray-900 font-bold">Route</h2>
                <span className="text-xs text-gray-400 ml-1">{addressData.formattedAddress} → {welcomeData.locationStreet}, {welcomeData.locationCity}, {welcomeData.locationState} {welcomeData.locationZip}</span>
              </div>
              <RouteMap
                origin={addressData.formattedAddress}
                destination={`${welcomeData.locationStreet}, ${welcomeData.locationCity}, ${welcomeData.locationState} ${welcomeData.locationZip}`}
              />
            </DetailCard>
          )}

          {/* ── Row 1: Contact + Moving From ─────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 items-stretch mb-4">

            {/* Contact Card */}
            <div className="h-full" {...cardWrapperProps('contact')}>
              <DetailCard className="h-full mb-0 flex flex-col">
                <CardHeader cardKey="contact" icon={<ContactRound className="h-4 w-4 text-teal-500" />} title="Contact information" />
                {editingCard === 'contact' ? (
                  <>
                    <div className="flex gap-3">
                      <FloatingLabelInput label="First name" value={editContact.firstName} onChange={(e) => setEditContact((p) => ({ ...p, firstName: e.target.value }))} />
                      <FloatingLabelInput label="Last name" value={editContact.lastName} onChange={(e) => setEditContact((p) => ({ ...p, lastName: e.target.value }))} />
                    </div>
                    <FloatingLabelInput label="Cell phone" format="phone" value={editContact.cellPhone} onChange={(e) => setEditContact((p) => ({ ...p, cellPhone: e.target.value }))} />
                    <FloatingLabelInput label="E-mail" type="email" value={editContact.email} onChange={(e) => setEditContact((p) => ({ ...p, email: e.target.value }))} />
                    <FloatingLabelInput label="Date of service" type="date" value={editContact.serviceDate} onChange={(e) => setEditContact((p) => ({ ...p, serviceDate: e.target.value }))} />
                    <EditActions onSave={commitContact} onCancel={cancelEdit} />
                  </>
                ) : contactData ? (
                  <div className="flex flex-col flex-1">
                    <div className="flex flex-col gap-1">
                      <SummaryRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={`${contactData.firstName} ${contactData.lastName}`.trim()} />
                      <SummaryRow icon={<Phone className="h-3.5 w-3.5" />} label="Cell phone" value={contactData.cellPhone} />
                      <SummaryRow icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" value={contactData.email ?? ''} />
                    </div>
                    {/* Estimated inventory */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package className="h-4 w-4 text-violet-500 flex-shrink-0" />
                        <p className="text-sm text-gray-900 font-bold">Estimated inventory</p>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-gray-900 text-center">Furniture</span>
                          <span className="text-xs text-gray-800 text-center">{furnitureScore}</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-gray-900 text-center">Boxes</span>
                          <span className="text-xs text-gray-800 text-center">{boxCount}</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-gray-900 text-center">Unboxed</span>
                          <span className="text-xs text-gray-800 text-center">{miscScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">No contact information saved. Please go back to step 2.</p>
                )}
              </DetailCard>
            </div>

            {/* Combined Address + Destination Card */}
            <DetailCard className="h-full mb-0">
              {/* Moving From header row — aligns with CardHeader in contact card */}
              <div className="flex items-center gap-2 min-h-[28px] mb-1">
                <Home className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm text-gray-900 font-bold flex-1">Moving from</h2>
                {submitStatus === 'idle' && (
                  <button type="button" onClick={() => openEdit('address')} className="p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Edit address">
                    <Pencil className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700" />
                  </button>
                )}
              </div>
              {editingCard === 'address' ? (
                <>
                  <FloatingLabelInput label="Street address" value={editAddress.street} onChange={(e) => setEditAddress((p) => ({ ...p, street: e.target.value }))} />
                  <div className="flex gap-3">
                    <FloatingLabelInput label="City" value={editAddress.city} onChange={(e) => setEditAddress((p) => ({ ...p, city: e.target.value }))} />
                    <FloatingLabelInput label="State" value={editAddress.state} onChange={(e) => setEditAddress((p) => ({ ...p, state: e.target.value }))} style={{ maxWidth: '80px' }} />
                    <FloatingLabelInput label="Zip" value={editAddress.zipcode} onChange={(e) => setEditAddress((p) => ({ ...p, zipcode: e.target.value }))} style={{ maxWidth: '100px' }} />
                  </div>
                  <EditActions onSave={commitAddress} onCancel={cancelEdit} />
                </>
              ) : (
                <div className="flex flex-col">
                  <SummaryRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={addressData?.formattedAddress ?? '—'} />
                  <div className="h-[7px]" />
                  <SummaryRow icon={<Home className="h-3.5 w-3.5" />} label="Home type" value={addressData?.homeType ?? '—'} />
                  <div className="h-[7px]" />
                  {welcomeData?.notes && (
                    <>
                      <div className="border-t border-gray-100 my-2" />
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <p className="text-sm text-gray-900 font-bold">What matters most?</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{welcomeData.notes}</p>
                    </>
                  )}
                </div>
              )}

            </DetailCard>

          </div>{/* end row 1 */}

          {/* ── Row 2: Moving To + Rooms ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 items-stretch">

            {/* Moving To + Rooms Card */}
            <DetailCard className="h-full mb-0">
              {/* Moving To */}
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm text-gray-900 font-bold">Moving to</h2>
              </div>
              {welcomeData ? (
                <div className="flex flex-col mb-3">
                  <SummaryRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={`${welcomeData.locationLabel} — ${welcomeData.locationStreet}, ${welcomeData.locationCity}, ${welcomeData.locationState} ${welcomeData.locationZip}`} />
                  <div className="h-[7px]" />
                  <SummaryRow icon={<BedDouble className="h-3.5 w-3.5" />} label="Unit type" value={welcomeData.unitType} />
                  <div className="h-[7px]" />
                </div>
              ) : (
                <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">No destination saved.</p>
              )}

              <div className="border-t border-gray-100 mb-3" />

              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-violet-500" />
                <h2 className="text-sm text-gray-900 font-bold">Rooms selected</h2>
              </div>
              {inventoryData && inventoryData.selectedRooms.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {inventoryData.selectedRooms.map((room) => (
                      <span key={room} className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 rounded-full">
                        {roomLabel(room, inventoryData.bedroomCount)}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">No rooms selected. Please go back and select your inventory.</p>
              )}
            </DetailCard>

          </div>{/* end row 2 */}

          {/* ── API error banner ─────────────────────────────────────────── */}
          {submitStatus === 'error' && debugInfo && (
            <div className="mt-4"><DebugErrorPanel info={debugInfo} /></div>
          )}
          {submitStatus === 'error' && submitError && !debugInfo && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mt-4">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-semibold">Submission failed</p>
                <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Info footer */}
      <div className="w-full px-8 md:px-10 py-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-700">Local Motion, LLC</p>
            <p className="text-xs text-gray-500">1250 Zane Avenue N, Golden Valley MN 55442</p>
          </div>
          {(member?.first_name || member?.last_name || member?.email || member?.phone) && (
            <div className="text-right sm:text-right">
              <p className="text-xs font-semibold text-gray-700">Technical Account Manager</p>
              {(member?.first_name || member?.last_name) && (
                <p className="text-xs text-gray-500">
                  {[member.first_name, member.last_name].filter(Boolean).join(' ')}
                </p>
              )}
              {member?.email && (
                <p className="text-xs text-gray-500">{member.email}</p>
              )}
              {member?.phone && (
                <p className="text-xs text-gray-500">{member.phone}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-8 md:px-10 py-4 bg-white border-t border-gray-200">
        <div className="max-w-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/miscellaneous')}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            <span className="text-base">←</span>
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl inline-flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit Order
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </div>
      </footer>

    </div>
  );
}
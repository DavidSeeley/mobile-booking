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
  CheckCircle, Settings, MapPin, Calendar, Package, Home, User, Loader2, AlertCircle,
  Pencil, Phone, Mail, Check, X, ChevronUp, ChevronDown, 
  ClipboardCopy, ClipboardCheck, PartyPopper, Building2, BedDouble
} from 'lucide-react';
import logoImage from '../../../assets/BookingLogo.png';
import { DetailCard } from '@/components/detail-card';
import { FloatingLabelInput } from '@/components/floating-label-input';
import { createSalesOrder, type SalesOrderSuccessResponse, validateSalesOrderData, formatApiError, buildSalesOrderPayload } from '../../../api/salesOrderApi';
import { SalesOrderApiError } from '../../../api/types';
import { loadAdminVars } from '@/mocks/AdminVar';
import { useFormData, type ContactData, type AddressData, type WelcomeData, type InventoryData } from '@/context/FormContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CardKey = 'contact' | 'address' | 'destination';
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

interface SubmitDebugInfo {
  timestamp: string;
  requestUrl?: string;
  httpStatus: number;
  errorMessage: string;
  apiStatus?: string;
  apiMessage?: string;
  apiLevel?: number;
  apiParams?: Record<string, string | number>;
  rawBody?: string;
  sentPayload?: string; // raw form-url-encoded string
}

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
// Styles
// ---------------------------------------------------------------------------
const ghostStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  marginBottom: 0,
};

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
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="shrink-0 mt-0.5 text-gray-400">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span
          className="text-gray-400"
          style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {label}
        </span>
        <span className="text-gray-800 font-medium" style={{ fontSize: '15px' }}>
          {value || '—'}
        </span>
      </div>
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
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        style={{ fontSize: '14px' }}
      >
        <Check className="h-4 w-4" />
        Save
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onCancel(); }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
        style={{ fontSize: '14px' }}
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
  const { formData, setContact, setAddress, setWelcome } = useFormData();

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

  // Estimated inventory totals (derived from inventoryData + AdminVar roomSizes)
  const _adminVars = loadAdminVars();
  const furnitureScore = inventoryData
    ? inventoryData.selectedRooms.reduce((sum, roomId) => {
        const row = _adminVars.roomSizes.find((r) => r.id === roomId);
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

  // Inline-edit working copies
  const [editContact, setEditContact] = useState<ContactData>({
    firstName: '', lastName: '', cellPhone: '', email: '', serviceDate: '', serviceDateDisplay: '',
  });
  const [editAddress, setEditAddress] = useState<AddressData>({
    formattedAddress: '', street: '', city: '', state: '', zipcode: '', lat: null, lng: null,
  });
  const [editWelcome, setEditWelcomeLocal] = useState<WelcomeData>({
    locationLabel: '', locationStreet: '', locationCity: '',
    locationState: '', locationZip: '', unitType: '',
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
    if (card === 'contact'     && contactData) setEditContact({ ...contactData });
    if (card === 'address'     && addressData) setEditAddress({ ...addressData });
    if (card === 'destination' && welcomeData) setEditWelcomeLocal({ ...welcomeData });
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

  function commitWelcome() {
    setWelcome(editWelcome);
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
      contact:   contactData,
      address:   addressData,
      welcome:   welcomeData,
      inventory: inventoryData,
      email: contactEmail,
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
      setDebugInfo({
        timestamp:    new Date().toLocaleString(),
        requestUrl:   apiErr?.requestUrl,
        httpStatus:   apiErr?.statusCode ?? 0,
        errorMessage: err instanceof Error ? err.message : String(err),
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
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-gray-900 font-bold" style={{ fontSize: '18px' }}>
          {title}
        </h2>
        {showPencil && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(cardKey); }}
            className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="h-4 w-4 text-gray-400 hover:text-gray-700" />
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
                <PartyPopper className="h-10 w-10 text-green-600" />
              </span>
            </div>
            <h1 className="text-gray-900 font-bold mb-3" style={{ fontSize: '26px' }}>
              Order submitted!
            </h1>
            <p className="text-gray-600 mb-6" style={{ fontSize: '16px' }}>
              Thanks, {contactData?.firstName}! We've received your request and will be in touch soon.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left flex flex-col gap-3">
              {orderId !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500" style={{ fontSize: '13px' }}>Order ID</span>
                  <span className="text-gray-900 font-bold" style={{ fontSize: '15px' }}>#{orderId}</span>
                </div>
              )}
              {leadId !== null && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-gray-500" style={{ fontSize: '13px' }}>Lead ID</span>
                  <span className="text-gray-900 font-bold" style={{ fontSize: '15px' }}>#{leadId}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Confirmation sent to</span>
                <span className="text-gray-900 font-medium" style={{ fontSize: '14px' }}>{contactData?.email ?? ''}</span>
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
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6 text-gray-700" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-8 md:px-10 py-11">
        <div className="max-w-3xl flex flex-col gap-2">

          {/* Page heading */}
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-7 w-7 text-green-500" />
            <h1 className="text-gray-900 font-bold" style={{ fontSize: '24px' }}>
              All done — here's your summary
            </h1>
          </div>

          {/* ── Card 1: Contact info ─────────────────────────────────────── */}
          <div {...cardWrapperProps('contact')}>
            <DetailCard style={editingCard !== 'contact' ? ghostStyle : undefined}>
              <CardHeader
                cardKey="contact"
                icon={<User className="h-5 w-5 text-gray-600" />}
                title="Contact information"
              />

              {editingCard === 'contact' ? (
                <>
                  <div className="flex gap-4">
                    <FloatingLabelInput
                      label="First name"
                      value={editContact.firstName}
                      onChange={(e) => setEditContact((p) => ({ ...p, firstName: e.target.value }))}
                    />
                    <FloatingLabelInput
                      label="Last name"
                      value={editContact.lastName}
                      onChange={(e) => setEditContact((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                  <FloatingLabelInput
                    label="Cell phone"
                    format="phone"
                    value={editContact.cellPhone}
                    onChange={(e) => setEditContact((p) => ({ ...p, cellPhone: e.target.value }))}
                  />
                  <FloatingLabelInput
                    label="E-mail"
                    type="email"
                    value={editContact.email}
                    onChange={(e) => setEditContact((p) => ({ ...p, email: e.target.value }))}
                  />
                  <FloatingLabelInput
                    label="Date of service"
                    type="date"
                    value={editContact.serviceDate}
                    onChange={(e) => setEditContact((p) => ({ ...p, serviceDate: e.target.value }))}
                  />
                  <EditActions onSave={commitContact} onCancel={cancelEdit} />
                </>
              ) : contactData ? (
                <div className="flex flex-col gap-0">
                  <SummaryRow
                    icon={<User className="h-4 w-4" />}
                    label="Name"
                    value={`${contactData.firstName} ${contactData.lastName}`.trim()}
                  />
                  <SummaryRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Cell phone"
                    value={contactData.cellPhone}
                  />
                  <SummaryRow
                    icon={<Mail className="h-4 w-4" />}
                    label="E-mail"
                    value={contactData.email ?? ''}
                  />
                  <SummaryRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Date of service"
                    value={contactData.serviceDateDisplay}
                  />
                </div>
              ) : (
                <p
                  className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  style={{ fontSize: '15px' }}
                >
                  No contact information saved. Please go back to step 2.
                </p>
              )}
            </DetailCard>
          </div>

          <hr className="border-t border-slate-500" />

          {/* ── Card 2: Confirmed address ─────────────────────────────────── */}
          <div {...cardWrapperProps('address')}>
            <DetailCard style={editingCard !== 'address' ? ghostStyle : undefined}>
              <CardHeader
                cardKey="address"
                icon={<Home className="h-5 w-5 text-gray-600" />}
                title="Your confirmed address"
              />

              {editingCard === 'address' ? (
                <>
                  <FloatingLabelInput
                    label="Street address"
                    value={editAddress.street}
                    onChange={(e) =>
                      setEditAddress((p) => ({ ...p, street: e.target.value }))
                    }
                  />
                  <div className="flex gap-4">
                    <FloatingLabelInput
                      label="City"
                      value={editAddress.city}
                      onChange={(e) =>
                        setEditAddress((p) => ({ ...p, city: e.target.value }))
                      }
                    />
                    <FloatingLabelInput
                      label="State"
                      value={editAddress.state}
                      onChange={(e) =>
                        setEditAddress((p) => ({ ...p, state: e.target.value }))
                      }
                      style={{ maxWidth: '80px' }}
                    />
                    <FloatingLabelInput
                      label="Zip"
                      value={editAddress.zipcode}
                      onChange={(e) =>
                        setEditAddress((p) => ({ ...p, zipcode: e.target.value }))
                      }
                      style={{ maxWidth: '100px' }}
                    />
                  </div>
                  <EditActions onSave={commitAddress} onCancel={cancelEdit} />
                </>
              ) : addressData ? (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-semibold" style={{ fontSize: '17px' }}>
                      {addressData.formattedAddress}
                    </p>
                    {addressData.lat !== null && addressData.lng !== null && (
                      <p className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>
                        {addressData.lat.toFixed(6)}, {addressData.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p
                  className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  style={{ fontSize: '15px' }}
                >
                  No address saved. Please go back and confirm your address.
                </p>
              )}
            </DetailCard>
          </div>

          <hr className="border-t border-slate-500" />

          {/* ── Card 3: Moving destination ────────────────────────────────── */}
          <div {...cardWrapperProps('destination')}>
            <DetailCard style={editingCard !== 'destination' ? ghostStyle : undefined}>
              <CardHeader
                cardKey="destination"
                icon={<Building2 className="h-5 w-5 text-gray-600" />}
                title="Moving destination"
              />

              {editingCard === 'destination' ? (
                <>
                  <FloatingLabelInput
                    label="Location name"
                    value={editWelcome.locationLabel}
                    onChange={(e) =>
                      setEditWelcomeLocal((p) => ({ ...p, locationLabel: e.target.value }))
                    }
                  />
                  <FloatingLabelInput
                    label="Street address"
                    value={editWelcome.locationStreet}
                    onChange={(e) =>
                      setEditWelcomeLocal((p) => ({ ...p, locationStreet: e.target.value }))
                    }
                  />
                  <div className="flex gap-4">
                    <FloatingLabelInput
                      label="City"
                      value={editWelcome.locationCity}
                      onChange={(e) =>
                        setEditWelcomeLocal((p) => ({ ...p, locationCity: e.target.value }))
                      }
                    />
                    <FloatingLabelInput
                      label="State"
                      value={editWelcome.locationState}
                      onChange={(e) =>
                        setEditWelcomeLocal((p) => ({ ...p, locationState: e.target.value }))
                      }
                      style={{ maxWidth: '80px' }}
                    />
                    <FloatingLabelInput
                      label="Zip"
                      value={editWelcome.locationZip}
                      onChange={(e) =>
                        setEditWelcomeLocal((p) => ({ ...p, locationZip: e.target.value }))
                      }
                      style={{ maxWidth: '100px' }}
                    />
                  </div>
                  <FloatingLabelInput
                    label="Unit type"
                    value={editWelcome.unitType}
                    onChange={(e) =>
                      setEditWelcomeLocal((p) => ({ ...p, unitType: e.target.value }))
                    }
                  />
                  <EditActions onSave={commitWelcome} onCancel={cancelEdit} />
                </>
              ) : welcomeData ? (
                <div className="flex flex-col gap-0">
                  <SummaryRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={`${welcomeData.locationLabel} — ${welcomeData.locationStreet}, ${welcomeData.locationCity}, ${welcomeData.locationState} ${welcomeData.locationZip}`}
                  />
                  <SummaryRow
                    icon={<BedDouble className="h-4 w-4" />}
                    label="Unit type"
                    value={welcomeData.unitType}
                  />
                </div>
              ) : (
                <p
                  className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  style={{ fontSize: '15px' }}
                >
                  No destination saved. Please go back to step 1.
                </p>
              )}
            </DetailCard>
          </div>

          <hr className="border-t border-slate-500" />

          {/* ── Card 4: Inventory ─────────────────────────────────────────── */}
          <div>
            <DetailCard style={ghostStyle}>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <h2 className="text-gray-900 font-bold" style={{ fontSize: '18px' }}>
                  Rooms selected
                </h2>
              </div>
              {inventoryData && inventoryData.selectedRooms.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {inventoryData.selectedRooms.map((room) => (
                      <span
                        key={room}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        {roomLabel(room, inventoryData.bedroomCount)}
                      </span>
                    ))}
                  </div>

                  {/* Estimated Inventory totals */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p
                      className="text-gray-500 mb-3"
                      style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
                    >
                      Estimated Inventory
                    </p>
                    <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span
                          className="text-gray-400"
                          style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                          Furniture Score
                        </span>
                        <span className="text-gray-800 font-medium" style={{ fontSize: '22px' }}>
                          {furnitureScore}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="text-gray-400"
                          style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                          Box Count
                        </span>
                        <span className="text-gray-800 font-medium" style={{ fontSize: '22px' }}>
                          {boxCount}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="text-gray-400"
                          style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                          Misc Score
                        </span>
                        <span className="text-gray-800 font-medium" style={{ fontSize: '22px' }}>
                          {miscScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p
                  className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  style={{ fontSize: '15px' }}
                >
                  No rooms selected. Please go back and select your inventory.
                </p>
              )}
            </DetailCard>
          </div>

          {/* ── API error banner ──────────────────────────────────────────── */}
          {submitStatus === 'error' && debugInfo && (
            <DebugErrorPanel info={debugInfo} />
          )}
          {submitStatus === 'error' && submitError && !debugInfo && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-800 font-semibold" style={{ fontSize: '14px' }}>
                  Submission failed
                </p>
                <p className="text-red-700 mt-0.5" style={{ fontSize: '13px' }}>
                  {submitError}
                </p>
              </div>
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
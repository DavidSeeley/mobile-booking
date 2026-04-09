import type { BuildingWithApts, PayeeWithBuildings } from '@/hooks/usePayees';
import type { MemberRow } from '@/lib/supabase';

export interface BuildingPanelProps {
  payeeId: string;
  building: BuildingWithApts;
  onAddApt: (payeeId: string, buildingId: string, data: { name: string; allowance: number }) => Promise<void>;
  onSaveApt: (payeeId: string, buildingId: string, aptId: string, data: { name?: string; allowance?: number }) => Promise<void>;
  onUpdateBuilding: (payeeId: string, buildingId: string, data: { name?: string; address?: string; city?: string; state?: string; zip?: string; pin_code?: string; trumuv_member_id?: number }) => Promise<void>;
  onDeleteBuilding: (payeeId: string, buildingId: string) => Promise<void>;
  onDeleteApt: (payeeId: string, buildingId: string, aptId: string) => Promise<void>;
}

export interface PayeeRowProps {
  payee: PayeeWithBuildings;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onAddBuilding: (payeeId: string, name: string) => Promise<void>;
  onAddApt: (payeeId: string, buildingId: string, data: { name: string; allowance: number }) => Promise<void>;
  onSaveApt: (payeeId: string, buildingId: string, aptId: string, data: { name?: string; allowance?: number }) => Promise<void>;
  onUpdateBuilding: (payeeId: string, buildingId: string, data: { name?: string; address?: string; city?: string; state?: string; zip?: string; pin_code?: string; trumuv_member_id?: number }) => Promise<void>;
  onDeleteBuilding: (payeeId: string, buildingId: string) => Promise<void>;
  onDeleteApt: (payeeId: string, buildingId: string, aptId: string) => Promise<void>;
  onUpdateProfile: (payeeId: string, data: Partial<PayeeWithBuildings>) => Promise<void>;
  onUpsertMember: (payeeId: string, data: Pick<MemberRow, 'trumuv_member_id' | 'first_name' | 'last_name' | 'email' | 'phone'>) => Promise<void>;
  onDeletePayee: (payeeId: string) => Promise<void>;
}

/**
 * PROJETO ARES — Mission Control Type Definitions
 */

// ==========================================
// ENUMS
// ==========================================

export enum PartStatus {
  TO_BUY = 'A Comprar',
  BOUGHT = 'Comprado',
  TESTED = 'Testado',
}

export enum AlertLevel {
  NOMINAL = 'nominal',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export type ViewId =
  | 'dashboard'
  | 'bom'
  | 'phases'
  | 'telemetry'
  | 'chat'
  | 'docs'
  | 'ai'
  | 'audit';

// ==========================================
// USER & AUTH
// ==========================================

export interface AresUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// ==========================================
// BOM (Bill of Materials)
// ==========================================

export interface BOMItem {
  id: string;
  name: string;
  category: string;
  functionDesc: string;
  costMin: number;
  costMax: number;
  costDisplay: string;
  qty: number;
  status: PartStatus;
  details: string;
  createdBy?: string;
  updatedAt?: string;
}

// ==========================================
// PHASES & TASKS
// ==========================================

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  notes: string;
  assignee?: string;
  assigneePhoto?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  expanded: boolean;
  tasks: Task[];
}

// ==========================================
// CHAT MESSAGES
// ==========================================

export interface ChatMessage {
  id: string;
  sender: string;
  senderPhoto: string | null;
  uid: string;
  role: string;
  text: string;
  timestamp: string;
  createdAt: number; // epoch ms for ordering
  color: string;
}

// ==========================================
// TELEMETRY
// ==========================================

export interface TelemetryPacket {
  seq: number;
  time: string;
  temp: number;
  hum: number;
  ldr: number;
  dist: number;
  vbat: number;
  status: 'NOMINAL' | 'OBSTACLE_ALERT';
}

export interface TelemetryState {
  temp: number;
  hum: number;
  ldr: number;
  dist: number;
  vbat: number;
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
  ldrMax: number;
  tempSum: number;
  tempCount: number;
  humSum: number;
  humCount: number;
  anomaly: string | null;
}

// ==========================================
// DOCUMENTATION
// ==========================================

export interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  lastEditedBy?: string;
  lastEditedByPhoto?: string;
  updatedAt?: string;
  order: number;
}

// ==========================================
// MISSION DATA (Aggregate)
// ==========================================

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: 'bom' | 'phase' | 'doc' | 'system';
}

export interface MissionMeta {
  projectName: string;
  version: string;
  lastUpdated: string;
  createdBy?: string;
}

export interface MissionData {
  meta: MissionMeta;
  bom: BOMItem[];
  phases: Phase[];
  logs: AuditLog[];
}

// ==========================================
// STORE ACTIONS
// ==========================================

export type MissionAction =
  | { type: 'SET_MISSION_DATA'; payload: MissionData }
  | { type: 'SET_BOM'; payload: BOMItem[] }
  | { type: 'ADD_BOM_ITEM'; payload: BOMItem }
  | { type: 'UPDATE_BOM_ITEM'; payload: BOMItem }
  | { type: 'DELETE_BOM_ITEM'; payload: string }
  | { type: 'SET_PHASES'; payload: Phase[] }
  | { type: 'TOGGLE_TASK'; payload: { phaseId: string; taskId: string; completed: boolean } }
  | { type: 'UPDATE_TASK_NOTES'; payload: { phaseId: string; taskId: string; notes: string } }
  | { type: 'ADD_TASK'; payload: { phaseId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { phaseId: string; taskId: string } }
  | { type: 'TOGGLE_PHASE_EXPAND'; payload: string }
  | { type: 'EXPAND_ALL_PHASES'; payload: boolean }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog };

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

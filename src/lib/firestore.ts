/**
 * PROJETO ARES — Firestore Database Service
 */
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  BOMItem,
  Phase,
  Task,
  ChatMessage,
  DocSection,
  MissionMeta,
} from '../types/mission';

const MISSION_ID = 'ares-main';

// ==========================================
// MISSION META
// ==========================================

export function subscribeMeta(callback: (meta: MissionMeta | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'missions', MISSION_ID), (snap) => {
    callback(snap.exists() ? (snap.data() as MissionMeta) : null);
  });
}

export async function initMission(meta: MissionMeta) {
  await setDoc(doc(db, 'missions', MISSION_ID), meta, { merge: true });
}

// ==========================================
// BOM (Bill of Materials)
// ==========================================

const bomCol = () => collection(db, 'missions', MISSION_ID, 'bom');

export function subscribeBOM(callback: (items: BOMItem[]) => void): Unsubscribe {
  return onSnapshot(bomCol(), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BOMItem);
    callback(items);
  });
}

export async function addBOMItem(item: Omit<BOMItem, 'id'>) {
  const ref = await addDoc(bomCol(), { ...item, updatedAt: new Date().toISOString() });
  return ref.id;
}

export async function updateBOMItem(id: string, data: Partial<BOMItem>) {
  await updateDoc(doc(db, 'missions', MISSION_ID, 'bom', id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteBOMItem(id: string) {
  await deleteDoc(doc(db, 'missions', MISSION_ID, 'bom', id));
}

// ==========================================
// PHASES & TASKS
// ==========================================

const phasesCol = () => collection(db, 'missions', MISSION_ID, 'phases');

export function subscribePhases(callback: (phases: Phase[]) => void): Unsubscribe {
  const q = query(phasesCol(), orderBy('order'));
  return onSnapshot(q, (snap) => {
    const phases = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Phase);
    callback(phases);
  });
}

export async function setPhaseData(phase: Phase) {
  await setDoc(doc(db, 'missions', MISSION_ID, 'phases', phase.id), phase);
}

export async function updatePhase(id: string, data: Partial<Phase>) {
  await updateDoc(doc(db, 'missions', MISSION_ID, 'phases', id), data as Record<string, unknown>);
}

export async function addTaskToPhase(phaseId: string, currentTasks: Task[], newTask: Task) {
  await updateDoc(doc(db, 'missions', MISSION_ID, 'phases', phaseId), {
    tasks: [...currentTasks, newTask],
    expanded: true,
  });
}

export async function updatePhaseTasks(phaseId: string, tasks: Task[]) {
  await updateDoc(doc(db, 'missions', MISSION_ID, 'phases', phaseId), { tasks });
}

// ==========================================
// CHAT MESSAGES
// ==========================================

const chatCol = () => collection(db, 'missions', MISSION_ID, 'chat');

export function subscribeChatMessages(callback: (messages: ChatMessage[]) => void): Unsubscribe {
  const q = query(chatCol(), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage);
    callback(messages);
  });
}

export async function sendChatMessageToFirestore(message: Omit<ChatMessage, 'id'>) {
  await addDoc(chatCol(), { ...message, _serverTimestamp: serverTimestamp() });
}

export async function clearAllChatMessages() {
  const q = query(chatCol());
  const unsubscribe = onSnapshot(q, (snap) => {
    snap.docs.forEach((d) => deleteDoc(d.ref));
    unsubscribe();
  });
}

// ==========================================
// DOCUMENTATION
// ==========================================

const docsCol = () => collection(db, 'missions', MISSION_ID, 'docs');

export function subscribeDocs(callback: (sections: DocSection[]) => void): Unsubscribe {
  const q = query(docsCol(), orderBy('order'));
  return onSnapshot(q, (snap) => {
    const sections = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DocSection);
    callback(sections);
  });
}

export async function updateDocSection(id: string, data: Partial<DocSection>) {
  await setDoc(doc(db, 'missions', MISSION_ID, 'docs', id), data as Record<string, unknown>, { merge: true });
}

export async function initDocSection(section: DocSection) {
  await setDoc(doc(db, 'missions', MISSION_ID, 'docs', section.id), section);
}

// ==========================================
// SEED DEFAULT DATA (First-time setup)
// ==========================================

export async function seedDefaultData(
  defaultBOM: Omit<BOMItem, 'id'>[],
  defaultPhases: Phase[],
  defaultDocs: DocSection[],
) {
  // Seed BOM
  for (const item of defaultBOM) {
    await addDoc(bomCol(), { ...item, updatedAt: new Date().toISOString() });
  }

  // Seed Phases
  for (const phase of defaultPhases) {
    await setDoc(doc(db, 'missions', MISSION_ID, 'phases', phase.id), phase);
  }

  // Seed Docs
  for (const section of defaultDocs) {
    await setDoc(doc(db, 'missions', MISSION_ID, 'docs', section.id), section);
  }

  // Mark mission as initialized
  await setDoc(doc(db, 'missions', MISSION_ID), {
    projectName: 'Projeto Ares',
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    initialized: true,
  });
}

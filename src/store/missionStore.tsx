/**
 * PROJETO ARES — Mission Store (Global State Management)
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import type {
  MissionData,
  MissionAction,
  BOMItem,
  Phase,
  Task,
  ChatMessage,
  DocSection,
  ToastMessage,
  ToastType,
  ViewId,
  AuditLog,
} from '../types/mission';
import { PartStatus } from '../types/mission';
import { useAuth } from '../lib/auth';
import {
  subscribeBOM,
  subscribePhases,
  subscribeChatMessages,
  subscribeDocs,
  subscribeMeta,
  seedDefaultData,
  addBOMItem as fbAddBOM,
  updateBOMItem as fbUpdateBOM,
  deleteBOMItem as fbDeleteBOM,
  updatePhaseTasks,
  addTaskToPhase,
  updatePhase,
  sendChatMessageToFirestore,
  updateDocSection as fbUpdateDoc,
} from '../lib/firestore';

// ==========================================
// DEFAULT DATA (for seeding Firestore)
// ==========================================

const DEFAULT_BOM: Omit<BOMItem, 'id'>[] = [
  { name: 'Placa de Desenvolvimento ESP32', category: 'Cérebro', functionDesc: 'O computador de bordo do rover. Lê sensores, controla motores e envia dados via Wi-Fi.', costMin: 40, costMax: 60, costDisplay: '40 - 60', qty: 1, status: PartStatus.TO_BUY, details: 'Microcontrolador ESP32 dual-core com Wi-Fi 2.4GHz e Bluetooth.' },
  { name: 'Kit Chassi Robô 4WD (Acrílico)', category: 'Estrutura', functionDesc: 'O corpo do rover. 2 bases de acrílico, 4 motores DC e 4 rodas.', costMin: 65, costMax: 90, costDisplay: '65 - 90', qty: 1, status: PartStatus.TO_BUY, details: 'Chassi duplo em acrílico com 4 caixas de redução amarelas.' },
  { name: 'Ponte H Dupla L298N', category: 'Atuadores', functionDesc: 'O "músculo". Recebe comandos do ESP32 e envia energia para os motores.', costMin: 15, costMax: 25, costDisplay: '15 - 25', qty: 1, status: PartStatus.TO_BUY, details: 'Pinos 12V/GND ligados nas baterias 18650. Pino 5V regulado alimenta o ESP32 VIN.' },
  { name: 'Micro Servo Motor SG90', category: 'Atuadores', functionDesc: 'O "pescoço" do robô. Gira o sensor de distância para os lados.', costMin: 15, costMax: 20, costDisplay: '15 - 20', qty: 1, status: PartStatus.TO_BUY, details: 'Giro de 180° para varredura de obstáculos marcianos.' },
  { name: 'Sensor Ultrassônico HC-SR04', category: 'Sensores', functionDesc: 'Os "olhos". Mede distância para evitar colisões.', costMin: 10, costMax: 15, costDisplay: '10 - 15', qty: 1, status: PartStatus.TO_BUY, details: 'Distância inferior a 15cm aciona manobra de desvio.' },
  { name: 'Sensor de Temp/Umidade DHT11', category: 'Sensores', functionDesc: 'O instrumento científico. Lê o "clima" da feira.', costMin: 10, costMax: 15, costDisplay: '10 - 15', qty: 1, status: PartStatus.TO_BUY, details: 'Temperatura 0-50°C, Umidade 20-90%.' },
  { name: 'Módulo LDR (Sensor de Luz)', category: 'Sensores', functionDesc: 'Mede a "Radiação Solar" do ambiente.', costMin: 5, costMax: 10, costDisplay: '5 - 10', qty: 1, status: PartStatus.TO_BUY, details: 'Leitura analógica via ADC do ESP32.' },
  { name: '2x Baterias 18650 (Li-ion) + Suporte', category: 'Energia', functionDesc: 'Baterias de lítio. Pilhas AA comuns não aguentam 4 motores.', costMin: 40, costMax: 70, costDisplay: '40 - 70', qty: 1, status: PartStatus.TO_BUY, details: '7.4V nominal. Incluir carregador duplo externo.' },
  { name: 'Protoboard 400 furos', category: 'Prototipagem', functionDesc: 'Placa para encaixar ESP32 e fazer ligações sem solda.', costMin: 10, costMax: 15, costDisplay: '10 - 15', qty: 1, status: PartStatus.TO_BUY, details: 'Fixada no chassi com fita 3M.' },
  { name: 'Kit Jumpers (M-M, M-F, F-F 120 pcs)', category: 'Cabeamento', functionDesc: 'Fios coloridos para conectar tudo.', costMin: 25, costMax: 35, costDisplay: '25 - 35', qty: 1, status: PartStatus.TO_BUY, details: 'Levar cabos reservas no dia da feira.' },
];

const DEFAULT_PHASES: Phase[] = [
  { id: 'phase-1', title: '1. Bancada', subtitle: 'Testes de Bancada', description: 'Testem o ESP32 e validem as leituras do DHT11 e LDR no monitor serial.', order: 1, expanded: true, tasks: [
    { id: 'task-1-1', title: 'Ligar ESP32 no computador e testar Blink', completed: false, notes: 'Provar que a placa liga e o driver USB foi reconhecido.' },
    { id: 'task-1-2', title: 'Conectar sensor DHT11 e LDR na protoboard', completed: false, notes: 'Validar pinos GPIO e resistor pull-up.' },
    { id: 'task-1-3', title: 'Gerar primeiras leituras de telemetria', completed: false, notes: 'Confirmar dados variando ao tapar LDR ou soprar no DHT11.' },
  ]},
  { id: 'phase-2', title: '2. Estrutura', subtitle: 'Estrutura Mecânica e Músculos', description: 'Montagem do chassi 4WD, fixação dos motores e Ponte H L298N.', order: 2, expanded: false, tasks: [
    { id: 'task-2-1', title: 'Retirar películas do chassi de acrílico', completed: false, notes: 'Cuidado com acabamento estético.' },
    { id: 'task-2-2', title: 'Soldar fios nos 4 motores DC', completed: false, notes: 'Usar termo-retrátil para reforçar.' },
    { id: 'task-2-3', title: 'Parafusar motores e encaixar rodas', completed: false, notes: 'Verificar se rodas giram livremente.' },
    { id: 'task-2-4', title: 'Fixar Ponte H e ligar motores em pares', completed: false, notes: 'Esquerda na Saída A, direita na Saída B.' },
  ]},
  { id: 'phase-3', title: '3. Sensores', subtitle: 'O "Sistema Nervoso"', description: 'Protoboard, servo + ultrassom, fiação e padrão ouro de energia.', order: 3, expanded: false, tasks: [
    { id: 'task-3-1', title: 'Fixar Protoboard e encaixar ESP32', completed: false, notes: 'Posicionar no centro para fácil acesso.' },
    { id: 'task-3-2', title: 'Montar Servo SG90 + HC-SR04 na frente', completed: false, notes: 'Colar HC-SR04 na hélice do servo.' },
    { id: 'task-3-3', title: 'Conectar cabeamento e mapear Pinout', completed: false, notes: 'Anotar: IN1-IN4, Trigger/Echo, PWM servo, DHT11 e LDR.' },
    { id: 'task-3-4', title: 'Arquitetura de Energia: Baterias → Ponte H → ESP32 VIN', completed: false, notes: 'Padrão Ouro: 18650 no 12V da Ponte H, 5V da Ponte H no VIN do ESP32.' },
    { id: 'task-3-5', title: 'Cable Management com abraçadeiras', completed: false, notes: 'Visual impecável para a feira.' },
  ]},
  { id: 'phase-4', title: '4. Inteligência', subtitle: 'Algoritmo de Desvio', description: 'Testes de bancada suspensa e navegação autônoma.', order: 4, expanded: false, tasks: [
    { id: 'task-4-1', title: 'Apoiar chassi em bloco com rodas no ar', completed: false, notes: 'Evita queda da mesa durante testes.' },
    { id: 'task-4-2', title: 'Testar: Frente, Ré, Giro Esq/Dir, Parar', completed: false, notes: 'Ajustar polaridade se lado girar invertido.' },
    { id: 'task-4-3', title: 'Programar rotina de desvio autônomo', completed: false, notes: 'Anda → <15cm → Para → Servo olha → Vira pro mais livre.' },
    { id: 'task-4-4', title: 'Teste de solo com obstáculos', completed: false, notes: 'Validar tempo de reação e velocidade PWM.' },
  ]},
  { id: 'phase-5', title: '5. Telemetria', subtitle: 'A Cartada Final', description: 'Transmissão Wi-Fi para o notebook na mesa de apresentação.', order: 5, expanded: false, tasks: [
    { id: 'task-5-1', title: 'Configurar Wi-Fi AP no ESP32', completed: false, notes: 'Access Point ou Wi-Fi do roteador portátil.' },
    { id: 'task-5-2', title: 'Transmissão periódica DHT11 + LDR a cada 2s', completed: false, notes: 'Enviar via HTTP JSON ou WebSockets.' },
    { id: 'task-5-3', title: 'Montar painel de exibição no notebook', completed: false, notes: 'Dashboard que os jurados verão na mesa.' },
  ]},
];

const DEFAULT_DOCS: DocSection[] = [
  { id: 'doc-overview', title: 'Visão Geral da Missão', icon: '🚀', content: '# Projeto Ares\n\nRover análogo a Marte para feira de ciências.\n\n## Objetivo\nConstruir um robô 4WD autônomo com sensores que transmite dados em tempo real para um notebook, simulando uma missão espacial.\n\n## Equipe\n- Comandante (Líder)\n- Eng. Hardware\n- Eng. Firmware\n- Cientista de Dados\n- Piloto do Rover', order: 1 },
  { id: 'doc-hardware', title: 'Arquitetura de Hardware', icon: '⚡', content: '# Arquitetura de Hardware\n\n## Padrão Ouro de Energia\nBaterias 18650 (7.4V) → Ponte H L298N (12V/GND) → Regulador 5V → ESP32 VIN\n\n## Subsistemas\n- **Cérebro**: ESP32 (Wi-Fi + GPIO)\n- **Músculos**: 4x Motor DC + Ponte H L298N\n- **Olhos**: HC-SR04 + Servo SG90\n- **Ciência**: DHT11 + LDR\n- **Energia**: 2x 18650 Li-ion', order: 2 },
  { id: 'doc-firmware', title: 'Firmware e Software', icon: '💻', content: '# Firmware (ESP32)\n\n## Protocolos\n- Wi-Fi AP para telemetria\n- HTTP JSON ou WebSockets\n- Transmissão a cada 1-2 segundos\n\n## Pinout\nAnotar na documentação os pinos de cada sensor e atuador.', order: 3 },
  { id: 'doc-guide', title: 'Guia de Montagem', icon: '🔧', content: '# Guia de Montagem\n\n## Dicas de Ouro para a Feira\n1. **Pilhas Comuns NÃO** — Use 18650 Li-ion\n2. **Peças Sobressalentes** — Leve jumpers extras e 1 motor reserva\n3. **Cable Management** — Abraçadeiras de nylon para visual impecável\n4. **Teste com Rodas no Ar** — Antes de colocar no chão', order: 4 },
  { id: 'doc-decisions', title: 'Decisões Técnicas', icon: '📋', content: '# Registro de Decisões\n\nDocumente aqui as decisões técnicas importantes tomadas pela equipe durante o desenvolvimento do projeto.', order: 5 },
  { id: 'doc-fair', title: 'Manual da Feira', icon: '🏆', content: '# Manual de Apresentação\n\n## Checklist do Dia\n- [ ] Baterias 18650 carregadas (8.4V)\n- [ ] Notebook com Mission Control aberto\n- [ ] Roteador portátil ligado\n- [ ] Peças sobressalentes na mochila\n- [ ] Abraçadeiras extras\n\n## Fornecedores\n- **Mercado Livre**: Entrega rápida\n- **Shopee/AliExpress**: Preço baixo (3-4 semanas)\n- **MakerHero/Eletrogate**: Com NF para reembolso escolar', order: 6 },
];

// ==========================================
// REDUCER
// ==========================================

function missionReducer(state: MissionData, action: MissionAction): MissionData {
  switch (action.type) {
    case 'SET_MISSION_DATA':
      return action.payload;
    case 'SET_BOM':
      return { ...state, bom: action.payload };
    case 'ADD_BOM_ITEM':
      return { ...state, bom: [...state.bom, action.payload] };
    case 'UPDATE_BOM_ITEM':
      return { ...state, bom: state.bom.map((i) => (i.id === action.payload.id ? action.payload : i)) };
    case 'DELETE_BOM_ITEM':
      return { ...state, bom: state.bom.filter((i) => i.id !== action.payload) };
    case 'SET_PHASES':
      return { ...state, phases: action.payload };
    case 'TOGGLE_TASK': {
      const { phaseId, taskId, completed } = action.payload;
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.id === phaseId
            ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)) }
            : p
        ),
      };
    }
    case 'UPDATE_TASK_NOTES': {
      const { phaseId, taskId, notes } = action.payload;
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.id === phaseId
            ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, notes } : t)) }
            : p
        ),
      };
    }
    case 'ADD_TASK': {
      const { phaseId, task } = action.payload;
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.id === phaseId ? { ...p, tasks: [...p.tasks, task], expanded: true } : p
        ),
      };
    }
    case 'DELETE_TASK': {
      const { phaseId: pId, taskId: tId } = action.payload;
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.id === pId ? { ...p, tasks: p.tasks.filter((t) => t.id !== tId) } : p
        ),
      };
    }
    case 'TOGGLE_PHASE_EXPAND':
      return {
        ...state,
        phases: state.phases.map((p) => (p.id === action.payload ? { ...p, expanded: !p.expanded } : p)),
      };
    case 'EXPAND_ALL_PHASES':
      return { ...state, phases: state.phases.map((p) => ({ ...p, expanded: action.payload })) };
    case 'ADD_AUDIT_LOG':
      return { ...state, logs: [action.payload, ...state.logs] };
    default:
      return state;
  }
}

// ==========================================
// CONTEXT
// ==========================================

interface MissionContextType {
  data: MissionData;
  dispatch: React.Dispatch<MissionAction>;
  chatMessages: ChatMessage[];
  docSections: DocSection[];
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  loading: boolean;
  // Firebase-backed actions
  fbAddBOMItem: (item: Omit<BOMItem, 'id'>) => Promise<void>;
  fbUpdateBOMItem: (id: string, data: Partial<BOMItem>) => Promise<void>;
  fbDeleteBOMItem: (id: string) => Promise<void>;
  fbToggleTask: (phaseId: string, phase: Phase, taskId: string, completed: boolean) => Promise<void>;
  fbUpdateTaskNotes: (phaseId: string, phase: Phase, taskId: string, notes: string) => Promise<void>;
  fbAddTask: (phaseId: string, phase: Phase, task: Task) => Promise<void>;
  fbDeleteTask: (phaseId: string, phase: Phase, taskId: string) => Promise<void>;
  fbTogglePhaseExpand: (phaseId: string, expanded: boolean) => Promise<void>;
  fbSendChat: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  fbUpdateDocSection: (id: string, data: Partial<DocSection>) => Promise<void>;
}

const MissionContext = createContext<MissionContextType | null>(null);

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used within MissionProvider');
  return ctx;
}

// ==========================================
// PROVIDER
// ==========================================

const initialData: MissionData = {
  meta: { projectName: 'Projeto Ares', version: '2.0.0', lastUpdated: '' },
  bom: [],
  phases: [],
  logs: [],
};

export function MissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, dispatch] = useReducer(missionReducer, initialData);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [docSections, setDocSections] = useState<DocSection[]>([]);
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Subscribe to Firestore
  useEffect(() => {
    if (!user) return;

    const unsubs: (() => void)[] = [];
    let loadingResolved = false;

    const resolveLoading = () => {
      if (!loadingResolved) {
        loadingResolved = true;
        setLoading(false);
      }
    };

    // Timeout fallback: if Firestore doesn't respond in 5s, load with defaults
    const timeout = setTimeout(() => {
      if (!loadingResolved) {
        console.warn('[ARES] Firestore timeout — carregando dados padrão localmente');
        dispatch({
          type: 'SET_BOM',
          payload: DEFAULT_BOM.map((item, i) => ({ ...item, id: `local-bom-${i}` })),
        });
        dispatch({ type: 'SET_PHASES', payload: DEFAULT_PHASES });
        setDocSections(DEFAULT_DOCS);
        resolveLoading();
      }
    }, 5000);

    // Check if mission is initialized
    try {
      unsubs.push(
        subscribeMeta(async (meta) => {
          try {
            if (!meta || !(meta as unknown as Record<string, unknown>).initialized) {
              // First time: seed default data
              await seedDefaultData(DEFAULT_BOM, DEFAULT_PHASES, DEFAULT_DOCS);
            }
            resolveLoading();
          } catch (err) {
            console.error('[ARES] Erro ao inicializar missão:', err);
            resolveLoading();
          }
        })
      );

      unsubs.push(subscribeBOM((items: BOMItem[]) => dispatch({ type: 'SET_BOM', payload: items })));
      unsubs.push(subscribePhases((phases: Phase[]) => dispatch({ type: 'SET_PHASES', payload: phases })));
      unsubs.push(subscribeChatMessages((msgs: ChatMessage[]) => setChatMessages(msgs)));
      unsubs.push(subscribeDocs((docs: DocSection[]) => setDocSections(docs)));
    } catch (err) {
      console.error('[ARES] Erro ao conectar ao Firestore:', err);
      resolveLoading();
    }

    return () => {
      clearTimeout(timeout);
      unsubs.forEach((fn) => fn());
    };
  }, [user]);

  const createAuditLog = useCallback((actionStr: string, detailsStr: string, type: AuditLog['type']) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      action: actionStr,
      details: detailsStr,
      user: user?.displayName || user?.email?.split('@')[0] || 'Desconhecido',
      timestamp: new Date().toISOString(),
      type,
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log });
  }, [user]);

  // Firebase-backed action wrappers
  const fbAddBOMItemFn = useCallback(async (item: Omit<BOMItem, 'id'>) => {
    await fbAddBOM(item);
    createAuditLog('Adicionou peça ao BOM', item.name, 'bom');
    addToast('Peça adicionada ao BOM!', 'success');
  }, [addToast, createAuditLog]);

  const fbUpdateBOMItemFn = useCallback(async (id: string, d: Partial<BOMItem>) => {
    await fbUpdateBOM(id, d);
    createAuditLog('Atualizou peça no BOM', d.name || 'Status/Detalhes alterados', 'bom');
  }, [createAuditLog]);

  const fbDeleteBOMItemFn = useCallback(async (id: string) => {
    await fbDeleteBOM(id);
    createAuditLog('Removeu peça do BOM', `ID: ${id}`, 'bom');
    addToast('Peça removida do BOM.', 'info');
  }, [addToast, createAuditLog]);

  const fbToggleTaskFn = useCallback(async (phaseId: string, phase: Phase, taskId: string, completed: boolean) => {
    const updatedTasks = phase.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
    await updatePhaseTasks(phaseId, updatedTasks);
    const task = phase.tasks.find(t => t.id === taskId);
    createAuditLog(completed ? 'Concluiu tarefa' : 'Reabriu tarefa', task?.title || '', 'phase');
  }, [createAuditLog]);

  const fbUpdateTaskNotesFn = useCallback(async (phaseId: string, phase: Phase, taskId: string, notes: string) => {
    const updatedTasks = phase.tasks.map((t) => (t.id === taskId ? { ...t, notes } : t));
    await updatePhaseTasks(phaseId, updatedTasks);
    // Not logging every note keystroke/blur to avoid spam, unless desired.
  }, []);

  const fbAddTaskFn = useCallback(async (phaseId: string, phase: Phase, task: Task) => {
    await addTaskToPhase(phaseId, phase.tasks, task);
    createAuditLog('Criou nova tarefa', task.title, 'phase');
    addToast('Tarefa adicionada!', 'success');
  }, [addToast, createAuditLog]);

  const fbDeleteTaskFn = useCallback(async (phaseId: string, phase: Phase, taskId: string) => {
    const task = phase.tasks.find((t) => t.id === taskId);
    const filtered = phase.tasks.filter((t) => t.id !== taskId);
    await updatePhaseTasks(phaseId, filtered);
    createAuditLog('Excluiu tarefa', task?.title || '', 'phase');
    addToast('Tarefa excluída.', 'info');
  }, [addToast, createAuditLog]);

  const fbTogglePhaseExpandFn = useCallback(async (phaseId: string, expanded: boolean) => {
    await updatePhase(phaseId, { expanded });
  }, []);

  const fbSendChatFn = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    await sendChatMessageToFirestore(message);
  }, []);

  const fbUpdateDocFn = useCallback(async (id: string, d: Partial<DocSection>) => {
    await fbUpdateDoc(id, d);
    createAuditLog('Atualizou documentação', d.title || id, 'doc');
  }, [createAuditLog]);

  return (
    <MissionContext.Provider
      value={{
        data,
        dispatch,
        chatMessages,
        docSections,
        activeView,
        setActiveView,
        toasts,
        addToast,
        removeToast,
        loading,
        fbAddBOMItem: fbAddBOMItemFn,
        fbUpdateBOMItem: fbUpdateBOMItemFn,
        fbDeleteBOMItem: fbDeleteBOMItemFn,
        fbToggleTask: fbToggleTaskFn,
        fbUpdateTaskNotes: fbUpdateTaskNotesFn,
        fbAddTask: fbAddTaskFn,
        fbDeleteTask: fbDeleteTaskFn,
        fbTogglePhaseExpand: fbTogglePhaseExpandFn,
        fbSendChat: fbSendChatFn,
        fbUpdateDocSection: fbUpdateDocFn,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}


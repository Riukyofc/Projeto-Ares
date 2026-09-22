/**
 * PROJETO ARES — BOM (Bill of Materials) View
 */
import { useState } from 'react';
import { useMission } from '../../store/missionStore';
import { PartStatus, type BOMItem } from '../../types/mission';
import { Cpu, Plus, Search, Pencil, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BOMView() {
  const { data, fbAddBOMItem, fbUpdateBOMItem, fbDeleteBOMItem, addToast } = useMission();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);

  // Filter
  const filtered = data.bom.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.functionDesc || '').toLowerCase().includes(search.toLowerCase()) || (item.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalBOM = data.bom.length;
  const toBuy = data.bom.filter((i) => i.status === PartStatus.TO_BUY).length;
  const bought = data.bom.filter((i) => i.status === PartStatus.BOUGHT).length;
  const tested = data.bom.filter((i) => i.status === PartStatus.TESTED).length;
  const minCost = data.bom.reduce((s, i) => s + (i.costMin || 0) * (i.qty || 1), 0);
  const maxCost = data.bom.reduce((s, i) => s + (i.costMax || i.costMin || 0) * (i.qty || 1), 0);

  const toggleDetails = (id: string) => {
    setExpandedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openAdd = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item: BOMItem) => { setEditingItem(item); setModalOpen(true); };

  const handleDelete = async (item: BOMItem) => {
    if (confirm(`Excluir "${item.name}" do BOM?`)) {
      await fbDeleteBOMItem(item.id);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fbUpdateBOMItem(id, { status: status as PartStatus });
    addToast('Status atualizado!', 'success');
  };

  const handleSave = async (formData: Record<string, string>) => {
    const numbers = (formData.cost || '').match(/\d+([.,]\d+)?/g);
    let costMin = 0, costMax = 0;
    if (numbers && numbers.length >= 2) { costMin = parseFloat(numbers[0].replace(',', '.')); costMax = parseFloat(numbers[1].replace(',', '.')); }
    else if (numbers && numbers.length === 1) { costMin = parseFloat(numbers[0].replace(',', '.')); costMax = costMin; }

    const itemData = {
      name: formData.name, category: formData.category, qty: parseInt(formData.qty) || 1,
      costDisplay: formData.cost || `${costMin}`, costMin, costMax,
      status: formData.status as PartStatus, functionDesc: formData.functionDesc, details: formData.details,
    };

    if (editingItem) {
      await fbUpdateBOMItem(editingItem.id, itemData);
      addToast('Peça atualizada!', 'success');
    } else {
      await fbAddBOMItem(itemData);
    }
    setModalOpen(false);
  };

  const statusColor = (s: string) => s === PartStatus.TESTED ? 'var(--accent-green)' : s === PartStatus.BOUGHT ? 'var(--accent-blue)' : 'var(--accent-amber)';

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon"><Cpu size={18} /></div>
          <div>
            <h2 className="section-title">BOM: Lista de Peças e Custos</h2>
            <p className="section-subtitle">Gerenciamento de componentes de hardware</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Adicionar Peça</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-label">Total Estimado</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
            R$ {minCost === maxCost ? minCost : `${minCost}-${maxCost}`}
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-label" style={{ color: 'var(--accent-amber)' }}>A Comprar</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>{toBuy} itens</div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-label" style={{ color: 'var(--accent-blue)' }}>Comprado</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>{bought} itens</div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-label" style={{ color: 'var(--accent-green)' }}>Testado</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>{tested} itens</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Buscar componente, função..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
        </div>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: '160px' }}>
          <option value="all">Todos os Status</option>
          <option value="A Comprar">A Comprar</option>
          <option value="Comprado">Comprado</option>
          <option value="Testado">Testado</option>
        </select>
      </div>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
            <Cpu size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>Nenhuma peça encontrada.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="card"
                style={{ padding: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className={`status-badge status-${item.status === PartStatus.TESTED ? 'nominal' : item.status === PartStatus.BOUGHT ? 'info' : 'warning'}`}>
                      {item.category}
                    </span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Qtd: {item.qty || 1}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{item.functionDesc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Custo</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>R$ {item.costDisplay}</div>
                  </div>
                  <select className="select" value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} style={{ width: 'auto', fontSize: '12px', padding: '6px 10px' }}>
                    <option value="A Comprar">A Comprar</option>
                    <option value="Comprado">Comprado</option>
                    <option value="Testado">Testado</option>
                  </select>
                  <button onClick={() => toggleDetails(item.id)} className="btn btn-ghost" style={{ padding: '6px' }}>
                    {expandedIds.has(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => openEdit(item)} className="btn btn-ghost" style={{ padding: '6px' }}><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(item)} className="btn btn-danger" style={{ padding: '6px' }}><Trash2 size={16} /></button>
                </div>
              </div>
              <AnimatePresence>
                {expandedIds.has(item.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>Detalhes Técnicos:</div>
                      <textarea className="input" rows={2} defaultValue={item.details || ''} onBlur={(e) => fbUpdateBOMItem(item.id, { details: e.target.value })} placeholder="Especificações, links de compra, pinout..." style={{ fontSize: '13px' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      {modalOpen && <BOMModal item={editingItem} onSave={handleSave} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function BOMModal({ item, onSave, onClose }: { item: BOMItem | null; onSave: (data: Record<string, string>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '', category: item?.category || 'Cérebro', qty: String(item?.qty || 1),
    cost: item?.costDisplay || '', status: item?.status || 'A Comprar',
    functionDesc: item?.functionDesc || '', details: item?.details || '',
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-content"
          style={{ padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{item ? 'Editar Peça' : 'Adicionar Nova Peça'}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Nome da Peça *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Placa ESP32" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Categoria</label>
              <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['Cérebro', 'Estrutura', 'Atuadores', 'Sensores', 'Energia', 'Prototipagem', 'Cabeamento', 'Geral'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Quantidade</label>
              <input className="input" type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Custo (R$)</label>
              <input className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Ex: 40 - 60" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Status</label>
              <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="A Comprar">A Comprar</option>
                <option value="Comprado">Comprado</option>
                <option value="Testado">Testado</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Função no Rover</label>
            <input className="input" value={form.functionDesc} onChange={(e) => setForm({ ...form, functionDesc: e.target.value })} placeholder="Ex: Lê sensores e controla motores" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Detalhes e Links</label>
            <textarea className="input" rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Specs, links, pinout..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar Peça</button>
          </div>
        </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

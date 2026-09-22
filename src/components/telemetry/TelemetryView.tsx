/**
 * PROJETO ARES — Telemetry View (Minimalist)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { TelemetryState } from '../../types/mission';
import {
  Activity, Thermometer, Droplets, Sun, Radar,
  Battery, AlertTriangle, Play, Pause, RotateCcw, LineChart,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DataPoint {
  time: string;
  temp: number;
  hum: number;
  ldr: number;
  dist: number;
}

const MAX_POINTS = 30; // 1 min (2s interval)
const MAX_HISTORY = 1000; // Store up to 1000 points for Analytics

function randomBetween(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

export default function TelemetryView() {
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<DataPoint[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    temp: 25, hum: 55, ldr: 400, dist: 80, vbat: 7.8,
    tempMin: 25, tempMax: 25, humMin: 55, humMax: 55, ldrMax: 400,
    tempSum: 25, tempCount: 1, humSum: 55, humCount: 1, anomaly: null,
  });
  const [packetCount, setPacketCount] = useState(0);
  const [viewMode, setViewMode] = useState<'realtime' | 'analytics'>('realtime');

  const tempChartRef = useRef<HTMLCanvasElement>(null);
  const humChartRef = useRef<HTMLCanvasElement>(null);
  const ldrChartRef = useRef<HTMLCanvasElement>(null);
  const tempChartInstance = useRef<Chart | null>(null);
  const humChartInstance = useRef<Chart | null>(null);
  const ldrChartInstance = useRef<Chart | null>(null);

  const createChart = useCallback((canvas: HTMLCanvasElement, label: string, color: string, borderColor: string) => {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label,
          data: [],
          borderColor,
          backgroundColor: color,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            display: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#a1a1aa', font: { size: 10, family: 'Inter' }, maxRotation: 0, maxTicksLimit: 6 },
          },
          y: {
            display: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#a1a1aa', font: { size: 10, family: 'Inter' } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            borderColor: '#333',
            borderWidth: 1,
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
          },
        },
      },
    });
  }, []);

  // Init charts
  useEffect(() => {
    if (tempChartRef.current && !tempChartInstance.current) {
      tempChartInstance.current = createChart(tempChartRef.current, 'Temperatura °C', 'rgba(239, 68, 68, 0.1)', '#ef4444');
    }
    if (humChartRef.current && !humChartInstance.current) {
      humChartInstance.current = createChart(humChartRef.current, 'Umidade %', 'rgba(59, 130, 246, 0.1)', '#3b82f6');
    }
    if (ldrChartRef.current && !ldrChartInstance.current) {
      ldrChartInstance.current = createChart(ldrChartRef.current, 'Luminosidade', 'rgba(245, 158, 11, 0.1)', '#f59e0b');
    }

    return () => {
      tempChartInstance.current?.destroy();
      humChartInstance.current?.destroy();
      ldrChartInstance.current?.destroy();
      tempChartInstance.current = null;
      humChartInstance.current = null;
      ldrChartInstance.current = null;
    };
  }, [createChart]);

  // Simulation loop
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const temp = randomBetween(20, 38);
      const hum = randomBetween(30, 75);
      const ldr = randomBetween(100, 900);
      const dist = randomBetween(5, 150);
      const vbat = randomBetween(6.5, 8.4);

      const point: DataPoint = { time: now, temp, hum, ldr, dist };

      setHistory((prev) => {
        const next = [...prev, point];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });

      setTelemetry((prev) => ({
        temp, hum, ldr, dist, vbat,
        tempMin: Math.min(prev.tempMin, temp),
        tempMax: Math.max(prev.tempMax, temp),
        humMin: Math.min(prev.humMin, hum),
        humMax: Math.max(prev.humMax, hum),
        ldrMax: Math.max(prev.ldrMax, ldr),
        tempSum: prev.tempSum + temp,
        tempCount: prev.tempCount + 1,
        humSum: prev.humSum + hum,
        humCount: prev.humCount + 1,
        anomaly: dist < 15 ? 'OBSTACLE_ALERT' : null,
      }));

      setPacketCount((prev) => prev + 1);

      // Update charts
      const updateChart = (chart: Chart | null, value: number) => {
        if (!chart) return;
        chart.data.labels!.push(now);
        (chart.data.datasets[0].data as number[]).push(value);
        if (chart.data.labels!.length > MAX_POINTS) {
          chart.data.labels!.shift();
          (chart.data.datasets[0].data as number[]).shift();
        }
        chart.update('none');
      };

      updateChart(tempChartInstance.current, temp);
      updateChart(humChartInstance.current, hum);
      updateChart(ldrChartInstance.current, ldr);
    }, 2000);

    return () => clearInterval(interval);
  }, [running]);

  const handleReset = () => {
    setHistory([]);
    setPacketCount(0);
    setRunning(false);
    setTelemetry({
      temp: 25, hum: 55, ldr: 400, dist: 80, vbat: 7.8,
      tempMin: 25, tempMax: 25, humMin: 55, humMax: 55, ldrMax: 400,
      tempSum: 25, tempCount: 1, humSum: 55, humCount: 1, anomaly: null,
    });
    [tempChartInstance, humChartInstance, ldrChartInstance].forEach((ref) => {
      if (ref.current) {
        ref.current.data.labels = [];
        ref.current.data.datasets[0].data = [];
        ref.current.update('none');
      }
    });
  };

  const avgTemp = telemetry.tempCount > 0 ? (telemetry.tempSum / telemetry.tempCount).toFixed(1) : '--';
  const avgHum = telemetry.humCount > 0 ? (telemetry.humSum / telemetry.humCount).toFixed(1) : '--';

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon"><Activity size={18} /></div>
          <div>
            <h2 className="section-title">Telemetria em Tempo Real</h2>
            <p className="section-subtitle">ESP32 → DHT11 + LDR + HC-SR04 • {packetCount} pacotes</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface-hover)', borderRadius: '6px', padding: '2px', marginRight: '8px' }}>
            <button onClick={() => setViewMode('realtime')} className={`btn ${viewMode === 'realtime' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px' }}>
              <Activity size={14} style={{ marginRight: '6px' }} /> Tempo Real
            </button>
            <button onClick={() => setViewMode('analytics')} className={`btn ${viewMode === 'analytics' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px' }}>
              <LineChart size={14} style={{ marginRight: '6px' }} /> Analytics
            </button>
          </div>
          <button onClick={() => setRunning(!running)} className={`btn ${running ? 'btn-danger' : 'btn-primary'}`} style={{ fontSize: '13px', gap: '6px' }}>
            {running ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Iniciar Simulação</>}
          </button>
          <button onClick={handleReset} className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Anomaly Alert */}
      {telemetry.anomaly && (
        <div className="card" style={{
          padding: '16px', marginBottom: '20px',
          borderColor: 'var(--accent-red)',
          background: 'var(--accent-red-bg)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertTriangle size={20} style={{ color: 'var(--accent-red)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-red)' }}>
            ⚠ OBSTÁCULO DETECTADO — Distância: {telemetry.dist}cm
          </span>
        </div>
      )}

      <div style={{ display: viewMode === 'realtime' ? 'block' : 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <SensorCard icon={<Thermometer size={16} />} label="Temperatura" value={`${telemetry.temp}°C`} sub={`Min ${telemetry.tempMin}° / Max ${telemetry.tempMax}° / Avg ${avgTemp}°`} color="var(--accent-red)" />
          <SensorCard icon={<Droplets size={16} />} label="Umidade" value={`${telemetry.hum}%`} sub={`Min ${telemetry.humMin}% / Max ${telemetry.humMax}% / Avg ${avgHum}%`} color="var(--accent-blue)" />
          <SensorCard icon={<Sun size={16} />} label="Luminosidade" value={`${telemetry.ldr}`} sub={`LDR Max: ${telemetry.ldrMax}`} color="var(--accent-amber)" />
          <SensorCard icon={<Radar size={16} />} label="Distância" value={`${telemetry.dist}cm`} sub={telemetry.dist < 15 ? '⚠ OBSTÁCULO!' : 'Via livre'} color={telemetry.dist < 15 ? 'var(--accent-red)' : 'var(--accent-green)'} />
          <SensorCard icon={<Battery size={16} />} label="Bateria" value={`${telemetry.vbat}V`} sub={telemetry.vbat > 7 ? 'Carga OK' : '⚠ Baixa'} color={telemetry.vbat > 7 ? 'var(--accent-green)' : 'var(--accent-amber)'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <ChartCard title="Temperatura (°C)" canvasRef={tempChartRef} />
          <ChartCard title="Umidade (%)" canvasRef={humChartRef} />
          <ChartCard title="Luminosidade (LDR)" canvasRef={ldrChartRef} />
        </div>
      </div>

      {viewMode === 'analytics' && (
        <div className="card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Analytics & Histórico Consolidado
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Total de {history.length} pontos de dados coletados nesta sessão.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Média de Temperatura Global</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-red)' }}>{avgTemp}°C</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Média de Umidade Global</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-blue)' }}>{avgHum}%</div>
            </div>
          </div>
          <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Tabela de Histórico (Últimos 10)</div>
            <table style={{ width: '100%', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 0' }}>Horário</th>
                  <th>Temp</th>
                  <th>Umid</th>
                  <th>LDR</th>
                  <th>Distância</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-10).reverse().map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>{p.time}</td>
                    <td style={{ color: 'var(--accent-red)' }}>{p.temp}°C</td>
                    <td style={{ color: 'var(--accent-blue)' }}>{p.hum}%</td>
                    <td style={{ color: 'var(--accent-amber)' }}>{p.ldr}</td>
                    <td>{p.dist}cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SensorCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="kpi-card animate-fade-in" style={{ opacity: 0, padding: '16px' }}>
      <div className="kpi-label" style={{ color, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
        {sub}
      </div>
    </div>
  );
}

function ChartCard({ title, canvasRef }: { title: string; canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  return (
    <div className="card animate-fade-in" style={{ padding: '20px', opacity: 0 }}>
      <h3 style={{
        fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px',
      }}>
        {title}
      </h3>
      <div style={{ height: '200px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

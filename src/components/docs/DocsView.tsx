/**
 * PROJETO ARES — Documentation View
 */

export default function DocsView() {
  return (
    <div className="animate-fade-in-up" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

        .docs-report-container {
            font-family: 'Courier Prime', 'Courier New', Courier, monospace;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .docs-report-page {
            background-color: #f4f4f0;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }

        .docs-report-page h1, .docs-report-page h2, .docs-report-page h3 {
            text-transform: uppercase;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 5px;
            margin-top: 30px;
            color: #1a1a1a;
        }
        
        .docs-report-page h1 { font-size: 1.4em; }
        .docs-report-page h2 { font-size: 1.2em; }
        .docs-report-page h3 { border-bottom: none; font-size: 1.1em; margin-top: 20px;}

        .docs-report-page p, .docs-report-page li {
            font-size: 10pt;
            text-align: justify;
            color: #1a1a1a;
        }

        .docs-report-page ul {
            padding-left: 20px;
        }
        
        .docs-report-page strong {
            font-weight: 700;
        }

        .docs-stamp {
            color: #c92a2a;
            font-size: 2em;
            font-weight: bold;
            border: 4px solid #c92a2a;
            display: inline-block;
            padding: 5px 15px;
            transform: rotate(-15deg);
            position: absolute;
            top: 50px;
            right: 30px;
            opacity: 0.8;
            pointer-events: none;
        }

        .docs-header-block {
            border: 2px solid #1a1a1a;
            padding: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
        }

        .docs-table-specs {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .docs-table-specs th, .docs-table-specs td {
            border: 1px solid #1a1a1a;
            padding: 8px;
            font-size: 10pt;
            text-align: left;
        }

        .docs-table-specs th {
            background-color: #e0e0d8;
        }

        .docs-footer-warning {
            margin-top: 50px;
            border-top: 2px dashed #1a1a1a;
            padding-top: 10px;
            font-size: 9pt;
            font-weight: bold;
            text-align: center;
        }

        @media print {
            .docs-report-container {
                padding: 0;
            }
            .docs-report-page {
                box-shadow: none;
                width: 100%;
                height: 100%;
                padding: 15mm;
            }
        }
      `}</style>
      
      <div className="docs-report-container">
        <div className="docs-report-page">
            <div className="docs-stamp">ULTRA SECRETO</div>

            <div className="docs-header-block">
                CLASSIFICAÇÃO DO DOCUMENTO: [ ULTRA SECRETO // CONFIDENCIAL ]<br/>
                NÍVEL DE ACESSO: DIRETORIA EXECUTIVA / ENGENHEIRO CHEFE<br/>
                DATA DO RELATÓRIO: 22 DE SETEMBRO DE 2026<br/>
                CÓDIGO DA MISSÃO: ARES-OBA-2026<br/>
                INSTITUIÇÃO: U.E. PROFª EDITH NAIR FURTADO DA SILVA
            </div>

            <h1>RELATÓRIO DE ENGENHARIA E OPERAÇÕES: PROJETO ARES</h1>
            <p><strong>DOCUMENTO DE ESPECIFICAÇÃO DE MISSÃO ANÁLOGA MARCIANA</strong></p>

            <h2>1. RESUMO EXECUTIVO DA MISSÃO</h2>
            <p>O <strong>Projeto Ares</strong> é um programa de engenharia aeroespacial e robótica aplicada, projetado para simular a exploração autônoma do solo marciano. Fundamentado na expertise da instituição como campeã nacional da OBA (Olimpíada Brasileira de Astronomia e Astronáutica), o rover atua como uma plataforma de pesquisa capaz de tomar decisões topográficas em tempo real sem intervenção humana, mitigando a latência de comunicação interplanetária. Os dados climáticos e de navegação são transmitidos via rede sem fio para o Centro de Controle da Missão.</p>

            <h2>2. ESPECIFICAÇÕES DIMENSIONAIS E FÍSICAS</h2>
            <p>Dados extraídos dos blueprints de engenharia para análise de estabilidade em terreno irregular (simulador de solo marciano).</p>
            
            <table className="docs-table-specs">
                <thead>
                    <tr>
                        <th>Parâmetro</th>
                        <th>Medida / Especificação</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Comprimento Total</td>
                        <td>350mm</td>
                    </tr>
                    <tr>
                        <td>Largura Total</td>
                        <td>350mm</td>
                    </tr>
                    <tr>
                        <td>Altura Total</td>
                        <td>125mm (até o topo do arranjo do sensor)</td>
                    </tr>
                    <tr>
                        <td>Distância entre Eixos (Wheelbase)</td>
                        <td>160mm</td>
                    </tr>
                    <tr>
                        <td>Bitola (Track Width)</td>
                        <td>190mm</td>
                    </tr>
                    <tr>
                        <td>Massa Total (Estimada)</td>
                        <td>~680g</td>
                    </tr>
                    <tr>
                        <td>Vão Livre do Solo (Ground Clearance)</td>
                        <td>~38mm</td>
                    </tr>
                </tbody>
            </table>

            <h2>3. SUBSISTEMAS E ARQUITETURA DE HARDWARE (BOM)</h2>
            <p>A arquitetura do rover foi dividida em cinco subsistemas críticos para garantir redundância e eficiência energética.</p>

            <h3>3.1. Cérebro e Processamento (Unidade Lógica)</h3>
            <ul>
                <li><strong>Módulo:</strong> Microcontrolador ESP32-WROOM.</li>
                <li><strong>Função:</strong> Processamento assíncrono das leituras de sensores, cálculo vetorial de desvio de rota e transmissão de dados via protocolo Wi-Fi integrado.</li>
            </ul>

            <h3>3.2. Sistema de Locomoção e Potência (Atuadores)</h3>
            <ul>
                <li><strong>Tração:</strong> Tração integral nas 4 rodas (4WD) com Rodas Robustas de 65mm.</li>
                <li><strong>Motores:</strong> 4x Motores DC (Geared Yellow Motors).</li>
                <li><strong>Controle de Tração:</strong> Módulo Driver Ponte H L298N. Permite rotação independente (giro no próprio eixo).</li>
                <li><strong>Alimentação:</strong> Pack dedicado com 2x Baterias 18650 Li-ion (7.4V / 3000mAh). Circuito isolado termicamente para evitar sobrecarga no microcontrolador (brownout).</li>
            </ul>

            <h3>3.3. Carga Útil Científica e Navegação (Sensores)</h3>
            <ul>
                <li><strong>Navegação Espacial:</strong> Sensor Ultrassônico HC-SR04 montado sobre Micro Servo SG90. Escaneia o ambiente em um raio de 180° com alcance efetivo de 2cm a 400cm.</li>
                <li><strong>Coleta Atmosférica:</strong> Módulo Sensor DHT11 para leitura de Temperatura e Umidade relativa do ambiente.</li>
                <li><strong>Coleta de Radiação:</strong> Módulo Sensor LDR para mapeamento de luminosidade/radiação solar analógica no terreno.</li>
            </ul>

            <h2>4. SOFTWARE E MANUFATURA AVANÇADA</h2>
            <p><strong>Impressão 3D (PETG):</strong> Uso de filamento PETG para peças de alta tensão mecânica, incluindo a torre articulada do sensor ultrassônico, suportes reforçados dos motores e encapsulamento de proteção da placa contra poeira abrasiva.</p>
            <p><strong>Autonomia (C++):</strong> O rover avança até detectar um obstáculo a menos de 15cm. Imediatamente, os motores entram em corte de energia. O servo motor rotaciona o sensor a 90° (esquerda) e 180° (direita). O processador compara os vetores de distância, define a rota mais limpa e aciona a Ponte H para rotação no eixo.</p>
            <p><strong>Telemetria (Python/HTML):</strong> Transmissão contínua (ping) dos dados da carga útil via Wi-Fi/MQTT. Os pacotes são interceptados pelo <em>Mission Control</em> (Web App) rodando no notebook base, exibindo gráficos em tempo real.</p>

            <div className="docs-footer-warning">
                NOTA DOS ENGENHEIROS CHEFES: Este documento consolida a arquitetura primária do Projeto Ares.<br/>
                A reprodução não autorizada deste relatório está sujeita a penalidades do departamento de ciências.
            </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  PointsIcon,
  SkillIcon,
  RenownIcon,
  InspirationIcon,
  CoinIcon,
} from '../common/GameIcons';
import { CLUBS, BOARD_LOCATIONS } from '../../types/board';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'day_phase' | 'locations' | 'night_phase' | 'objectives_styles' | 'events_scoring';

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 3, 2, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rules-modal-container"
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '90vh',
          backgroundColor: '#17110d',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(201, 146, 43, 0.08), transparent 70%)',
          border: '1px solid rgba(243, 195, 67, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(201, 146, 43, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f0ede8',
          fontFamily: 'inherit',
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(243, 195, 67, 0.2)',
            background: 'linear-gradient(90deg, rgba(20, 14, 9, 0.9), rgba(30, 21, 14, 0.9))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎷</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f3c343', fontWeight: 800, letterSpacing: '0.5px' }}>
                Manual de Regras & Guia Oficial
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#a8947f' }}>
                JAM — O Jogo de Cartas e Tabuleiro de Jazz
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="Buscar regra (ex: Inspiração, Vinil, Dado)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(243, 195, 67, 0.3)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                color: '#f0ede8',
                outline: 'none',
                width: '240px',
              }}
            />
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#f0ede8',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Fechar (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── NAVEGAÇÃO POR ABAS ── */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(10, 7, 4, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto',
            padding: '0 1rem',
            gap: '4px',
          }}
        >
          {[
            { id: 'overview', label: '1. Visão Geral', icon: '🎺' },
            { id: 'day_phase', label: '2. Fase de Dia & Movimento', icon: '☀️' },
            { id: 'locations', label: '3. Os 6 Locais da Cidade', icon: '📍' },
            { id: 'night_phase', label: '4. Fase da Noite & Shows', icon: '🌙' },
            { id: 'objectives_styles', label: '5. Objetivos & Estilos', icon: '🎯' },
            { id: 'events_scoring', label: '6. Eventos & Pontuação', icon: '🏆' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                padding: '10px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: activeTab === tab.id ? '#f3c343' : '#a8947f',
                background: activeTab === tab.id ? 'rgba(243, 195, 67, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeTab === tab.id ? '#f3c343' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── CORPO DO MANUAL COM SCROLL ── */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            fontSize: '0.88rem',
            lineHeight: '1.55',
            color: '#e4dacd',
          }}
        >
          {/* ═══════════ 1. VISÃO GERAL ═══════════ */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(243, 195, 67, 0.08)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(243, 195, 67, 0.25)' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#f3c343', fontSize: '1.1rem' }}>🎷 Bem-vindo ao JAM!</h3>
                <p style={{ margin: 0 }}>
                  Você é um músico de jazz na vibrante Era de Ouro do Jazz. Ao longo de <strong>6 rodadas</strong>, você percorrerá a cidade para aprimorar suas habilidades musicais, compor partituras, contratar novos talentos para sua banda, comprar instrumentos e recursos, gravar discos de vinil e fazer apresentações inesquecíveis nos mais prestigiados clubes noturnos!
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PointsIcon size={18} /> Objetivo do Jogo & Vitória
                  </h4>
                  <p style={{ margin: 0 }}>
                    O jogador que acumular a maior quantidade de <strong>Pontos de Vitória (<PointsIcon size={14} /> VP)</strong> ao final da 6ª rodada será coroado a maior lenda viva do Jazz!
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⏳ Estrutura das 6 Rodadas
                  </h4>
                  <p style={{ margin: 0 }}>
                    Cada rodada é dividida em <strong>duas fases consecutivas</strong>:
                    <br /><strong>1. Fase de Dia:</strong> Movimento e ações estratégicas na cidade.
                    <br /><strong>2. Fase da Noite:</strong> Apresentações musicais nos clubes.
                  </p>
                </div>
              </div>

              {/* Componentes Principais */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#f3c343', fontSize: '0.95rem' }}>✨ Atributos e Recursos Principais</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <CoinIcon size={16} /> Moedas
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#cfc4b6' }}>
                      Moeda corrente para contratar músicos, gravar vinis, comprar recursos e pagar taxas.
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#e67e22', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <RenownIcon size={16} /> Renome (1 a 10)
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#cfc4b6' }}>
                      Determina seu prestígio, público base nos shows (Renome × 10) e acesso a clubes exclusivos.
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#c0392b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <SkillIcon size={16} /> Habilidade (2 a 6)
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#cfc4b6' }}>
                      Determina quantos cubos musicais você sorteia do seu saco durante os shows da noite.
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <InspirationIcon size={16} /> Fichas de Inspiração (máx 3)
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#cfc4b6' }}>
                      Permite comprar cubos extras no show, aumentar o nível de composições ou <strong>eliminar cubos indesejados</strong> do seu saco!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ 2. FASE DE DIA & MOVIMENTO ═══════════ */}
          {activeTab === 'day_phase' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f3c343', fontSize: '1.05rem' }}>
                  🎲 Marcador de Tempo (Seu Dado de Ações)
                </h3>
                <p style={{ margin: 0 }}>
                  No início de cada rodada, todos os jogadores começam na <strong>Casa</strong> com seu dado de tempo marcando <strong>5</strong> (ou <strong>6</strong> se possuir o recurso Roadie). A cada turno, o movimento para um novo local é <strong>obrigatório</strong>. O tempo do dado é reduzido pelo custo do movimento.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(46, 204, 113, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#2ecc71' }}>
                    ➡️ A Favor das Setas (Sentido Horário)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li><strong>Custo de Tempo:</strong> Apenas <strong>1 tempo</strong>.</li>
                    <li><strong>Bônus do Local:</strong> O jogador ativa o <strong>Bônus das Setas</strong> do espaço de destino!</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(231, 76, 60, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(231, 76, 60, 0.3)' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#e74c3c' }}>
                    ⬅️ Contra as Setas (Sentido Anti-Horário)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li><strong>Custo de Tempo:</strong> Custa <strong>2 tempos</strong>.</li>
                    <li><strong>Sem Bônus:</strong> O jogador realiza apenas a ação básica do local (a menos que use o recurso <em>Cupons de Desconto</em> ou ative o bônus de 1 moeda no evento <em>Semana de Negócios</em>).</li>
                  </ul>
                </div>
              </div>

              {/* Taxa de Visitação & Dado Neutro */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#f1c40f' }}>💰 Taxa de Visitação</h4>
                  <p style={{ margin: 0 }}>
                    Ao entrar em um local já ocupado por outro jogador (ou pelo Dado Neutro), você deve pagar <strong>1 moeda</strong> para cada marcador presente naquele local. Se estiver sem moedas, você não pode se mover para lá!
                    <br /><small style={{ color: '#a8947f' }}>* O Parque (Local 6) é isento de taxa de visitação.</small>
                  </p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#9b59b6' }}>🎲 Dado Neutro Bloqueador (Partidas de 2 Jogadores)</h4>
                  <p style={{ margin: 0 }}>
                    Em jogos para 2 jogadores, há um Dado Neutro no tabuleiro. Ele ocupa um espaço, cobra taxa de 1 moeda (paga à mesa) e rola para um novo local toda vez que alguém visita o espaço onde ele estava.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ 3. OS 6 LOCAIS DA CIDADE ═══════════ */}
          {activeTab === 'locations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {BOARD_LOCATIONS.map(loc => (
                <div
                  key={loc.index}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: loc.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{loc.icon}</span>
                      <span>Local {loc.index}: {loc.name}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Taxa base: {loc.index === 6 ? 'Grátis' : '1 moeda/ocupante'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.83rem', color: '#f0ede8' }}>
                    <strong>Ação Principal:</strong> {loc.mainActionDescription}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#2ecc71', background: 'rgba(46,204,113,0.08)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(46,204,113,0.2)' }}>
                    🎁 <strong>Bônus das Setas:</strong> {loc.bonusDescription}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════════ 4. FASE DA NOITE & SHOWS ═══════════ */}
          {activeTab === 'night_phase' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(155, 89, 182, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(155, 89, 182, 0.3)' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#9b59b6', fontSize: '1.1rem' }}>🌙 Apresentações nos Clubes de Jazz</h3>
                <p style={{ margin: 0 }}>
                  A noite é o clímax de cada rodada! Os músicos sobem ao palco, o público lota os clubes e os acordes de jazz ecoam pela cidade.
                </p>
              </div>

              {/* Ordem de Apresentação */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#f3c343' }}>🎪 Ordem Oficial das Apresentações</h4>
                <p style={{ margin: '0 0 8px 0' }}>
                  As apresentações ocorrem sequencialmente, do primeiro clube (Mosca Frita) até o último (Graham Bell Hall):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CLUBS.map((c, i) => (
                    <span key={c.id} style={{ background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid rgba(243,195,67,0.3)', color: '#ebdccb' }}>
                      {i + 1}. {c.name}
                    </span>
                  ))}
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#a8947f' }}>
                  * Se houver mais de um jogador no mesmo clube, quem foi ao clube primeiro durante o dia se apresenta primeiro!
                </p>
              </div>

              {/* Passo a Passo do Show */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#f3c343' }}>🎼 Como Funciona a Mecânica de Apresentação:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                    <strong>1. Sorteio de Cubos:</strong> Você puxa do seu saco uma quantidade de cubos igual ao seu nível atual de <strong>Habilidade (<SkillIcon size={14} />)</strong> (mais bônus de recursos como Mestre de Jazz).
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                    <strong>2. Alocação de Notas:</strong> Você distribui os cubos sorteados sobre as notas dos músicos na sua banda. Cubos coloridos preenchem notas da mesma cor ou notas coringa (estrela). Cubos brancos são desafinações e não geram pontos (a menos que tenha o estilo correspondente).
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                    <strong>3. Meta do Clube & Sucesso:</strong> Some os pontos de todas as notas completadas. Se a pontuação for igual ou maior que a <strong>Meta do Clube</strong>, o show foi um sucesso! O primeiro a atingir a meta no clube pode escolher um <strong>Prêmio do Clube</strong> permanente.
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                    <strong>4. Público e Cachê:</strong> O público é igual a (Renome × 10) (+30 com Ficha de Divulgação), respeitando a lotação máxima do clube. As moedas ganhas de cachê são iguais a (Público / 10).
                  </div>
                  <div style={{ background: 'rgba(46,204,113,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(46,204,113,0.25)' }}>
                    <strong>5. 💡 Refinando o Saco (Bag-Building):</strong> Você pode gastar 1 Ficha de Inspiração para <strong>eliminar permanentemente</strong> 1 cubo não-branco sorteado do seu saco, aumentando a concentração de cores fortes para os próximos shows!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ 5. OBJETIVOS, ESTILOS & RECURSOS ═══════════ */}
          {activeTab === 'objectives_styles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f3c343', fontSize: '1.05rem' }}>🎯 Cartas de Objetivo Pessoal</h3>
                <p style={{ margin: 0 }}>
                  No início da partida, cada jogador recebe 1 Carta de Objetivo secreta com 3 metas progressivas. Conforme você cumpre cada meta:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(243,195,67,0.3)' }}>
                    <strong>1ª Meta:</strong> +2 <PointsIcon size={13} /> VP e <strong>Ganha 1 Carta de Estilo</strong> (escolha 1 de 3).
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(243,195,67,0.3)' }}>
                    <strong>2ª Meta:</strong> +3 <PointsIcon size={13} /> VP.
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(243,195,67,0.3)' }}>
                    <strong>3ª Meta:</strong> +5 <PointsIcon size={13} /> VP e <strong>Ganha 1 Carta de Estilo</strong> (escolha 1 de 3).
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#e67e22', fontSize: '1.05rem' }}>🎷 Cartas de Estilo (Poderes Ativos)</h3>
                <p style={{ margin: 0 }}>
                  As Cartas de Estilo conferem habilidades especiais poderosas e permanentes (ou ativáveis durante os shows), como usar cubos brancos como coringas, trocar cubos sorteados, ganhar cachê extra ou compor automaticamente após apresentações. Cada jogador pode manter até 2 cartas de estilo ativas.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#3498db', fontSize: '1.05rem' }}>📦 Cartas de Instrumentos & Recursos</h3>
                <p style={{ margin: 0 }}>
                  Compradas nas Lojas (Local 4), as cartas de recursos melhoram permanentemente sua capacidade (ex: começar com dado no 6 com Roadie, ter 4 músicos com Sala de Ensaio) ou conferem bônus substanciais de <strong>Pontuação de Fim de Jogo</strong> (ex: pontos por nível de músicos, discos gravados, renome ou prêmios de clubes).
                </p>
              </div>
            </div>
          )}

          {/* ═══════════ 6. EVENTOS & PONTUAÇÃO FINAL ═══════════ */}
          {activeTab === 'events_scoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f3c343', fontSize: '1.05rem' }}>🎭 Eventos das Rodadas (Rodadas 2 a 6)</h3>
                <p style={{ margin: 0 }}>
                  No início de cada rodada (da rodada 2 em diante), uma nova carta de Evento entra em vigor para todos os jogadores, alterando dinâmicas da cidade (ex: custos extras de tempo em espaços ocupados, bônus de gravação direta na Gravadora, pagamento de aluguel no fim da rodada ou compra de bônus contra as setas na Semana de Negócios).
                </p>
              </div>

              {/* Tabela de Pontuação de Fim de Jogo */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(243,195,67,0.3)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#f3c343', fontSize: '1.1rem' }}>🏆 Cálculo da Pontuação Final</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#cfc4b6' }}>
                  Ao final da 6ª rodada, os pontos finais de cada jogador são calculados somando:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>1. Pontos Acumulados (<PointsIcon size={14} />):</strong> Pontos de objetivos cumpridos, prêmios de clubes e gravações na Gravadora.
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>2. Cartas de Instrumentos:</strong> Pontos de vitória dos recursos de fim de jogo comprados nas Lojas.
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>3. Ranking de Discos de Vinil:</strong> Bônus de pontuação baseado em quem gravou mais discos de vinil na partida!
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>4. Nível de Renome (<RenownIcon size={14} />):</strong> Metade do seu renome final arredondado para baixo (Renome / 2 VP).
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>5. Moedas Restantes (<CoinIcon size={14} />):</strong> 1 VP para cada 5 moedas inteiras (Moedas / 5 VP).
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>6. Fichas de Inspiração (<InspirationIcon size={14} />):</strong> 1 VP para cada ficha de Inspiração não utilizada.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(10, 7, 4, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#8a7a6e' }}>
            💡 Dica: Você pode consultar este manual a qualquer momento durante a partida sem interromper seu turno!
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{
              padding: '6px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Entendido, vamos tocar!
          </button>
        </div>
      </div>
    </div>
  );
}

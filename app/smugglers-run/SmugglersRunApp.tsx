'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  SKINS, COUNTDOWN_S, AI_LEVELS,
  type SkinId, type AiLevelId,
} from '@/lib/smugglers-run/constants';
import type { MatchRecord } from '@/lib/smugglers-run/types';
import { joinMatchChannel, type SrChannel } from '@/lib/smugglers-run/realtime';
import type { OpponentState } from './game/RaceScene';

const RaceGame = dynamic(() => import('./game/RaceGame'), { ssr: false });

type Phase =
  | 'boot' | 'landing'
  | 'lobby' | 'race' | 'result'      // two-player flow
  | 'solo' | 'ai' | 'solo-result';   // solo flows (test drive / vs computer)

// Countdown starts this long after the server stamps startedAt, giving both
// clients time to notice the flip and boot the canvas before the 3-2-1.
const START_PAD_MS = COUNTDOWN_S * 1000 + 800;

const SKIN_SWATCH: Record<SkinId, string> = {
  bandit: '#c0392b',
  phantom: '#22303f',
  vulture: '#b8860b',
};

// The computer always drives a skin the player didn't pick
function cpuSkin(player: SkinId): SkinId {
  return SKINS.find((s) => s.id !== player)!.id;
}

export default function SmugglersRunApp() {
  const params = useSearchParams();
  const joinToken = params.get('join');

  const [phase, setPhase] = useState<Phase>('boot');
  const [match, setMatch] = useState<MatchRecord | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [skin, setSkin] = useState<SkinId>('bandit');
  const [error, setError] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [localFinished, setLocalFinished] = useState(false);

  // Solo state — test drive and vs-computer share it
  const [soloStartAt, setSoloStartAt] = useState(0);
  const [aiLevel, setAiLevel] = useState<AiLevelId | null>(null);
  const [soloToken, setSoloToken] = useState('TESTDRIVE');
  const [soloTimes, setSoloTimes] = useState<{ me: number | null; cpu: number | null }>(
    { me: null, cpu: null },
  );

  const channelRef = useRef<SrChannel | null>(null);
  const oppRef = useRef<OpponentState>({ x: 0, speed: 0, t: 0, seen: false });
  const matchRef = useRef<MatchRecord | null>(null);
  matchRef.current = match;
  const playerIdRef = useRef('');
  playerIdRef.current = playerId;

  const api = useCallback(async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...init, headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `request failed (${res.status})`);
    return json;
  }, []);

  // ── boot: join via WhatsApp deep-link or land ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (joinToken) {
        try {
          const json = await api(`/api/smugglers-run/match/${joinToken}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'join' }),
          });
          if (cancelled) return;
          setMatch(json.match);
          setPlayerId(json.playerId);
          openChannel(joinToken);
          setPhase(json.match.status === 'racing' ? 'race' : 'lobby');
        } catch (e) {
          if (!cancelled) { setError((e as Error).message); setPhase('landing'); }
        }
      } else {
        setPhase('landing');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── realtime channel (SSE down, POST up) ──────────────────────────────────
  const openChannel = useCallback((token: string) => {
    channelRef.current?.leave();
    oppRef.current = { x: 0, speed: 0, t: 0, seen: false };
    channelRef.current = joinMatchChannel(token, {
      onPos: (e) => {
        if (e.playerId === playerIdRef.current) return;
        oppRef.current.x = e.x;
        oppRef.current.speed = e.speed;
        oppRef.current.t = e.t;
        oppRef.current.seen = true;
      },
      onLobbyChange: () => { void refreshMatch(); },
      onRematch: (e) => { void acceptRematch(e.token); },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => channelRef.current?.leave(), []);

  const refreshMatch = useCallback(async () => {
    const m = matchRef.current;
    if (!m) return;
    try {
      const json = await api(`/api/smugglers-run/match/${m.token}`);
      setMatch(json.match);
      setPlayerId(json.playerId);
    } catch { /* transient poll failure — next tick retries */ }
  }, [api]);

  // Poll as a safety net under the SSE nudges: lobby (ready states) and
  // racing (finish / timeout resolution)
  useEffect(() => {
    if (phase !== 'lobby' && phase !== 'race') return;
    const iv = setInterval(refreshMatch, 2500);
    return () => clearInterval(iv);
  }, [phase, refreshMatch]);

  // Phase transitions driven by the durable record
  useEffect(() => {
    if (!match) return;
    if (phase === 'lobby' && match.status === 'racing') setPhase('race');
    if ((phase === 'race' || phase === 'lobby') && match.status === 'finished') setPhase('result');
    if (match.status === 'expired' && phase !== 'landing') {
      setError('This challenge expired. Fire off a new one.');
      setPhase('landing');
    }
  }, [match, phase]);

  // Host fires the start once both are READY
  useEffect(() => {
    if (phase !== 'lobby' || !match?.guest) return;
    const iAmHost = match.host.id === playerId;
    if (iAmHost && match.host.ready && match.guest.ready && match.status === 'lobby') {
      void (async () => {
        try {
          const json = await api(`/api/smugglers-run/match/${match.token}`, {
            method: 'POST', body: JSON.stringify({ action: 'start' }),
          });
          setMatch(json.match);
        } catch (e) { setError((e as Error).message); }
      })();
    }
  }, [phase, match, playerId, api]);

  // ── two-player actions ────────────────────────────────────────────────────
  async function createChallenge() {
    setError(null);
    try {
      const json = await api('/api/smugglers-run/challenge', {
        method: 'POST', body: JSON.stringify({ skin }),
      });
      setMatch(json.match);
      setPlayerId(json.playerId);
      setWhatsappUrl(json.whatsappUrl);
      setJoinUrl(json.joinUrl);
      openChannel(json.token);
      setPhase('lobby');
    } catch (e) { setError((e as Error).message); }
  }

  async function setMySkin(s: SkinId) {
    setSkin(s);
    const m = matchRef.current;
    if (!m || phase !== 'lobby') return;
    try {
      const json = await api(`/api/smugglers-run/match/${m.token}`, {
        method: 'POST', body: JSON.stringify({ action: 'skin', skin: s }),
      });
      setMatch(json.match);
    } catch (e) { setError((e as Error).message); }
  }

  async function toggleReady() {
    const m = matchRef.current;
    if (!m) return;
    const me = m.host.id === playerId ? m.host : m.guest;
    try {
      const json = await api(`/api/smugglers-run/match/${m.token}`, {
        method: 'POST', body: JSON.stringify({ action: 'ready', ready: !me?.ready }),
      });
      setMatch(json.match);
    } catch (e) { setError((e as Error).message); }
  }

  async function reportFinish(timeMs: number) {
    setLocalFinished(true);
    const m = matchRef.current;
    if (!m) return;
    try {
      const json = await api(`/api/smugglers-run/match/${m.token}`, {
        method: 'POST', body: JSON.stringify({ action: 'finish', timeMs }),
      });
      setMatch(json.match);
    } catch (e) { setError((e as Error).message); }
  }

  async function requestRematch() {
    // Whoever clicks first hosts the next race; the old channel carries the invite.
    try {
      const json = await api('/api/smugglers-run/challenge', {
        method: 'POST', body: JSON.stringify({ skin }),
      });
      channelRef.current?.sendRematch(json.token);
      setMatch(json.match);
      setPlayerId(json.playerId);
      setWhatsappUrl(json.whatsappUrl);
      setJoinUrl(json.joinUrl);
      setLocalFinished(false);
      openChannel(json.token);
      setPhase('lobby');
    } catch (e) { setError((e as Error).message); }
  }

  async function acceptRematch(token: string) {
    try {
      const json = await api(`/api/smugglers-run/match/${token}`, {
        method: 'POST', body: JSON.stringify({ action: 'join' }),
      });
      setMatch(json.match);
      setPlayerId(json.playerId);
      setLocalFinished(false);
      openChannel(token);
      setPhase('lobby');
    } catch (e) { setError((e as Error).message); }
  }

  // ── solo actions ──────────────────────────────────────────────────────────
  function startSolo(level: AiLevelId | null) {
    setAiLevel(level);
    // Fresh token each run → fresh drift layout and fresh CPU dodge rolls
    setSoloToken(level ? `CPU-${Date.now().toString(36)}` : 'TESTDRIVE');
    setSoloTimes({ me: null, cpu: null });
    setSoloStartAt(Date.now() + START_PAD_MS);
    setPhase(level ? 'ai' : 'solo');
  }

  // vs-computer race resolves when both cars have crossed
  useEffect(() => {
    if (phase === 'ai' && soloTimes.me !== null && soloTimes.cpu !== null) {
      setPhase('solo-result');
    }
    if (phase === 'solo' && soloTimes.me !== null) setPhase('solo-result');
  }, [phase, soloTimes]);

  function exitToLanding() {
    channelRef.current?.leave();
    channelRef.current = null;
    setMatch(null);
    setLocalFinished(false);
    setError(null);
    window.history.replaceState(null, '', '/smugglers-run');
    setPhase('landing');
  }

  // ── derived race props ────────────────────────────────────────────────────
  const raceProps = useMemo(() => {
    if (!match || match.status !== 'racing' || !match.startedAt || !match.guest) return null;
    const iAmHost = match.host.id === playerId;
    const me = iAmHost ? match.host : match.guest;
    const opp = iAmHost ? match.guest : match.host;
    return {
      token: match.token,
      laneIndex: (iAmHost ? 0 : 1) as 0 | 1,
      mySkin: me.skin,
      oppSkin: opp.skin,
      startAt: Date.parse(match.startedAt) + START_PAD_MS,
      channelLive: channelRef.current?.live ?? false,
    };
  }, [match, playerId]);

  // ── render ────────────────────────────────────────────────────────────────
  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen text-amber-50" style={{
      background: 'linear-gradient(180deg,#2b3a67 0%,#7a4a3a 55%,#d9a066 100%)',
    }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-widest" style={{ fontFamily: 'monospace' }}>
            🏜️ SMUGGLER&apos;S RUN
          </h1>
          <p className="text-amber-200/80 mt-1 text-sm">
            Two smugglers. One canyon. First to the drop point wins.
          </p>
        </header>
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/60 border border-red-500/50 px-4 py-2 text-sm text-center">
            {error}
          </div>
        )}
        {children}
      </div>
    </main>
  );

  if (phase === 'boot') {
    return shell(<p className="text-center animate-pulse">Rolling into the canyon…</p>);
  }

  if (phase === 'landing') {
    return shell(
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <SkinPicker skin={skin} onPick={setMySkin} />
        <button onClick={createChallenge}
          className="w-full bg-green-600 hover:bg-green-500 font-bold py-3 rounded-lg text-lg">
          🤝 Challenge a Friend
        </button>

        <div className="bg-black/25 rounded-xl p-4">
          <div className="text-center text-xs tracking-widest text-amber-200/70 mb-3">
            🤖 RACE THE COMPUTER
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(AI_LEVELS) as AiLevelId[]).map((lvl) => (
              <button key={lvl} onClick={() => startSolo(lvl)}
                className="bg-amber-600/80 hover:bg-amber-500 font-bold py-2.5 rounded-lg text-sm">
                {AI_LEVELS[lvl].name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => startSolo(null)}
          className="w-full bg-black/30 hover:bg-black/40 border border-amber-200/30 py-2.5 rounded-lg text-sm">
          🔧 Test Drive (empty canyon, just you)
        </button>
        <p className="text-center text-[11px] text-amber-200/50">
          Solo races stay on this machine — only two-player races go on the record.
        </p>
      </div>,
    );
  }

  if (phase === 'lobby' && match) {
    const iAmHost = match.host.id === playerId;
    const me = iAmHost ? match.host : match.guest;
    const bothHere = Boolean(match.guest);
    return shell(
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <div className="bg-black/30 rounded-xl p-5">
          <div className="text-center text-xs tracking-widest text-amber-200/70 mb-2">CHALLENGE TOKEN</div>
          <div className="text-center text-2xl font-mono font-bold tracking-[0.3em]">{match.token}</div>
        </div>

        {iAmHost && !bothHere && (
          <div className="flex flex-col gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="w-full text-center bg-[#25D366] hover:brightness-110 text-black font-bold py-3 rounded-lg">
              📲 Send WhatsApp Challenge
            </a>
            <button
              onClick={() => { navigator.clipboard?.writeText(joinUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="w-full bg-black/30 border border-amber-200/30 py-2 rounded-lg text-sm">
              {copied ? '✓ Copied' : 'Copy join link'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[match.host, match.guest].map((p, i) => (
            <div key={i} className={`rounded-xl p-4 text-center border ${p?.ready ? 'border-green-400 bg-green-900/30' : 'border-amber-200/20 bg-black/25'}`}>
              <div className="text-xs text-amber-200/60 mb-1">{i === 0 ? 'HOST' : 'CHALLENGER'}</div>
              {p ? (
                <>
                  <div className="font-bold truncate">{p.name}{p.id === playerId ? ' (you)' : ''}</div>
                  <div className="mt-2 mx-auto w-16 h-6 rounded" style={{ background: SKIN_SWATCH[p.skin] }} />
                  <div className="mt-2 text-sm">{p.ready ? '✅ READY' : '⏳ not ready'}</div>
                </>
              ) : (
                <div className="text-amber-200/50 text-sm py-4 animate-pulse">waiting for a rival…</div>
              )}
            </div>
          ))}
        </div>

        <SkinPicker skin={me?.skin ?? skin} onPick={setMySkin} compact />

        <button onClick={toggleReady} disabled={!bothHere}
          className={`w-full font-bold py-3 rounded-lg text-lg ${me?.ready ? 'bg-amber-700 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-500'} disabled:opacity-40`}>
          {me?.ready ? 'UNREADY' : 'READY'}
        </button>
        <p className="text-center text-xs text-amber-200/60">
          Race starts automatically when both smugglers are READY.
        </p>
      </div>,
    );
  }

  if (phase === 'race' && raceProps) {
    return shell(
      <div>
        <RaceGame
          {...raceProps}
          ai={null}
          opp={oppRef.current}
          onPos={(x, speed) => channelRef.current?.sendPos(x, speed)}
          onFinish={reportFinish}
        />
        {localFinished && (
          <p className="text-center mt-4 animate-pulse text-amber-200/90">
            You crossed the line — waiting on your rival…
          </p>
        )}
      </div>,
    );
  }

  if (phase === 'solo' || phase === 'ai') {
    return shell(
      <div>
        <RaceGame
          token={soloToken}
          laneIndex={0}
          mySkin={skin}
          oppSkin={phase === 'ai' ? cpuSkin(skin) : null}
          ai={phase === 'ai' ? aiLevel : null}
          startAt={soloStartAt}
          channelLive={false}
          opp={null}
          onPos={() => {}}
          onFinish={(t) => setSoloTimes((prev) => ({ ...prev, me: t }))}
          onAiFinish={(t) => setSoloTimes((prev) => ({ ...prev, cpu: t }))}
        />
        {phase === 'ai' && soloTimes.me !== null && soloTimes.cpu === null && (
          <p className="text-center mt-4 animate-pulse text-amber-200/90">
            You crossed the line — the computer is still in the canyon…
          </p>
        )}
      </div>,
    );
  }

  if (phase === 'solo-result') {
    if (aiLevel && soloTimes.me !== null && soloTimes.cpu !== null) {
      const iWon = soloTimes.me <= soloTimes.cpu;
      const delta = Math.abs(soloTimes.me - soloTimes.cpu) / 1000;
      return shell(
        <ResultCard
          title={iWon ? '🏆 YOU MADE THE DROP' : '🚨 BUSTED BY THE MACHINE'}
          subtitle={`${iWon ? 'You beat' : 'You lost to'} the ${AI_LEVELS[aiLevel].name} driver by ${delta.toFixed(2)}s — your run: ${(soloTimes.me / 1000).toFixed(2)}s`}
          onRematch={() => startSolo(aiLevel)}
          rematchLabel="Run it back"
          onExit={exitToLanding}
        />,
      );
    }
    return shell(
      <ResultCard
        title="🔧 TEST DRIVE COMPLETE"
        subtitle={`Canyon time: ${((soloTimes.me ?? 0) / 1000).toFixed(2)}s`}
        onRematch={() => startSolo(null)}
        rematchLabel="Run it again"
        onExit={exitToLanding}
      />,
    );
  }

  if (phase === 'result' && match?.result && match.guest) {
    const iWon = match.result.winnerId === playerId;
    const winner = match.result.winnerId === match.host.id ? match.host : match.guest;
    const sub = match.result.decidedBy === 'timeout'
      ? 'Rival never made it out of the canyon.'
      : `Margin: ${(match.result.deltaMs / 1000).toFixed(2)}s`;
    return shell(
      <ResultCard
        title={iWon ? '🏆 YOU MADE THE DROP' : '🚨 BUSTED'}
        subtitle={`${winner.name} takes it. ${sub}`}
        onRematch={requestRematch}
        rematchLabel="Rematch"
        onExit={exitToLanding}
      />,
    );
  }

  return shell(<p className="text-center animate-pulse">…</p>);
}

function SkinPicker({ skin, onPick, compact }: {
  skin: SkinId; onPick: (s: SkinId) => void; compact?: boolean;
}) {
  return (
    <div>
      {!compact && <div className="text-center text-xs tracking-widest text-amber-200/70 mb-2">PICK YOUR RIDE</div>}
      <div className="grid grid-cols-3 gap-3">
        {SKINS.map((s) => (
          <button key={s.id} onClick={() => onPick(s.id)}
            className={`rounded-xl p-3 border text-center transition ${skin === s.id ? 'border-amber-300 bg-black/40' : 'border-amber-200/20 bg-black/20 hover:bg-black/30'}`}>
            <div className="mx-auto w-14 h-5 rounded mb-2" style={{ background: SKIN_SWATCH[s.id] }} />
            <div className="text-xs font-bold">{s.name}</div>
          </button>
        ))}
      </div>
      {!compact && <p className="text-center text-[11px] text-amber-200/50 mt-2">Same engine under every hood — pick your colours.</p>}
    </div>
  );
}

function ResultCard({ title, subtitle, onRematch, rematchLabel, onExit }: {
  title: string; subtitle: string; onRematch: () => void; rematchLabel: string; onExit: () => void;
}) {
  return (
    <div className="max-w-md mx-auto text-center bg-black/30 rounded-xl p-8 flex flex-col gap-4">
      <div className="text-3xl font-black" style={{ fontFamily: 'monospace' }}>{title}</div>
      <p className="text-amber-200/90">{subtitle}</p>
      <button onClick={onRematch}
        className="w-full bg-green-600 hover:bg-green-500 font-bold py-3 rounded-lg">
        🔁 {rematchLabel}
      </button>
      <button onClick={onExit}
        className="w-full bg-black/30 border border-amber-200/30 py-2.5 rounded-lg text-sm">
        Exit to canyon mouth
      </button>
    </div>
  );
}

'use client';

// Mounts the Phaser game. Loaded with next/dynamic({ ssr: false }) — Phaser
// touches window/document at import time, so this module must stay client-only.

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { RaceScene, type RaceSceneData, type OpponentState } from './RaceScene';
import { VIEW_W, VIEW_H, type SkinId, type AiLevelId } from '@/lib/smugglers-run/constants';

export interface RaceGameProps {
  token: string;
  laneIndex: 0 | 1;
  mySkin: SkinId;
  oppSkin: SkinId | null;
  ai: AiLevelId | null;
  startAt: number;
  channelLive: boolean;
  opp: OpponentState | null; // parent mutates this from realtime packets
  onPos: (x: number, speed: number) => void;
  onFinish: (timeMs: number) => void;
  onAiFinish?: (timeMs: number) => void;
}

export default function RaceGame(props: RaceGameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  // Latest callbacks without re-creating the game on parent re-renders
  const cbRef = useRef({ onPos: props.onPos, onFinish: props.onFinish, onAiFinish: props.onAiFinish });
  cbRef.current = { onPos: props.onPos, onFinish: props.onFinish, onAiFinish: props.onAiFinish };

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    const data: RaceSceneData = {
      token: props.token,
      laneIndex: props.laneIndex,
      mySkin: props.mySkin,
      oppSkin: props.oppSkin,
      ai: props.ai,
      startAt: props.startAt,
      opp: props.opp,
      channelLive: props.channelLive,
      onPos: (x, s) => cbRef.current.onPos(x, s),
      onFinish: (t) => cbRef.current.onFinish(t),
      onAiFinish: (t) => cbRef.current.onAiFinish?.(t),
    };

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: VIEW_W,
      height: VIEW_H,
      backgroundColor: '#2b3a67',
      physics: { default: 'arcade' },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    });
    game.scene.add('race', RaceScene, true, data);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl" />;
}

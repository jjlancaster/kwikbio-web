// Phaser 3 race scene — desert canyon, two-lane road, arcade physics.
// All art is generated at boot (Graphics → textures): no sprite assets to load,
// nothing external to fetch, fast on mobile.

import * as Phaser from 'phaser';
import {
  VIEW_W, VIEW_H, START_X, FINISH_X, WORLD_W,
  ROAD_TOP, ROAD_BOTTOM, LANE_CENTERS, LANE_DRIFT,
  MAX_SPEED, ACCEL, BRAKE, COAST_DRAG, STEER_SPEED,
  DRIFT_W, DRIFT_SPEED_CAP, POS_BROADCAST_HZ,
  driftPositions, tokenSeed, mulberry32,
  AI_LEVELS, type AiLevelId, SKINS, type SkinId,
} from '@/lib/smugglers-run/constants';

export interface OpponentState {
  x: number;
  speed: number;
  t: number;      // epoch ms of last update
  seen: boolean;  // any packet received yet
}

export interface RaceSceneData {
  token: string;
  laneIndex: 0 | 1;          // 0 = host lane (top), 1 = guest lane
  mySkin: SkinId;
  oppSkin: SkinId | null;    // null → solo test drive
  startAt: number;           // epoch ms when the countdown hits GO
  opp: OpponentState | null; // mutated externally from realtime packets
  ai: AiLevelId | null;      // set → opponent is the computer, simulated locally
  channelLive: boolean;
  onPos: (x: number, speed: number) => void;
  onFinish: (timeMs: number) => void;
  onAiFinish?: (timeMs: number) => void;
}

const MPH_PER_PXS = 0.235; // 600 px/s ≈ 141 mph — flavour, not physics

function skinColors(id: SkinId) {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

export class RaceScene extends Phaser.Scene {
  private d!: RaceSceneData;
  private car!: Phaser.Physics.Arcade.Image;
  private oppCar: Phaser.GameObjects.Image | null = null;
  private throttleKeys: Phaser.Input.Keyboard.Key[] = [];
  private brakeKeys: Phaser.Input.Keyboard.Key[] = [];
  private upKeys: Phaser.Input.Keyboard.Key[] = [];
  private downKeys: Phaser.Input.Keyboard.Key[] = [];
  private touchThrottle = false;
  private touchSteer = 0;

  private mesaFar!: Phaser.GameObjects.TileSprite;
  private mesaNear!: Phaser.GameObjects.TileSprite;
  private road!: Phaser.GameObjects.TileSprite;

  private speedText!: Phaser.GameObjects.Text;
  private speedBar!: Phaser.GameObjects.Rectangle;
  private deltaText!: Phaser.GameObjects.Text;
  private centerText!: Phaser.GameObjects.Text;

  private myDriftZones: { x: number }[] = [];
  private speed = 0;
  private finished = false;
  private lastGoShown = false;
  private posAccum = 0;

  // Computer driver state (solo "Race the Computer" mode)
  private aiDrifts: { x: number; dodged: boolean }[] = [];
  private aiX = START_X - 60;
  private aiSpeed = 0;
  private aiFinished = false;

  constructor() { super('race'); }

  init(data: RaceSceneData) { this.d = data; }

  create() {
    this.makeTextures();
    this.buildWorld();
    this.buildCars();
    this.buildHud();
    this.bindInput();
    this.cameras.main.setBounds(0, 0, WORLD_W, VIEW_H);
    this.cameras.main.startFollow(this.car, false, 1, 0, -VIEW_W * 0.28, 0);
  }

  // ── procedural art ────────────────────────────────────────────────────────
  private makeTextures() {
    const g = this.add.graphics();

    // Sky: dawn gradient
    g.fillGradientStyle(0x2b3a67, 0x2b3a67, 0xe8a34c, 0xf4c26b, 1);
    g.fillRect(0, 0, VIEW_W, VIEW_H);
    g.generateTexture('sr-sky', VIEW_W, VIEW_H);
    g.clear();

    // Far mesas (silhouettes)
    g.fillStyle(0x7a4a3a, 1);
    const farTops = [200, 150, 230, 170, 210, 140, 190];
    let x = 0;
    for (let i = 0; i < farTops.length; i++) {
      const w = 90 + ((i * 53) % 100);
      g.fillPoints([
        new Phaser.Geom.Point(x, 300),
        new Phaser.Geom.Point(x + w * 0.18, farTops[i]),
        new Phaser.Geom.Point(x + w * 0.82, farTops[i] + 8),
        new Phaser.Geom.Point(x + w, 300),
      ], true);
      x += w + 20 + ((i * 31) % 40);
    }
    g.fillRect(0, 296, 960, 8);
    g.generateTexture('sr-mesa-far', 960, 304);
    g.clear();

    // Near canyon rim (darker, chunkier)
    g.fillStyle(0x5c3226, 1);
    x = 0;
    const nearTops = [90, 40, 110, 60, 100, 30];
    for (let i = 0; i < nearTops.length; i++) {
      const w = 140 + ((i * 71) % 120);
      g.fillPoints([
        new Phaser.Geom.Point(x, 220),
        new Phaser.Geom.Point(x + w * 0.12, nearTops[i]),
        new Phaser.Geom.Point(x + w * 0.9, nearTops[i] + 14),
        new Phaser.Geom.Point(x + w, 220),
      ], true);
      x += w;
    }
    g.fillRect(0, 216, 1100, 6);
    g.generateTexture('sr-mesa-near', 1100, 222);
    g.clear();

    // Road strip: sand shoulders, asphalt, centre dashes
    const rh = VIEW_H - ROAD_TOP;
    g.fillStyle(0xd9a066, 1);
    g.fillRect(0, 0, 240, rh);
    g.fillStyle(0x3a3a3f, 1);
    g.fillRect(0, ROAD_TOP - ROAD_TOP, 240, ROAD_BOTTOM - ROAD_TOP);
    g.fillStyle(0xd9a066, 1);
    g.fillRect(0, ROAD_BOTTOM - ROAD_TOP, 240, rh - (ROAD_BOTTOM - ROAD_TOP));
    g.fillStyle(0xf5e6c8, 1);
    const midY = (ROAD_BOTTOM - ROAD_TOP) / 2 - 2;
    g.fillRect(20, midY, 60, 4);
    g.fillRect(140, midY, 60, 4);
    g.generateTexture('sr-road', 240, rh);
    g.clear();

    // Muscle car (side view, one texture per skin)
    for (const skin of SKINS) {
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(22, 34, 9);
      g.fillCircle(74, 34, 9);
      g.fillStyle(skin.body, 1);
      g.fillRoundedRect(0, 16, 96, 16, 5);      // body
      g.fillRoundedRect(24, 4, 44, 16, 6);      // cabin
      g.fillStyle(0x9adcf0, 0.9);
      g.fillRect(30, 7, 14, 10);                // windshield
      g.fillStyle(skin.stripe, 1);
      g.fillRect(0, 20, 96, 4);                 // racing stripe
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(88, 10, 8, 6);                 // spoiler
      g.generateTexture(`sr-car-${skin.id}`, 96, 44);
      g.clear();
    }

    // Sand drift patch
    g.fillStyle(0xe8c07a, 0.95);
    g.fillEllipse(DRIFT_W / 2, 16, DRIFT_W, 26);
    g.fillStyle(0xd9a066, 0.9);
    g.fillEllipse(DRIFT_W / 2 - 20, 12, DRIFT_W * 0.5, 14);
    g.generateTexture('sr-drift', DRIFT_W, 32);
    g.destroy();
  }

  private buildWorld() {
    this.add.image(VIEW_W / 2, VIEW_H / 2, 'sr-sky').setScrollFactor(0);
    this.mesaFar = this.add.tileSprite(VIEW_W / 2, 175, VIEW_W, 304, 'sr-mesa-far').setScrollFactor(0);
    this.mesaNear = this.add.tileSprite(VIEW_W / 2, 290, VIEW_W, 222, 'sr-mesa-near').setScrollFactor(0);
    this.road = this.add.tileSprite(
      VIEW_W / 2, ROAD_TOP + (VIEW_H - ROAD_TOP) / 2, VIEW_W, VIEW_H - ROAD_TOP, 'sr-road',
    ).setScrollFactor(0);

    // Start & finish gates live in world space
    for (const [gx, color, label] of [
      [START_X, 0xf5e6c8, 'START'],
      [FINISH_X, 0xe63946, 'DROP POINT'],
    ] as const) {
      this.add.rectangle(gx, ROAD_TOP - 26, 8, 52, color);
      this.add.rectangle(gx, (ROAD_TOP + ROAD_BOTTOM) / 2, 6, ROAD_BOTTOM - ROAD_TOP, color, 0.35);
      this.add.text(gx, ROAD_TOP - 64, label, {
        fontFamily: 'monospace', fontSize: '16px', color: '#f5e6c8', fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // Sand drifts for my lane (opponent's lane hazards are theirs to dodge)
    const laneY = LANE_CENTERS[this.d.laneIndex];
    this.myDriftZones = driftPositions(this.d.token, this.d.laneIndex).map((dx) => ({ x: dx }));
    for (const z of this.myDriftZones) {
      this.add.image(z.x + DRIFT_W / 2, laneY + 10, 'sr-drift').setAlpha(0.9);
    }
    // Show the rival lane's drifts faintly for scenery
    if (this.d.oppSkin) {
      const oppLaneY = LANE_CENTERS[this.d.laneIndex === 0 ? 1 : 0];
      for (const dx of driftPositions(this.d.token, this.d.laneIndex === 0 ? 1 : 0)) {
        this.add.image(dx + DRIFT_W / 2, oppLaneY + 10, 'sr-drift').setAlpha(0.35);
      }
    }
  }

  private buildCars() {
    const laneY = LANE_CENTERS[this.d.laneIndex];
    this.car = this.physics.add.image(START_X - 60, laneY, `sr-car-${this.d.mySkin}`);
    this.car.setDepth(5);
    if (this.d.oppSkin) {
      const oppLaneY = LANE_CENTERS[this.d.laneIndex === 0 ? 1 : 0];
      this.oppCar = this.add.image(START_X - 60, oppLaneY, `sr-car-${this.d.oppSkin}`)
        .setDepth(4).setAlpha(0.92);
    }
    if (this.d.ai) {
      // Pre-roll the computer's dodge outcomes so a rerun of the same token
      // and difficulty replays identically.
      const skill = AI_LEVELS[this.d.ai].dodgeSkill;
      const rand = mulberry32(tokenSeed(this.d.token) ^ 0xa1a1a1);
      const oppLane = this.d.laneIndex === 0 ? 1 : 0;
      this.aiDrifts = driftPositions(this.d.token, oppLane)
        .map((x) => ({ x, dodged: rand() < skill }));
    }
  }

  private buildHud() {
    // Speedometer — bottom centre
    this.add.rectangle(VIEW_W / 2, VIEW_H - 34, 260, 52, 0x000000, 0.45)
      .setScrollFactor(0).setDepth(10);
    this.speedBar = this.add.rectangle(VIEW_W / 2 - 120, VIEW_H - 22, 4, 8, 0xf4c26b)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);
    this.speedText = this.add.text(VIEW_W / 2, VIEW_H - 44, '0 mph', {
      fontFamily: 'monospace', fontSize: '22px', color: '#f5e6c8', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    // Opponent delta — top centre
    this.deltaText = this.add.text(VIEW_W / 2, 22, '', {
      fontFamily: 'monospace', fontSize: '20px', color: '#f5e6c8', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    // Countdown / status
    this.centerText = this.add.text(VIEW_W / 2, VIEW_H / 2 - 40, '', {
      fontFamily: 'monospace', fontSize: '72px', color: '#f5e6c8', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12);
  }

  private bindInput() {
    const kb = this.input.keyboard!;
    const key = (k: number) => kb.addKey(k);
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.throttleKeys = [key(K.RIGHT), key(K.D), key(K.SPACE)];
    this.brakeKeys = [key(K.LEFT), key(K.A)];
    this.upKeys = [key(K.UP), key(K.W)];
    this.downKeys = [key(K.DOWN), key(K.S)];

    // Touch: hold to throttle; vertical drag steers within the lane
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.touchThrottle = true;
      this.touchSteer = p.y < VIEW_H / 2 ? -1 : 1;
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.touchThrottle) this.touchSteer = p.y < VIEW_H / 2 ? -1 : 1;
    });
    this.input.on('pointerup', () => { this.touchThrottle = false; this.touchSteer = 0; });
  }

  // ── main loop ─────────────────────────────────────────────────────────────
  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs, 50) / 1000;
    const now = Date.now();
    const untilGo = this.d.startAt - now;

    this.updateParallax();

    if (untilGo > 0) {
      this.centerText.setText(String(Math.ceil(untilGo / 1000)));
      this.updateHud();
      return;
    }
    if (!this.lastGoShown) {
      this.lastGoShown = true;
      this.centerText.setText('SMUGGLE!');
      this.time.delayedCall(900, () => {
        if (!this.finished) this.centerText.setText('');
      });
    }

    if (!this.finished) this.drive(dt, now);
    if (this.d.ai && !this.aiFinished) this.aiDrive(dt, now);
    this.updateOpponent(now);
    this.updateHud();
  }

  // Computer driver: same accel/drag model as the player, throttle always
  // down, with difficulty deciding top speed, drift dodging, and rubber-band.
  private aiDrive(dt: number, now: number) {
    const lvl = AI_LEVELS[this.d.ai!];
    let cap = MAX_SPEED * lvl.speedMul;

    if (lvl.rubberBandPx > 0) {
      const lead = this.aiX - this.car.x;
      if (lead > lvl.rubberBandPx) cap *= 0.75;             // let the player back in
      else if (lead < -lvl.rubberBandPx) cap = Math.min(cap * 1.08, MAX_SPEED);
    }
    const inDrift = this.aiDrifts.some(
      (z) => !z.dodged && this.aiX + 40 > z.x && this.aiX - 40 < z.x + DRIFT_W,
    );
    if (inDrift) cap = Math.min(cap, MAX_SPEED * DRIFT_SPEED_CAP);

    this.aiSpeed += ACCEL * dt;
    if (this.aiSpeed > cap) this.aiSpeed = Math.max(cap, this.aiSpeed - ACCEL * 2.4 * dt);
    this.aiX += this.aiSpeed * dt;

    if (this.oppCar) {
      this.oppCar.x = this.aiX;
      // Visible swerve when it dodges a drift
      const oppLaneY = LANE_CENTERS[this.d.laneIndex === 0 ? 1 : 0];
      const nearDodge = this.aiDrifts.some(
        (z) => z.dodged && this.aiX + 120 > z.x && this.aiX - 60 < z.x + DRIFT_W,
      );
      this.oppCar.y = Phaser.Math.Linear(
        this.oppCar.y, nearDodge ? oppLaneY - LANE_DRIFT : oppLaneY, 4 * dt,
      );
      this.oppCar.setAngle(inDrift ? Math.sin(now / 40) * 2 : 0);
    }

    if (this.aiX >= FINISH_X) {
      this.aiFinished = true;
      this.aiSpeed = 0;
      this.d.onAiFinish?.(now - this.d.startAt);
    }
  }

  private drive(dt: number, now: number) {
    const throttle =
      this.touchThrottle ||
      this.throttleKeys.some((k) => k.isDown) || this.upKeys.some((k) => k.isDown);
    const brake = this.brakeKeys.some((k) => k.isDown) || this.downKeys.some((k) => k.isDown);

    const inDrift = this.myDriftZones.some(
      (z) => this.car.x + 40 > z.x && this.car.x - 40 < z.x + DRIFT_W,
    );
    const cap = inDrift ? MAX_SPEED * DRIFT_SPEED_CAP : MAX_SPEED;

    if (brake) this.speed -= BRAKE * dt;
    else if (throttle) this.speed += ACCEL * dt;
    else this.speed -= COAST_DRAG * dt;
    if (this.speed > cap) this.speed = Math.max(cap, this.speed - ACCEL * 2.4 * dt);
    this.speed = Phaser.Math.Clamp(this.speed, 0, MAX_SPEED);

    // Steering: keyboard up/down steers when not used for throttle/brake — use
    // W/S vs arrows interchangeably, so steering is up/down keys while moving.
    let steer = this.touchSteer;
    if (this.upKeys.some((k) => k.isDown)) steer = -1;
    if (this.downKeys.some((k) => k.isDown)) steer = 1;
    const laneY = LANE_CENTERS[this.d.laneIndex];
    const targetY = Phaser.Math.Clamp(
      this.car.y + steer * STEER_SPEED * dt, laneY - LANE_DRIFT, laneY + LANE_DRIFT,
    );
    this.car.setY(steer === 0 ? Phaser.Math.Linear(this.car.y, laneY, 1.2 * dt) : targetY);

    this.car.setVelocityX(this.speed);
    this.car.setAngle(inDrift ? Math.sin(now / 40) * 2 : 0);

    // Broadcast my position at a fixed rate
    this.posAccum += dt;
    if (this.posAccum >= 1 / POS_BROADCAST_HZ) {
      this.posAccum = 0;
      this.d.onPos(this.car.x, this.speed);
    }

    if (this.car.x >= FINISH_X) {
      this.finished = true;
      this.speed = 0;
      this.car.setVelocityX(0);
      this.centerText.setText('FINISHED!');
      this.d.onPos(this.car.x, 0);
      this.d.onFinish(now - this.d.startAt);
    }
  }

  private updateOpponent(now: number) {
    if (this.d.ai) return; // computer car is driven in aiDrive
    if (!this.oppCar || !this.d.opp) return;
    const o = this.d.opp;
    if (!o.seen) return;
    // Dead-reckon from the last packet, capped so a stale packet doesn't sprint
    const age = Math.min((now - o.t) / 1000, 0.6);
    const predicted = o.x + o.speed * age;
    this.oppCar.x = Phaser.Math.Linear(this.oppCar.x, predicted, 0.25);
  }

  private updateParallax() {
    const sx = this.cameras.main.scrollX;
    this.mesaFar.tilePositionX = sx * 0.15;
    this.mesaNear.tilePositionX = sx * 0.4;
    this.road.tilePositionX = sx;
  }

  private updateHud() {
    const mph = Math.round(this.speed * MPH_PER_PXS);
    this.speedText.setText(`${mph} mph`);
    this.speedBar.width = Math.max(4, (this.speed / MAX_SPEED) * 240);
    this.speedBar.fillColor = this.speed > MAX_SPEED * 0.85 ? 0xe63946 : 0xf4c26b;

    if (!this.d.oppSkin) {
      this.deltaText.setText('TEST DRIVE');
      return;
    }
    let oppX: number;
    let oppSpeed: number;
    if (this.d.ai) {
      oppX = this.aiX;
      oppSpeed = this.aiSpeed;
    } else {
      const o = this.d.opp;
      if (!this.d.channelLive) { this.deltaText.setText('RIVAL: NO SIGNAL'); return; }
      if (!o?.seen) { this.deltaText.setText('RIVAL: …'); return; }
      oppX = o.x;
      oppSpeed = o.speed;
    }
    const gap = this.car.x - oppX;
    const ref = Math.max(this.speed, oppSpeed, 120);
    const secs = gap / ref;
    if (Math.abs(secs) < 0.05) this.deltaText.setText('DEAD HEAT');
    else if (secs > 0) this.deltaText.setText(`+${secs.toFixed(1)}s AHEAD`).setColor('#8ee08e');
    else this.deltaText.setText(`${secs.toFixed(1)}s BEHIND`).setColor('#f08e8e');
  }
}

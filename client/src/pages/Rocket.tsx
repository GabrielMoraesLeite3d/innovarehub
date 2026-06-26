import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, CheckCircle2, ClipboardCheck, MessageSquare, Pencil, Plus, RocketIcon, Send, ShieldCheck, Target, ThumbsDown, ThumbsUp, UserRound, XCircle,
  Activity, BadgeCheck, BatteryCharging, Boxes, Box, Calculator, ChevronRight, CircuitBoard, Cpu, Download, Database, Gauge, GraduationCap, HeartHandshake,
  Layers3, MousePointer2, PackageCheck, RadioTower, Rocket, Satellite, ShieldAlert, SlidersHorizontal, Sparkles, Wrench, Zap
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode, type ChangeEvent, type FocusEvent } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import '@/rocket-cad.css';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type NoseType = "conica" | "ogival" | "parabolica" | "eliptica" | "hemisferica";
type FinType = "trapezoidal" | "triangular" | "retangular" | "eliptica";
type MaterialKey = "fibra" | "aluminio" | "pla" | "papelao" | "carbono" | "compensado" | "pvc";
type MassMode = "auto" | "manual";
type PayloadType = "cansat" | "cubesat" | "scientific" | "probe" | "ballast" | "custom";
type CubeSatUnits = "1U" | "1.5U" | "2U" | "3U" | "6U" | "12U" | "custom";
type GrainGeometry = "core" | "bates" | "star" | "slot" | "endburner" | "custom";
type GrainInhibition = "external" | "faces" | "total" | "none" | "custom";
type MotorMountType = "threaded" | "flanged" | "snapring" | "bolted" | "friction" | "custom";
type RetainerType = "aft_ring" | "snap_ring" | "screw_cap" | "bayonet" | "custom";
type ActivePart = "mission" | "nose" | "body" | "transition" | "fins" | "motor" | "recovery" | "payload" | "electronics" | "simulation" | "learning" | "export";

type RocketConfig = {
  mission: {
    name: string;
    objective: string;
    targetApogee: number;
    launchAltitude: number;
    windSpeed: number;
    airDensity: number;
    temperature: number;
  };
  nose: {
    type: NoseType;
    lengthMm: number;
    baseDiameterMm: number;
    wallMm: number;
    massG: number;
    massMode?: MassMode;
    material: MaterialKey;
  };
  body: {
    lengthMm: number;
    outerDiameterMm: number;
    innerDiameterMm: number;
    wallMm: number;
    massG: number;
    massMode?: MassMode;
    material: MaterialKey;
    couplerLengthMm: number;
    railButtonDistanceMm: number;
  };
  transition: {
    enabled: boolean;
    lengthMm: number;
    foreDiameterMm: number;
    aftDiameterMm: number;
    massG: number;
    massMode?: MassMode;
  };
  fins: {
    type: FinType;
    count: number;
    rootChordMm: number;
    tipChordMm: number;
    spanMm: number;
    sweepMm: number;
    thicknessMm: number;
    massEachG: number;
    massMode?: MassMode;
    material: MaterialKey;
  };
  motor: {
    name: string;
    casingDiameterMm: number;
    casingLengthMm: number;
    casingWallMm: number;
    chamberDiameterMm: number;
    chamberLengthMm: number;
    dryMassG: number;
    dryMassMode?: MassMode;
    propellantMassG: number;
    propellantMassMode?: MassMode;
    avgThrustN: number;
    peakThrustN: number;
    burnTimeS: number;
    throatDiameterMm: number;
    nozzleExitDiameterMm: number;
    nozzleConvergentAngleDeg: number;
    nozzleDivergentAngleDeg: number;
    nozzleConvergentLengthMm: number;
    nozzleDivergentLengthMm: number;
    chamberPressureBar: number;
    grainCount: number;
    grainLengthMm: number;
    grainOuterDiameterMm: number;
    grainCoreDiameterMm: number;
    grainSpacingMm: number;
    grainGeometry: GrainGeometry;
    grainInhibition: GrainInhibition;
    mountType: MotorMountType;
    retainerType: RetainerType;
    propellantType?: string;
  };
  recovery: {
    parachuteDiameterMm: number;
    drogueDiameterMm: number;
    cordLengthMm: number;
    ejectionDelayS: number;
    massG: number;
    massMode?: MassMode;
    parachuteType: "hemisferico" | "toroide";
  };
  payload: {
    name: string;
    type: PayloadType;
    cubesatUnits: CubeSatUnits;
    lengthMm: number;
    diameterMm: number;
    massG: number;
    massMode?: MassMode;
    cgFromNoseMm: number;
  };
  electronics: {
    batteryMassG: number;
    avionicsMassG: number;
    sensorMassG: number;
    radioMassG: number;
    massMode?: MassMode;
    powerBudgetW: number;
    telemetryRateHz: number;
  };
};

type Preset = {
  id: string;
  label: string;
  description: string;
  config: RocketConfig;
};

type MassValue = {
  estimatedG: number;
  manualG: number;
  effectiveG: number;
  mode: MassMode;
  method: string;
};

type MassBreakdown = {
  nose: MassValue;
  body: MassValue;
  transition: MassValue;
  finEach: MassValue;
  finsTotal: MassValue;
  motorDry: MassValue;
  propellant: MassValue;
  recovery: MassValue;
  payload: MassValue;
  electronics: MassValue;
  dryTotalG: number;
  initialTotalG: number;
  autoSharePct: number;
};

const materialLabels: Record<MaterialKey, string> = {
  fibra: "Fibra de vidro",
  aluminio: "Alumínio",
  pla: "PLA / impressão 3D",
  papelao: "Tubo fenólico/papelão",
  carbono: "Fibra de carbono",
  compensado: "Compensado aeronáutico",
  pvc: "PVC",
};

const materialDensityGcm3: Record<MaterialKey, number> = {
  fibra: 1.85,
  aluminio: 2.7,
  pla: 1.24,
  papelao: 0.72,
  carbono: 1.6,
  compensado: 0.56,
  pvc: 1.4,
};

const massModeLabels: Record<MassMode, string> = {
  auto: "massa calculada",
  manual: "massa manual medida",
};

const noseLabels: Record<NoseType, string> = {
  conica: "Cônica",
  ogival: "Ogival",
  parabolica: "Parabólica",
  eliptica: "Elíptica",
  hemisferica: "Hemisférica",
};

const finLabels: Record<FinType, string> = {
  trapezoidal: "Trapezoidal",
  triangular: "Triangular",
  retangular: "Retangular",
  eliptica: "Elíptica",
};

const payloadTypeLabels: Record<PayloadType, string> = {
  cansat: "CanSat cilíndrico",
  cubesat: "CubeSat / PocketQube educacional",
  scientific: "Payload científico / sensores",
  probe: "Sonda / experimento embarcado",
  ballast: "Lastro calibrado",
  custom: "Módulo personalizado",
};

const cubesatUnitLabels: Record<CubeSatUnits, string> = {
  "1U": "1U · 100 × 100 × 113,5 mm",
  "1.5U": "1.5U · 100 × 100 × 170,2 mm",
  "2U": "2U · 100 × 100 × 227 mm",
  "3U": "3U · 100 × 100 × 340,5 mm",
  "6U": "6U · 200 × 100 × 340,5 mm",
  "12U": "12U · 200 × 200 × 340,5 mm",
  custom: "Customizado · dimensões livres",
};

const cubesatProfiles: Record<CubeSatUnits, { lengthMm: number; diameterMm: number; massG: number; name: string }> = {
  "1U": { lengthMm: 113.5, diameterMm: 100, massG: 1000, name: "CubeSat educacional 1U" },
  "1.5U": { lengthMm: 170.2, diameterMm: 100, massG: 1500, name: "CubeSat educacional 1.5U" },
  "2U": { lengthMm: 227, diameterMm: 100, massG: 2000, name: "CubeSat educacional 2U" },
  "3U": { lengthMm: 340.5, diameterMm: 100, massG: 3000, name: "CubeSat educacional 3U" },
  "6U": { lengthMm: 340.5, diameterMm: 200, massG: 6000, name: "CubeSat educacional 6U" },
  "12U": { lengthMm: 340.5, diameterMm: 200, massG: 12000, name: "CubeSat educacional 12U" },
  custom: { lengthMm: 240, diameterMm: 120, massG: 1800, name: "CubeSat customizado" },
};

const grainGeometryLabels: Record<GrainGeometry, string> = {
  core: "Porto central cilíndrico",
  bates: "BATES educacional segmentado",
  star: "Estrela conceitual",
  slot: "Slot conceitual",
  endburner: "End-burner conceitual",
  custom: "Customizado / documentado",
};

const grainInhibitionLabels: Record<GrainInhibition, string> = {
  external: "Externo inibido",
  faces: "Faces inibidas",
  total: "Inibição total documentada",
  none: "Sem inibição",
  custom: "Inibição customizada",
};

const motorMountLabels: Record<MotorMountType, string> = {
  threaded: "Rosqueado",
  flanged: "Flangeado",
  snapring: "Snap-ring",
  bolted: "Retentor aparafusado",
  friction: "Fricção / berço ajustado",
  custom: "Montagem customizada",
};

const retainerLabels: Record<RetainerType, string> = {
  aft_ring: "Anel traseiro",
  snap_ring: "Anel elástico / snap-ring",
  screw_cap: "Tampa rosqueada",
  bayonet: "Baioneta",
  custom: "Retentor customizado",
};

const propellantOptions: Record<string, string> = {
  knsb_fine: "Sorbitol (KNSB - oxidante finamente moído)",
  knsb_coarse: "Sorbitol (KNSB - oxidante levemente moído)",
  knsu: "Sacarose (KNSU)",
  kndx: "Dextrose (KNDX)",
  kner_coarse: "Eritritol (KNER - oxidante levemente moído)",
  knmn_coarse: "Manitol (KNMN - oxidante levemente moído)",
  knxy: "Xilitol (KNXY)",
};

const propellantDensities: Record<string, number> = {
  knsb_fine: 1.841,
  knsb_coarse: 1.810,
  knsu: 1.889,
  kndx: 1.868,
  kner_coarse: 1.820,
  knmn_coarse: 1.830,
  knxy: 1.800,
};

const propellantGammas: Record<string, number> = {
  knsb_fine: 1.135,
  knsb_coarse: 1.135,
  knsu: 1.136,
  kndx: 1.131,
  kner_coarse: 1.130,
  knmn_coarse: 1.132,
  knxy: 1.133,
};

const baseConfig: RocketConfig = {
  mission: {
    name: "Innovare Rocket N1",
    objective: "Missão educativa com payload e telemetria",
    targetApogee: 800,
    launchAltitude: 0,
    windSpeed: 3,
    airDensity: 1.225,
    temperature: 15,
  },
  nose: {
    type: "ogival",
    lengthMm: 260,
    baseDiameterMm: 82,
    wallMm: 2.2,
    massG: 160,
    material: "fibra",
  },
  body: {
    lengthMm: 1040,
    outerDiameterMm: 82,
    innerDiameterMm: 77.6,
    wallMm: 2.2,
    massG: 720,
    material: "fibra",
    couplerLengthMm: 140,
    railButtonDistanceMm: 520,
  },
  transition: {
    enabled: false,
    lengthMm: 90,
    foreDiameterMm: 82,
    aftDiameterMm: 65,
    massG: 80,
  },
  fins: {
    type: "trapezoidal",
    count: 4,
    rootChordMm: 190,
    tipChordMm: 92,
    spanMm: 95,
    sweepMm: 62,
    thicknessMm: 4,
    massEachG: 58,
    material: "compensado",
  },
  motor: {
    name: "Motor educativo I-235",
    casingDiameterMm: 54,
    casingLengthMm: 360,
    casingWallMm: 3.2,
    chamberDiameterMm: 47,
    chamberLengthMm: 255,
    dryMassG: 430,
    propellantMassG: 620,
    avgThrustN: 235,
    peakThrustN: 360,
    burnTimeS: 2.05,
    throatDiameterMm: 13.5,
    nozzleExitDiameterMm: 30,
    nozzleConvergentAngleDeg: 45,
    nozzleDivergentAngleDeg: 15,
    nozzleConvergentLengthMm: 28,
    nozzleDivergentLengthMm: 52,
    chamberPressureBar: 38,
    grainCount: 4,
    grainLengthMm: 54,
    grainOuterDiameterMm: 43,
    grainCoreDiameterMm: 16,
    grainSpacingMm: 4,
    grainGeometry: "bates",
    grainInhibition: "external",
    mountType: "snapring",
    retainerType: "aft_ring",
    propellantType: "knsb_fine",
  },
  recovery: {
    parachuteDiameterMm: 950,
    drogueDiameterMm: 280,
    cordLengthMm: 3200,
    ejectionDelayS: 7,
    massG: 210,
    parachuteType: "hemisferico",
  },
  payload: {
    name: "CanSat telemetria básica",
    type: "cansat",
    cubesatUnits: "1U",
    lengthMm: 150,
    diameterMm: 66,
    massG: 380,
    cgFromNoseMm: 520,
  },
  electronics: {
    batteryMassG: 72,
    avionicsMassG: 64,
    sensorMassG: 38,
    radioMassG: 42,
    powerBudgetW: 8,
    telemetryRateHz: 10,
  },
};

const presets: Preset[] = [
  {
    id: "zero",
    label: "Começar do zero",
    description: "Projeto livre com dimensões moderadas para edição manual.",
    config: {
      ...baseConfig,
      mission: { ...baseConfig.mission, name: "Projeto livre Innovare", targetApogee: 500 },
      nose: { ...baseConfig.nose, type: "conica", lengthMm: 210, baseDiameterMm: 65, massG: 95 },
      body: { ...baseConfig.body, lengthMm: 780, outerDiameterMm: 65, innerDiameterMm: 60.6, massG: 430 },
      fins: { ...baseConfig.fins, count: 3, rootChordMm: 150, tipChordMm: 70, spanMm: 70, massEachG: 34 },
      motor: { ...baseConfig.motor, name: "Motor educativo G-95", casingDiameterMm: 38, casingLengthMm: 245, avgThrustN: 95, peakThrustN: 150, burnTimeS: 1.7, dryMassG: 220, propellantMassG: 280, throatDiameterMm: 9.5, chamberPressureBar: 28 },
      payload: { ...baseConfig.payload, type: "custom", name: "Payload livre inicial", lengthMm: 90, diameterMm: 50, massG: 220, cgFromNoseMm: 360 },
    },
  },
  {
    id: "cansat300",
    label: "CanSat 300 m",
    description: "Missão inicial para ensino, recuperação e telemetria simples.",
    config: {
      ...baseConfig,
      mission: { ...baseConfig.mission, name: "CanSat 300 m", targetApogee: 300 },
      nose: { ...baseConfig.nose, lengthMm: 185, baseDiameterMm: 60, massG: 82 },
      body: { ...baseConfig.body, lengthMm: 660, outerDiameterMm: 60, innerDiameterMm: 56, wallMm: 2, massG: 360 },
      fins: { ...baseConfig.fins, type: "triangular", count: 3, rootChordMm: 135, tipChordMm: 18, spanMm: 62, sweepMm: 78, massEachG: 25 },
      motor: { ...baseConfig.motor, name: "Motor educativo F-84", casingDiameterMm: 29, casingLengthMm: 210, avgThrustN: 84, peakThrustN: 130, burnTimeS: 1.45, dryMassG: 150, propellantMassG: 220, throatDiameterMm: 8, chamberPressureBar: 24 },
      payload: { ...baseConfig.payload, type: "cansat", name: "CanSat primário", lengthMm: 115, diameterMm: 52, massG: 280, cgFromNoseMm: 330 },
      recovery: { ...baseConfig.recovery, parachuteDiameterMm: 720, massG: 145 },
    },
  },
  {
    id: "n1800",
    label: "Nível 1 · 800 m",
    description: "Configuração de treino com estabilidade, payload e recuperação.",
    config: baseConfig,
  },
  {
    id: "payload1500",
    label: "Payload 1500 m",
    description: "Arquitetura para carga científica, eletrônica e massa útil maior.",
    config: {
      ...baseConfig,
      mission: { ...baseConfig.mission, name: "Payload 1500 m", targetApogee: 1500 },
      nose: { ...baseConfig.nose, type: "parabolica", lengthMm: 330, baseDiameterMm: 102, massG: 260 },
      body: { ...baseConfig.body, lengthMm: 1420, outerDiameterMm: 102, innerDiameterMm: 96.8, wallMm: 2.6, massG: 1180 },
      transition: { ...baseConfig.transition, enabled: true, foreDiameterMm: 102, aftDiameterMm: 82, lengthMm: 120, massG: 130 },
      fins: { ...baseConfig.fins, rootChordMm: 260, tipChordMm: 125, spanMm: 132, sweepMm: 85, thicknessMm: 5, massEachG: 94 },
      motor: { ...baseConfig.motor, name: "Motor educativo J-420", casingDiameterMm: 75, casingLengthMm: 520, avgThrustN: 420, peakThrustN: 640, burnTimeS: 2.55, dryMassG: 820, propellantMassG: 1050, throatDiameterMm: 17, chamberPressureBar: 45 },
      payload: { ...baseConfig.payload, type: "scientific", name: "Payload científico modular", lengthMm: 240, diameterMm: 84, massG: 760, cgFromNoseMm: 720 },
      electronics: { ...baseConfig.electronics, batteryMassG: 120, avionicsMassG: 110, sensorMassG: 90, radioMassG: 76, powerBudgetW: 14, telemetryRateHz: 20 },
    },
  },
  {
    id: "carrier3000",
    label: "Carrier 3000 m",
    description: "Veículo demonstrativo para payload modular, CubeSat educativo e alta energia.",
    config: {
      ...baseConfig,
      mission: { ...baseConfig.mission, name: "Carrier 3000 m", targetApogee: 3000 },
      nose: { ...baseConfig.nose, type: "eliptica", lengthMm: 460, baseDiameterMm: 135, massG: 520, material: "carbono" },
      body: { ...baseConfig.body, lengthMm: 1980, outerDiameterMm: 135, innerDiameterMm: 128.6, wallMm: 3.2, massG: 2620, material: "carbono" },
      transition: { ...baseConfig.transition, enabled: true, foreDiameterMm: 135, aftDiameterMm: 102, lengthMm: 165, massG: 240 },
      fins: { ...baseConfig.fins, type: "trapezoidal", count: 4, rootChordMm: 340, tipChordMm: 170, spanMm: 178, sweepMm: 120, thicknessMm: 7, massEachG: 180, material: "carbono" },
      motor: { ...baseConfig.motor, name: "Motor educativo L-820", casingDiameterMm: 98, casingLengthMm: 820, avgThrustN: 820, peakThrustN: 1220, burnTimeS: 3.2, dryMassG: 1850, propellantMassG: 2100, throatDiameterMm: 24, chamberPressureBar: 52 },
      recovery: { ...baseConfig.recovery, parachuteDiameterMm: 1850, drogueDiameterMm: 520, massG: 520 },
      payload: { ...baseConfig.payload, type: "cubesat", cubesatUnits: "3U", name: "CubeSat educativo 3U / payload modular", lengthMm: 340.5, diameterMm: 100, massG: 3000, cgFromNoseMm: 1030 },
      electronics: { ...baseConfig.electronics, batteryMassG: 180, avionicsMassG: 150, sensorMassG: 135, radioMassG: 110, powerBudgetW: 24, telemetryRateHz: 50 },
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function downloadFile(name: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function nosePath(type: NoseType, startX: number, centerY: number, length: number, height: number) {
  const endX = startX + length;
  const top = centerY - height / 2;
  const bottom = centerY + height / 2;

  if (type === "conica") return `M ${startX} ${centerY} L ${endX} ${top} L ${endX} ${bottom} Z`;
  if (type === "hemisferica") return `M ${endX} ${top} C ${startX + length * 0.05} ${top}, ${startX + length * 0.05} ${bottom}, ${endX} ${bottom} Z`;
  if (type === "eliptica") return `M ${startX} ${centerY} C ${startX + length * 0.18} ${top - height * 0.04}, ${endX - length * 0.22} ${top}, ${endX} ${top} L ${endX} ${bottom} C ${endX - length * 0.22} ${bottom}, ${startX + length * 0.18} ${bottom + height * 0.04}, ${startX} ${centerY} Z`;
  if (type === "parabolica") return `M ${startX} ${centerY} Q ${startX + length * 0.52} ${top}, ${endX} ${top} L ${endX} ${bottom} Q ${startX + length * 0.52} ${bottom}, ${startX} ${centerY} Z`;
  return `M ${startX} ${centerY} C ${startX + length * 0.36} ${top - height * 0.08}, ${endX - length * 0.18} ${top}, ${endX} ${top} L ${endX} ${bottom} C ${endX - length * 0.18} ${bottom}, ${startX + length * 0.36} ${bottom + height * 0.08}, ${startX} ${centerY} Z`;
}

function noseHighlightPath(type: NoseType, startX: number, centerY: number, length: number, height: number) {
  const endX = startX + length;
  const y = centerY - height * 0.22;
  if (type === "conica") return `M ${startX + length * 0.12} ${centerY - 1} L ${endX - 10} ${y}`;
  if (type === "hemisferica") return `M ${startX + length * 0.22} ${centerY - height * 0.12} C ${startX + length * 0.28} ${centerY - height * 0.32}, ${endX - length * 0.24} ${y - 3}, ${endX - 8} ${y}`;
  return `M ${startX + length * 0.13} ${centerY - 2} C ${startX + length * 0.36} ${centerY - height * 0.36}, ${endX - length * 0.34} ${y - 5}, ${endX - 8} ${y}`;
}

function finPath(type: FinType, x: number, root: number, tip: number, span: number, sweep: number, bodyBottom: number) {
  if (type === "triangular") return `M ${x} ${bodyBottom} L ${x - sweep} ${bodyBottom + span} L ${x + root} ${bodyBottom} Z`;
  if (type === "retangular") return `M ${x} ${bodyBottom} L ${x} ${bodyBottom + span} L ${x + root} ${bodyBottom + span} L ${x + root} ${bodyBottom} Z`;
  if (type === "eliptica") return `M ${x} ${bodyBottom} C ${x + root * 0.25} ${bodyBottom + span}, ${x + root * 0.75} ${bodyBottom + span}, ${x + root} ${bodyBottom} Z`;
  return `M ${x} ${bodyBottom} L ${x + sweep} ${bodyBottom + span} L ${x + sweep + tip} ${bodyBottom + span} L ${x + root} ${bodyBottom} Z`;
}

function getMotorDerived(motor: RocketConfig["motor"]) {
  const throatAreaMm2 = Math.PI * Math.pow(motor.throatDiameterMm / 2, 2);
  const exitAreaMm2 = Math.PI * Math.pow(motor.nozzleExitDiameterMm / 2, 2);
  const chamberAreaMm2 = Math.PI * Math.pow(motor.chamberDiameterMm / 2, 2);
  const portAreaMm2 = Math.PI * Math.pow(motor.grainCoreDiameterMm / 2, 2);
  const grainAnnulusAreaMm2 = Math.max(Math.PI * (Math.pow(motor.grainOuterDiameterMm / 2, 2) - Math.pow(motor.grainCoreDiameterMm / 2, 2)), 0);
  const grainVolumeCm3 = grainAnnulusAreaMm2 * motor.grainLengthMm * motor.grainCount / 1000;
  return {
    throatAreaMm2,
    exitAreaMm2,
    expansionRatio: exitAreaMm2 / Math.max(throatAreaMm2, 1),
    chamberVolumeCm3: chamberAreaMm2 * motor.chamberLengthMm / 1000,
    chamberLdRatio: motor.chamberLengthMm / Math.max(motor.chamberDiameterMm, 1),
    portAreaMm2,
    grainPackLengthMm: motor.grainCount * motor.grainLengthMm + Math.max(motor.grainCount - 1, 0) * motor.grainSpacingMm,
    grainVolumeCm3,
    grainLoadingGcm3: motor.propellantMassG / Math.max(grainVolumeCm3, 1),
    nozzleLengthMm: motor.nozzleConvergentLengthMm + motor.nozzleDivergentLengthMm,
  };
}

function activeMassMode(mode?: MassMode): MassMode {
  return mode ?? "auto";
}

function chooseMass(mode: MassMode | undefined, manualG: number, estimatedG: number, method: string): MassValue {
  const selectedMode = activeMassMode(mode);
  const safeEstimated = Math.max(round(estimatedG, 1), 0);
  const safeManual = Math.max(round(manualG, 1), 0);
  return {
    estimatedG: safeEstimated,
    manualG: safeManual,
    effectiveG: selectedMode === "manual" ? safeManual : safeEstimated,
    mode: selectedMode,
    method,
  };
}

function tubeShellVolumeCm3(outerDiameterMm: number, innerDiameterMm: number, lengthMm: number) {
  const outerRcm = Math.max(outerDiameterMm, 0) / 20;
  const innerRcm = Math.max(Math.min(innerDiameterMm, outerDiameterMm - 0.1), 0) / 20;
  return Math.PI * Math.max(outerRcm ** 2 - innerRcm ** 2, 0) * Math.max(lengthMm, 0) / 10;
}

function frustumShellVolumeCm3(foreDiameterMm: number, aftDiameterMm: number, lengthMm: number, wallMm: number) {
  const r1 = Math.max(foreDiameterMm, 0) / 20;
  const r2 = Math.max(aftDiameterMm, 0) / 20;
  const h = Math.max(lengthMm, 0) / 10;
  const slant = Math.sqrt((r1 - r2) ** 2 + h ** 2);
  const surfaceArea = Math.PI * (r1 + r2) * slant;
  return surfaceArea * Math.max(wallMm, 0.1) / 10;
}

function estimateNoseMassG(nose: RocketConfig["nose"]) {
  const radiusCm = nose.baseDiameterMm / 20;
  const lengthCm = nose.lengthMm / 10;
  const wallCm = Math.max(nose.wallMm, 0.2) / 10;
  const density = materialDensityGcm3[nose.material];
  const shapeFactor: Record<NoseType, number> = { conica: 1, ogival: 1.18, parabolica: 1.12, eliptica: 1.22, hemisferica: 0.82 };
  const slant = Math.sqrt(radiusCm ** 2 + lengthCm ** 2);
  const surfaceArea = Math.PI * radiusCm * slant * shapeFactor[nose.type];
  const baseRing = Math.PI * radiusCm ** 2 * wallCm * 0.22;
  return (surfaceArea * wallCm + baseRing) * density;
}

function estimateFinEachMassG(fins: RocketConfig["fins"]) {
  const shapeAreaMm2 = fins.type === "triangular"
    ? (fins.rootChordMm * fins.spanMm) / 2
    : fins.type === "retangular"
      ? fins.rootChordMm * fins.spanMm
      : fins.type === "eliptica"
        ? Math.PI * (fins.rootChordMm / 2) * fins.spanMm * 0.78
        : ((fins.rootChordMm + fins.tipChordMm) / 2) * fins.spanMm;
  const volumeCm3 = Math.max(shapeAreaMm2, 0) / 100 * Math.max(fins.thicknessMm, 0.5) / 10;
  return volumeCm3 * materialDensityGcm3[fins.material] * 1.08;
}

function estimatePayloadMassG(payload: RocketConfig["payload"]) {
  if (payload.type === "cubesat") {
    return cubesatProfiles[payload.cubesatUnits].massG;
  }
  const lengthCm = Math.max(payload.lengthMm, 1) / 10;
  const diameterCm = Math.max(payload.diameterMm, 1) / 10;
  const cylindricalVolume = Math.PI * (diameterCm / 2) ** 2 * lengthCm;
  const boxVolume = diameterCm * diameterCm * lengthCm;
  const densityByType: Record<PayloadType, number> = {
    cansat: 0.28,
    cubesat: 0.42,
    scientific: 0.34,
    probe: 0.31,
    ballast: 1.35,
    custom: 0.24,
  };
  const volume = payload.type === "custom" ? (cylindricalVolume + boxVolume) / 2 : cylindricalVolume;
  return volume * densityByType[payload.type];
}

function estimateMotorDryMassG(motor: RocketConfig["motor"]) {
  const casingInner = Math.max(motor.casingDiameterMm - motor.casingWallMm * 2, 1);
  const casingShell = tubeShellVolumeCm3(motor.casingDiameterMm, casingInner, motor.casingLengthMm) * 2.7;
  const throatR = Math.max(motor.throatDiameterMm, 1) / 20;
  const exitR = Math.max(motor.nozzleExitDiameterMm, motor.throatDiameterMm + 0.1) / 20;
  const nozzleLengthCm = Math.max(motor.nozzleConvergentLengthMm + motor.nozzleDivergentLengthMm, 1) / 10;
  const nozzleEnvelope = (Math.PI * nozzleLengthCm * (exitR ** 2 + exitR * throatR + throatR ** 2) / 3) * 1.85 * 0.72;
  const endHardware = Math.PI * (motor.casingDiameterMm / 20) ** 2 * Math.max(motor.casingWallMm / 10, 0.1) * 2.7 * 1.65;
  return casingShell + nozzleEnvelope + endHardware;
}

function estimateRecoveryMassG(recovery: RocketConfig["recovery"]) {
  const mainAreaM2 = Math.PI * (recovery.parachuteDiameterMm / 2000) ** 2;
  const drogueAreaM2 = Math.PI * (recovery.drogueDiameterMm / 2000) ** 2;
  const cordM = recovery.cordLengthMm / 1000;
  return mainAreaM2 * 55 + drogueAreaM2 * 42 + cordM * 7.5 + 38;
}

function estimateElectronicsMassG(electronics: RocketConfig["electronics"]) {
  return clamp(95 + electronics.powerBudgetW * 8.5 + electronics.telemetryRateHz * 1.15, 80, 1600);
}

function getMassBreakdown(config: RocketConfig): MassBreakdown {
  const motorDerived = getMotorDerived(config.motor);
  const nose = chooseMass(config.nose.massMode, config.nose.massG, estimateNoseMassG(config.nose), `casca ${materialLabels[config.nose.material]} por comprimento, Ø e espessura`);
  const bodyEstimated = tubeShellVolumeCm3(config.body.outerDiameterMm, config.body.innerDiameterMm, config.body.lengthMm) * materialDensityGcm3[config.body.material]
    + tubeShellVolumeCm3(config.body.innerDiameterMm, Math.max(config.body.innerDiameterMm - config.body.wallMm * 1.5, 1), config.body.couplerLengthMm) * materialDensityGcm3[config.body.material] * 0.55;
  const body = chooseMass(config.body.massMode, config.body.massG, bodyEstimated, `tubo estrutural ${materialLabels[config.body.material]} + acoplador`);
  const transitionEstimated = config.transition.enabled ? frustumShellVolumeCm3(config.transition.foreDiameterMm, config.transition.aftDiameterMm, config.transition.lengthMm, config.body.wallMm) * materialDensityGcm3[config.body.material] : 0;
  const transition = chooseMass(config.transition.massMode, config.transition.massG, transitionEstimated, "casca cônica/frustum usando material do corpo");
  const finEach = chooseMass(config.fins.massMode, config.fins.massEachG, estimateFinEachMassG(config.fins), `área planar × espessura × ${materialLabels[config.fins.material]}`);
  const finsTotal: MassValue = { ...finEach, estimatedG: round(finEach.estimatedG * config.fins.count, 1), manualG: round(finEach.manualG * config.fins.count, 1), effectiveG: round(finEach.effectiveG * config.fins.count, 1), method: `${config.fins.count} aletas · ${finEach.method}` };
  const motorDry = chooseMass(config.motor.dryMassMode, config.motor.dryMassG, estimateMotorDryMassG(config.motor), "casing em alumínio, nozzle e ferragens de fechamento estimados");
  const propDensity = propellantDensities[config.motor.propellantType || "knsb_fine"] || 1.72;
  const propellant = chooseMass(config.motor.propellantMassMode, config.motor.propellantMassG, motorDerived.grainVolumeCm3 * propDensity, `volume geométrico dos grãos × densidade do propulsor ${propDensity} g/cm³`);
  const recovery = chooseMass(config.recovery.massMode, config.recovery.massG, estimateRecoveryMassG(config.recovery), "área de paraquedas, drogue, cordão e ferragens leves");
  const payload = chooseMass(config.payload.massMode, config.payload.massG, estimatePayloadMassG(config.payload), config.payload.type === "cubesat" ? "massa automática pelo padrão CubeSat selecionado" : "envelope geométrico × densidade de integração típica");
  const electronicsManual = config.electronics.batteryMassG + config.electronics.avionicsMassG + config.electronics.sensorMassG + config.electronics.radioMassG;
  const electronics = chooseMass(config.electronics.massMode, electronicsManual, estimateElectronicsMassG(config.electronics), "potência, telemetria e baseline de aviônica educativa");
  const dryTotalG = nose.effectiveG + body.effectiveG + (config.transition.enabled ? transition.effectiveG : 0) + finsTotal.effectiveG + motorDry.effectiveG + recovery.effectiveG + payload.effectiveG + electronics.effectiveG;
  const initialTotalG = dryTotalG + propellant.effectiveG;
  const all = [nose, body, transition, finEach, motorDry, propellant, recovery, payload, electronics];
  const autoEffective = all.filter((item) => item.mode === "auto").reduce((sum, item) => sum + item.effectiveG, 0);
  return { nose, body, transition, finEach, finsTotal, motorDry, propellant, recovery, payload, electronics, dryTotalG: round(dryTotalG, 1), initialTotalG: round(initialTotalG, 1), autoSharePct: round((autoEffective / Math.max(initialTotalG, 1)) * 100, 1) };
}

function simulateFlight(config: RocketConfig) {
  const g = 9.80665;
  const rho = config.mission.airDensity ?? 1.225;
  const diameterM = config.body.outerDiameterMm / 1000;
  const area = Math.PI * (diameterM / 2) ** 2;
  const Cd = clamp(0.55 + config.fins.count * 0.025 + config.body.wallMm * 0.012 + config.mission.windSpeed * 0.008, 0.52, 1.05);
  const massBreakdown = getMassBreakdown(config);
  const dryMassKg = massBreakdown.dryTotalG / 1000;
  const propMassKg = massBreakdown.propellant.effectiveG / 1000;
  const initialMassKg = dryMassKg + propMassKg;
  const thrustToWeight = config.motor.avgThrustN / Math.max(initialMassKg * g, 0.1);
  const dt = 0.05;
  let t = 0;
  let v = 0;
  let h = config.mission.launchAltitude;
  let maxH = h;
  let maxV = 0;
  let maxA = 0;
  const chart: { time: number; altitude: number; velocity: number; acceleration: number }[] = [];

  while (t <= 60) {
    const burnFraction = clamp(t / Math.max(config.motor.burnTimeS, 0.1), 0, 1);
    const mass = dryMassKg + propMassKg * (1 - burnFraction);
    const thrust = t <= config.motor.burnTimeS ? config.motor.avgThrustN * (0.86 + 0.14 * Math.sin((Math.PI * t) / Math.max(config.motor.burnTimeS, 0.1))) : 0;
    const drag = 0.5 * rho * Cd * area * v * Math.abs(v);
    const accel = (thrust - mass * g - drag) / Math.max(mass, 0.1);
    v += accel * dt;
    h += v * dt;
    maxH = Math.max(maxH, h);
    maxV = Math.max(maxV, v);
    maxA = Math.max(maxA, accel / g);
    if (Math.round(t * 10) % 5 === 0) {
      chart.push({ time: round(t, 1), altitude: round(Math.max(h - config.mission.launchAltitude, 0), 1), velocity: round(v, 1), acceleration: round(accel / g, 2) });
    }
    if (t > config.motor.burnTimeS + 1 && v <= 0) break;
    t += dt;
  }

  const totalLengthMm = config.nose.lengthMm + config.body.lengthMm + (config.transition.enabled ? config.transition.lengthMm : 0);
  const finArea = ((config.fins.rootChordMm + config.fins.tipChordMm) / 2) * config.fins.spanMm * config.fins.count;
  const cpMm = clamp(config.nose.lengthMm * 0.66 + config.body.lengthMm * 0.64 + finArea / Math.max(config.body.outerDiameterMm * 12, 1), totalLengthMm * 0.45, totalLengthMm * 0.88);
  const cgMm =
    (massBreakdown.nose.effectiveG * config.nose.lengthMm * 0.45 +
      massBreakdown.body.effectiveG * (config.nose.lengthMm + config.body.lengthMm * 0.48) +
      massBreakdown.finsTotal.effectiveG * (config.nose.lengthMm + config.body.lengthMm * 0.86) +
      (massBreakdown.motorDry.effectiveG + massBreakdown.propellant.effectiveG) * (totalLengthMm - config.motor.casingLengthMm * 0.5) +
      massBreakdown.recovery.effectiveG * (config.nose.lengthMm + config.body.lengthMm * 0.24) +
      massBreakdown.payload.effectiveG * config.payload.cgFromNoseMm +
      massBreakdown.electronics.effectiveG * (config.nose.lengthMm + config.body.lengthMm * 0.38)) /
    Math.max(initialMassKg * 1000, 1);
  const stability = (cpMm - cgMm) / Math.max(config.body.outerDiameterMm, 1);
  const descentCd = config.recovery.parachuteType === "toroide" ? 1.2 : 1.5;
  const descentRate = Math.sqrt((2 * dryMassKg * g) / Math.max(rho * Math.PI * (config.recovery.parachuteDiameterMm / 2000) ** 2 * descentCd, 0.01));
  const descentTimeS = Math.max(maxH - config.mission.launchAltitude, 0) / Math.max(descentRate, 0.1);

  return {
    apogeeM: Math.max(maxH - config.mission.launchAltitude, 0),
    maxVelocity: maxV,
    maxAccelerationG: maxA,
    flightTimeS: t + descentTimeS,
    descentTimeS,
    dryMassKg,
    propMassKg,
    initialMassKg,
    totalLengthMm,
    thrustToWeight,
    impulseNs: config.motor.avgThrustN * config.motor.burnTimeS,
    cd: Cd,
    cgMm,
    cpMm,
    stability,
    descentRate,
    massBreakdown,
    chart,
  };
}

function getDefaultConfigForMission(missionId: string): RocketConfig {
  if (missionId === 'cubesat-2u') {
    const cubeProfile = cubesatProfiles['2U'] || { lengthMm: 227, diameterMm: 100, massG: 2000, name: "CubeSat educacional 2U" };
    return {
      ...baseConfig,
      mission: {
        ...baseConfig.mission,
        name: "CubeSat 2U",
        objective: "Missão orbital/educacional com estrutura 2U",
        targetApogee: 1200,
      },
      payload: {
        name: cubeProfile.name,
        type: 'cubesat',
        cubesatUnits: '2U',
        lengthMm: cubeProfile.lengthMm,
        diameterMm: cubeProfile.diameterMm,
        massG: cubeProfile.massG,
        cgFromNoseMm: 520,
      }
    };
  }
  if (missionId === 'mg-reis-n1') {
    const cansatPreset = presets.find(p => p.id === 'cansat300')?.config || baseConfig;
    return {
      ...cansatPreset,
      mission: {
        ...cansatPreset.mission,
        name: "MG-REIS-N1",
        objective: "Foguete sólido para classe de 1 km",
        targetApogee: 1000,
      }
    };
  }
  return {
    ...baseConfig,
    mission: {
      ...baseConfig.mission,
      name: "MG-VERA CRUZ-N1",
      objective: "Foguete sólido para classe aproximada de 3 km",
      targetApogee: 3000,
    }
  };
}

function generateOrkXml(config: RocketConfig, simulation: any, massBreakdown: any) {
  const referenceLength = config.body.outerDiameterMm / 1000;
  const noseLength = config.nose.lengthMm / 1000;
  const noseBaseRadius = config.nose.baseDiameterMm / 2 / 1000;
  const noseWall = config.nose.wallMm / 1000;
  const bodyLength = config.body.lengthMm / 1000;
  const bodyOuterRadius = config.body.outerDiameterMm / 2 / 1000;
  const bodyInnerRadius = config.body.innerDiameterMm / 2 / 1000;
  const bodyWall = (config.body.outerDiameterMm - config.body.innerDiameterMm) / 2 / 1000;

  const finRoot = config.fins.rootChordMm / 1000;
  const finTip = config.fins.tipChordMm / 1000;
  const finSpan = config.fins.spanMm / 1000;
  const finSweep = config.fins.sweepMm / 1000;
  const finThickness = config.fins.thicknessMm / 1000;
  
  const motorCasingLength = config.motor.casingLengthMm / 1000;
  const motorCasingDiameter = config.motor.casingDiameterMm / 1000;

  const parachuteDiameter = config.recovery.parachuteDiameterMm / 1000;
  const parachuteCd = config.recovery.parachuteType === "toroide" ? 1.2 : 1.5;

  const payloadMass = config.payload.massG / 1000;
  const payloadLength = config.payload.lengthMm / 1000;
  const payloadCg = config.payload.cgFromNoseMm / 1000;

  const shapeMap: Record<NoseType, string> = {
    conica: "conical",
    ogival: "ogive",
    parabolica: "parabolic",
    eliptica: "ellipsoid",
    hemisferica: "spherical",
  };

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<openrocket version="1.5" creator="Innovare Rocket Platform">
  <rocket>
    <name>${config.mission.name}</name>
    <referencelength>${referenceLength.toFixed(5)}</referencelength>
    <subcomponents>
      <stage>
        <name>Estagio principal</name>
        <subcomponents>
          <nosecone>
            <name>Coifa</name>
            <length>${noseLength.toFixed(5)}</length>
            <shape>${shapeMap[config.nose.type] || "ogive"}</shape>
            <thickness>${noseWall.toFixed(5)}</thickness>
            <aftradius>${noseBaseRadius.toFixed(5)}</aftradius>
            ${config.nose.massMode === "manual" ? `
            <overridemass>${(config.nose.massG / 1000).toFixed(5)}</overridemass>
            <overridecg>0.0</overridecg>
            <overridesubcomponents>false</overridesubcomponents>
            ` : ""}
          </nosecone>
          <bodytube>
            <name>Tubo Principal</name>
            <length>${bodyLength.toFixed(5)}</length>
            <outerdiameter>${(bodyOuterRadius * 2).toFixed(5)}</outerdiameter>
            <thickness>${bodyWall.toFixed(5)}</thickness>
            ${config.body.massMode === "manual" ? `
            <overridemass>${(config.body.massG / 1000).toFixed(5)}</overridemass>
            <overridecg>0.0</overridecg>
            <overridesubcomponents>false</overridesubcomponents>
            ` : ""}
            <subcomponents>
              <trapezoidfinset>
                <name>Conjunto de Aletas</name>
                <fins>${config.fins.count}</fins>
                <rootchord>${finRoot.toFixed(5)}</rootchord>
                <tipchord>${finTip.toFixed(5)}</tipchord>
                <span>${finSpan.toFixed(5)}</span>
                <sweep>${finSweep.toFixed(5)}</sweep>
                <thickness>${finThickness.toFixed(5)}</thickness>
                ${config.fins.massMode === "manual" ? `
                <overridemass>${(config.fins.massEachG * config.fins.count / 1000).toFixed(5)}</overridemass>
                <overridecg>0.0</overridecg>
                <overridesubcomponents>false</overridesubcomponents>
                ` : ""}
              </trapezoidfinset>
              <parachute>
                <name>Paraquedas</name>
                <diameter>${parachuteDiameter.toFixed(5)}</diameter>
                <cd>${parachuteCd.toFixed(2)}</cd>
                <deploy>apogee</deploy>
                ${config.recovery.massMode === "manual" ? `
                <overridemass>${(config.recovery.massG / 1000).toFixed(5)}</overridemass>
                ` : ""}
              </parachute>
              <masscomponent>
                <name>${config.payload.name}</name>
                <mass>${payloadMass.toFixed(5)}</mass>
                <length>${payloadLength.toFixed(5)}</length>
                <position>${payloadCg.toFixed(5)}</position>
                <positiontype>top</positiontype>
              </masscomponent>
            </subcomponents>
          </bodytube>
          ${config.transition.enabled ? `
          <transition>
            <name>Transicao</name>
            <length>${(config.transition.lengthMm / 1000).toFixed(5)}</length>
            <forediameter>${(config.transition.foreDiameterMm / 1000).toFixed(5)}</forediameter>
            <aftdiameter>${(config.transition.aftDiameterMm / 1000).toFixed(5)}</aftdiameter>
            ${config.transition.massMode === "manual" ? `
            <overridemass>${(config.transition.massG / 1000).toFixed(5)}</overridemass>
            ` : ""}
          </transition>
          ` : ""}
        </subcomponents>
      </stage>
    </subcomponents>
  </rocket>
</openrocket>
`;
}

function generateRocketPyScript(config: RocketConfig, simulation: any, massBreakdown: any) {
  const dateStr = new Date().toLocaleDateString("pt-BR");
  return `# -*- coding: utf-8 -*-
"""
Script de Simulação RocketPy - Gerado pela Innovare Rocket Platform
Data de geração: ${dateStr}
Projeto: ${config.mission.name}
Objetivo: ${config.mission.objective}
"""

import datetime
from rocketpy import Environment, SolidMotor, Rocket, Flight

# 1. Configuração do Ambiente
env = Environment(
    rail_length=5.0,
    gravity=9.80665,
    date=datetime.datetime.now()
)
env.set_elevation_profile(type="constant", elevation=${config.mission.launchAltitude})
env.set_atmospheric_model(
    type="standard_atmosphere", 
    pressure=None, 
    temperature=${config.mission.temperature ?? 15}
)
env.set_wind_model(
    type="constant", 
    wind_u=0.0, 
    wind_v=${config.mission.windSpeed}
)

# 2. Configuração do Motor
motor = SolidMotor(
    thrust_source=${config.motor.avgThrustN},  # Empuxo médio em Newtons
    burn_time=${config.motor.burnTimeS},      # Tempo de queima em segundos
    grain_number=${config.motor.grainCount},     # Quantidade de grãos
    grain_density=1720,                        # Densidade típica do grão em kg/m³
    grain_outer_radius=${(config.motor.grainOuterDiameterMm / 2 / 1000).toFixed(5)},
    grain_initial_inner_radius=${(config.motor.grainCoreDiameterMm / 2 / 1000).toFixed(5)},
    grain_initial_height=${(config.motor.grainLengthMm / 1000).toFixed(5)},
    nozzle_throat_radius=${(config.motor.throatDiameterMm / 2 / 1000).toFixed(5)},
    nozzle_radius=${(config.motor.nozzleExitDiameterMm / 2 / 1000).toFixed(5)},
    dry_mass=${(massBreakdown.motorDry.effectiveG / 1000).toFixed(3)},  # Massa seca do motor em kg
    dry_inertia=(0.01, 0.01, 0.001),
    grains_center_of_mass_position=-${(config.motor.casingLengthMm / 2 / 1000).toFixed(3)},
    center_of_dry_mass_position=-${(config.motor.casingLengthMm / 2 / 1000).toFixed(3)}
)

# 3. Configuração do Foguete
rocket = Rocket(
    radius=${(config.body.outerDiameterMm / 2 / 1000).toFixed(5)},
    mass=${simulation.dryMassKg.toFixed(3)},
    inertia=(0.5, 0.5, 0.05),
    power_off_drag=0.6,
    power_on_drag=0.6,
    center_of_mass_without_motor=${(simulation.cgMm / 1000).toFixed(3)},
    coordinate_system_orientation="tail_to_nose"
)

# Adiciona o motor ao foguete na cauda
rocket.add_motor(motor, position=-${(simulation.totalLengthMm / 1000).toFixed(3)})

# Adiciona a coifa
rocket.add_nose(
    length=${(config.nose.lengthMm / 1000).toFixed(5)},
    kind="${config.nose.type === "parabolica" ? "parabolic" : config.nose.type === "conica" ? "conical" : "vonkarman"}",
    position=0.0
)

# Adiciona as aletas trapezoidais
rocket.add_trapezoidal_fins(
    n=${config.fins.count},
    root_chord=${(config.fins.rootChordMm / 1000).toFixed(5)},
    tip_chord=${(config.fins.tipChordMm / 1000).toFixed(5)},
    span=${(config.fins.spanMm / 1000).toFixed(5)},
    sweep_length=${(config.fins.sweepMm / 1000).toFixed(5)},
    position=-${((config.nose.lengthMm + config.body.lengthMm - config.fins.rootChordMm) / 1000).toFixed(3)}
)

# 4. Simulação de Voo
flight = Flight(rocket=rocket, environment=env, rail_angle=85, rail_heading=0)
flight.all_info()
`;
}

function NumberField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  help,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  help?: string;
}) {
  const [draftValue, setDraftValue] = useState(String(Number.isFinite(value) ? value : 0));

  useEffect(() => {
    setDraftValue(String(Number.isFinite(value) ? value : 0));
  }, [value]);

  const commitValue = (rawValue: string) => {
    const normalizedInput = rawValue.replace(",", ".").trim();
    const normalizedCurrent = String(value).replace(",", ".").trim();
    let candidateValue = normalizedInput;

    if (
      normalizedInput.length > normalizedCurrent.length &&
      normalizedInput.startsWith(normalizedCurrent)
    ) {
      const appendedCandidate = normalizedInput.slice(normalizedCurrent.length);
      if (appendedCandidate !== "") {
        candidateValue = appendedCandidate;
      }
    }

    setDraftValue(candidateValue);

    if (candidateValue.trim() === "") {
      return;
    }

    const parsedValue = Number(candidateValue.replace(",", "."));
    if (!Number.isFinite(parsedValue)) {
      return;
    }

    if (parsedValue < min || parsedValue > max) {
      return;
    }

    onChange(parsedValue);
  };

  return (
    <label className="param-field">
      <span className="param-label">
        <span>{label}</span>
        <strong>{unit}</strong>
      </span>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[,.]?[0-9]*"
        aria-label={`${label} (${unit}), mínimo ${min}, máximo ${max}, passo ${step}`}
        value={draftValue}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.currentTarget.select()}
        onBlur={() => setDraftValue(String(Number.isFinite(value) ? value : 0))}
        onChange={(event: ChangeEvent<HTMLInputElement>) => commitValue(event.target.value)}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        aria-label={`${label} em ${unit}`}
      />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

function TextField({ label, value, onChange, help }: { label: string; value: string; onChange: (value: string) => void; help?: string }) {
  return (
    <label className="param-field full-field">
      <span className="param-label">
        <span>{label}</span>
        <strong>texto</strong>
      </span>
      <input type="text" value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="param-field">
      <span className="param-label">
        <span>{label}</span>
        <strong>tipo</strong>
      </span>
      <select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as T)}>
        {Object.entries(options).map(([key, labelText]) => (
          <option key={key} value={key}>
            {labelText as string}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-field">
      <span>{label}</span>
      <button type="button" className={checked ? "toggle-on" : ""} onClick={() => onChange(!checked)}>
        {checked ? "ativo" : "inativo"}
      </button>
    </label>
  );
}

function InnovareLogo() {
  return (
    <div className="flex items-center justify-center font-bold text-orange-500 text-lg border-2 border-orange-500 px-2 py-0.5 rounded mr-2" style={{ textShadow: "none" }}>
      INNOVARE
    </div>
  );
}

function ParamSection({ title, kicker, icon: Icon, children }: { title: string; kicker: string; icon: any; children: ReactNode }) {
  return (
    <section className="param-section">
      <header>
        <div className="section-icon"><Icon size={18} /></div>
        <div>
          <span className="text-[10px] tracking-wider text-orange-400 block">{kicker}</span>
          <h3 className="text-white font-bold">{title}</h3>
        </div>
      </header>
      <div className="param-grid">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, detail, tone = "cyan" }: { label: string; value: string; detail: string; tone?: "cyan" | "orange" | "yellow" }) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function MassControl({
  label,
  value,
  onModeChange,
  onManualChange,
  min,
  max,
  step,
}: {
  label: string;
  value: MassValue;
  onModeChange: (mode: MassMode) => void;
  onManualChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className={`mass-control full-field mass-mode-${value.mode}`}>
      <div className="mass-control-head">
        <span>{label}</span>
        <strong>{round(value.effectiveG, 1)} g</strong>
      </div>
      <div className="mass-control-body">
        <span>{massModeLabels[value.mode]}</span>
        <small>estimada: {round(value.estimatedG, 1)} g · manual: {round(value.manualG, 1)} g</small>
        <small>{value.method}</small>
      </div>
      <ToggleField label="Usar massa manual medida" checked={value.mode === "manual"} onChange={(checked) => onModeChange(checked ? "manual" : "auto")} />
      {value.mode === "manual" ? <NumberField label="Valor manual" unit="g" value={value.manualG} min={min} max={max} step={step} onChange={onManualChange} help="Use este campo apenas quando houver massa real de balança, ficha técnica ou ensaio." /> : null}
    </div>
  );
}

function MotorCutaway({ motor }: { motor: RocketConfig["motor"] }) {
  const casingX = 28;
  const casingY = 58;
  const casingW = 320;
  const casingH = 66;
  const chamberX = casingX + 24;
  const chamberW = 218;
  const grainGap = 4;
  const grainCount = Math.max(1, Math.min(Math.round(motor.grainCount), 8));
  const grainW = Math.max((chamberW - grainGap * (grainCount - 1)) / grainCount, 12);
  const grainH = casingH * 0.62;
  const grainY = casingY + (casingH - grainH) / 2;
  const throatX = casingX + casingW - 28;
  const nozzleExitX = casingX + casingW + 84;
  const throatR = clamp(motor.throatDiameterMm / Math.max(motor.casingDiameterMm, 1) * casingH * 0.5, 3, casingH * 0.25);
  const exitR = clamp(motor.nozzleExitDiameterMm / Math.max(motor.casingDiameterMm, 1) * casingH * 0.5, throatR + 4, casingH * 0.46);
  const inhibitionStroke = motor.grainInhibition === "none" ? "#19d6df" : motor.grainInhibition === "total" ? "#ff4b00" : "#ffc247";

  return (
    <div className="motor-cutaway full-field" aria-label="Vista técnica ampliada do motor em corte">
      <svg viewBox="0 0 470 190" role="img">
        <defs>
          <linearGradient id="motorCaseDetail" x1="0" x2="1">
            <stop offset="0" stopColor="#d6d3c7" stopOpacity="0.92" />
            <stop offset="0.52" stopColor="#69747a" stopOpacity="0.78" />
            <stop offset="1" stopColor="#202a2f" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grainFill" x1="0" x2="1">
            <stop offset="0" stopColor="#ffc247" stopOpacity="0.86" />
            <stop offset="1" stopColor="#ff4b00" stopOpacity="0.64" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="468" height="188" rx="14" fill="#05090d" stroke="rgba(140,246,255,0.24)" />
        <line x1="18" y1="148" x2="444" y2="148" stroke="#244550" strokeDasharray="4 8" />
        <rect x={casingX} y={casingY} width={casingW} height={casingH} rx="12" fill="url(#motorCaseDetail)" stroke="#f7f4ee" strokeWidth="1.8" />
        <rect x={chamberX} y={casingY + 10} width={chamberW} height={casingH - 20} rx="8" fill="#071015" stroke="#19d6df" strokeDasharray="4 5" opacity="0.9" />
        {Array.from({ length: grainCount }).map((_, index) => {
          const gx = chamberX + index * (grainW + grainGap);
          return (
            <g key={`motor-grain-${index}`}>
              <rect x={gx} y={grainY} width={grainW} height={grainH} rx="5" fill="url(#grainFill)" stroke={inhibitionStroke} strokeWidth="1.15" />
              <ellipse cx={gx + grainW / 2} cy={casingY + casingH / 2} rx={Math.max(grainW * 0.18, 3)} ry={Math.max(grainH * 0.18, 4)} fill="#05090d" stroke="#19d6df" strokeWidth="0.9" />
              {motor.grainGeometry === "star" ? <path d={`M ${gx + grainW * 0.5} ${grainY + 7} L ${gx + grainW * 0.56} ${grainY + grainH * 0.42} L ${gx + grainW * 0.84} ${grainY + grainH * 0.5} L ${gx + grainW * 0.56} ${grainY + grainH * 0.58} L ${gx + grainW * 0.5} ${grainY + grainH - 7} L ${gx + grainW * 0.44} ${grainY + grainH * 0.58} L ${gx + grainW * 0.16} ${grainY + grainH * 0.5} L ${gx + grainW * 0.44} ${grainY + grainH * 0.42} Z`} fill="#05090d" opacity="0.48" /> : null}
              {motor.grainGeometry === "slot" ? <rect x={gx + grainW * 0.34} y={grainY + 7} width={grainW * 0.32} height={grainH - 14} rx="3" fill="#05090d" opacity="0.52" /> : null}
            </g>
          );
        })}
        <rect x={casingX + 7} y={casingY + 6} width="14" height={casingH - 12} rx="3" fill="#172029" stroke="#ffc247" />
        <path d={`M ${throatX - 32} ${casingY + 10} L ${throatX} ${casingY + casingH / 2 - throatR} L ${throatX} ${casingY + casingH / 2 + throatR} L ${throatX - 32} ${casingY + casingH - 10} Z`} fill="#18232a" stroke="#ffc247" strokeWidth="1.4" />
        <path d={`M ${throatX} ${casingY + casingH / 2 - throatR} L ${nozzleExitX} ${casingY + casingH / 2 - exitR} L ${nozzleExitX} ${casingY + casingH / 2 + exitR} L ${throatX} ${casingY + casingH / 2 + throatR} Z`} fill="#101820" stroke="#ff4b00" strokeWidth="1.6" />
        <line x1={throatX} y1={casingY + casingH / 2 - throatR - 9} x2={throatX} y2={casingY + casingH / 2 + throatR + 9} stroke="#19d6df" strokeWidth="1" />
        <text x={casingX} y="34" fill="#4ee9ef" fontSize="11" fontFamily="IBM Plex Mono">MOTOR · CORTE LONGITUDINAL</text>
        <text x={chamberX} y="48" fill="#ffc247" fontSize="9" fontFamily="IBM Plex Mono">grãos · {grainGeometryLabels[motor.grainGeometry]}</text>
        <text x={throatX - 18} y="143" fill="#19d6df" fontSize="9" fontFamily="IBM Plex Mono">garganta Ø{motor.throatDiameterMm} mm</text>
        <text x={nozzleExitX - 66} y="42" fill="#ff4b00" fontSize="9" fontFamily="IBM Plex Mono">nozzle {motor.nozzleDivergentAngleDeg}°</text>
        <text x={casingX + 7} y="166" fill="#aebfc4" fontSize="9" fontFamily="IBM Plex Mono">{motorMountLabels[motor.mountType]} · {retainerLabels[motor.retainerType]} · {grainInhibitionLabels[motor.grainInhibition]}</text>
      </svg>
    </div>
  );
}

function PayloadModule({ config, x, width, centerY, bodyH }: { config: RocketConfig; x: number; width: number; centerY: number; bodyH: number }) {
  const moduleTop = centerY - bodyH * 0.32;
  const moduleH = bodyH * 0.64;
  const safeWidth = Math.max(width, 36);
  const type = config.payload.type;
  const unitValue = type === "cubesat" ? ({ "1U": 1, "1.5U": 1.5, "2U": 2, "3U": 3, "6U": 6, "12U": 12, custom: 4 }[config.payload.cubesatUnits] ?? 1) : 1;
  const cubeSegments = Math.max(1, Math.min(Math.ceil(unitValue), 6));
  const label = type === "cubesat" ? config.payload.cubesatUnits : type === "cansat" ? "CANSAT" : type === "scientific" ? "SCI" : type === "ballast" ? "LASTRO" : type === "probe" ? "SONDA" : "CUSTOM";

  if (type === "cubesat") {
    const cubeH = Math.min(moduleH * 0.86, bodyH * 0.58);
    const cubeY = centerY - cubeH / 2;
    const segmentW = safeWidth / cubeSegments;
    return (
      <g className="internal-module payload-module payload-cubesat">
        <rect x={x} y={cubeY} width={safeWidth} height={cubeH} rx="3" fill="#06191f" stroke="#4ee9ef" strokeWidth="1.7" />
        {Array.from({ length: cubeSegments }).map((_, index) => (
          <g key={`cube-unit-${index}`}>
            <rect x={x + index * segmentW + 2} y={cubeY + 3} width={Math.max(segmentW - 4, 8)} height={cubeH - 6} rx="2" fill={index % 2 === 0 ? "#143844" : "#102931"} stroke="#19d6df" strokeWidth="0.8" opacity="0.92" />
            <line x1={x + index * segmentW + segmentW * 0.5} y1={cubeY + 7} x2={x + index * segmentW + segmentW * 0.5} y2={cubeY + cubeH - 7} stroke="#ffc247" strokeWidth="0.7" opacity="0.52" />
            <circle cx={x + index * segmentW + segmentW * 0.5} cy={centerY} r="2.3" fill="#ffc247" opacity="0.86" />
          </g>
        ))}
        <line x1={x + 6} y1={cubeY - 5} x2={x + safeWidth - 6} y2={cubeY - 5} stroke="#4ee9ef" strokeWidth="1" opacity="0.7" />
        <line x1={x + 6} y1={cubeY + cubeH + 5} x2={x + safeWidth - 6} y2={cubeY + cubeH + 5} stroke="#4ee9ef" strokeWidth="1" opacity="0.7" />
        <text x={x + 7} y={cubeY + cubeH + 18} fill="#4ee9ef" fontSize="10" fontFamily="IBM Plex Mono">{label}</text>
      </g>
    );
  }

  if (type === "cansat") {
    const canH = Math.min(moduleH * 0.9, bodyH * 0.6);
    const canY = centerY - canH / 2;
    return (
      <g className="internal-module payload-module payload-cansat">
        <rect x={x + 3} y={canY + 5} width={safeWidth - 6} height={canH - 10} rx="10" fill="url(#moduleCyan)" stroke="#4ee9ef" strokeWidth="1.6" />
        <ellipse cx={x + safeWidth / 2} cy={canY + 8} rx={Math.max(safeWidth * 0.42, 12)} ry="6" fill="#d7fbff" opacity="0.36" stroke="#4ee9ef" />
        <ellipse cx={x + safeWidth / 2} cy={canY + canH - 8} rx={Math.max(safeWidth * 0.42, 12)} ry="6" fill="#06191f" opacity="0.38" stroke="#4ee9ef" />
        <rect x={x + safeWidth * 0.22} y={centerY - 4} width={safeWidth * 0.56} height="8" rx="2" fill="#0a1116" opacity="0.62" />
        <line x1={x + safeWidth * 0.72} y1={canY + 7} x2={x + safeWidth * 0.92} y2={canY - 10} stroke="#ffc247" strokeWidth="1.5" />
        <circle cx={x + safeWidth * 0.33} cy={centerY + canH * 0.18} r="3" fill="#ffc247" />
        <text x={x + 7} y={canY + canH + 17} fill="#062126" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="700">{label}</text>
      </g>
    );
  }

  if (type === "scientific" || type === "probe") {
    const boxH = Math.min(moduleH * 0.82, bodyH * 0.56);
    const boxY = centerY - boxH / 2;
    return (
      <g className="internal-module payload-module payload-scientific">
        <rect x={x} y={boxY} width={safeWidth} height={boxH} rx="5" fill="#10202a" stroke="#4ee9ef" strokeWidth="1.6" />
        <rect x={x + 6} y={boxY + 6} width={safeWidth * 0.34} height={boxH - 12} rx="3" fill="#ffc247" opacity="0.25" stroke="#ffc247" strokeWidth="0.8" />
        {[0.5, 0.68, 0.84].map((p) => <circle key={`sensor-${p}`} cx={x + safeWidth * p} cy={centerY - boxH * 0.16} r="3.2" fill="#19d6df" />)}
        {[0.52, 0.72].map((p) => <rect key={`port-${p}`} x={x + safeWidth * p - 4} y={centerY + boxH * 0.08} width="8" height="7" rx="1.5" fill="#ff4b00" opacity="0.82" />)}
        <line x1={x + 8} y1={boxY - 4} x2={x + safeWidth - 8} y2={boxY - 4} stroke="#ffc247" strokeDasharray="3 4" />
        <text x={x + 7} y={boxY + boxH + 17} fill="#4ee9ef" fontSize="10" fontFamily="IBM Plex Mono">{label}</text>
      </g>
    );
  }

  if (type === "ballast") {
    return (
      <g className="internal-module payload-module payload-ballast">
        <rect x={x} y={moduleTop + 8} width={safeWidth} height={moduleH - 16} rx="2" fill="#2f3437" stroke="#ffc247" strokeWidth="1.7" />
        {[0.2, 0.4, 0.6, 0.8].map((p) => <line key={`ballast-${p}`} x1={x + safeWidth * p} y1={moduleTop + 12} x2={x + safeWidth * p - 10} y2={moduleTop + moduleH - 12} stroke="#ffc247" opacity="0.42" />)}
        <text x={x + 7} y={centerY + 4} fill="#ffc247" fontSize="10" fontFamily="IBM Plex Mono">{label}</text>
      </g>
    );
  }

  return (
    <g className="internal-module payload-module payload-custom">
      <rect x={x} y={moduleTop} width={safeWidth} height={moduleH} rx="8" fill="url(#moduleCyan)" stroke="#4ee9ef" strokeWidth="1.7" />
      <line x1={x + safeWidth * 0.25} y1={moduleTop + 5} x2={x + safeWidth * 0.25} y2={moduleTop + moduleH - 5} stroke="#0a1116" opacity="0.35" />
      <line x1={x + safeWidth * 0.62} y1={moduleTop + 5} x2={x + safeWidth * 0.62} y2={moduleTop + moduleH - 5} stroke="#0a1116" opacity="0.35" />
      <circle cx={x + safeWidth * 0.82} cy={centerY} r={Math.max(bodyH * 0.12, 4)} fill="#0a1116" opacity="0.22" />
      <text x={x + 8} y={centerY + 4} fill="#062126" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="700">{label}</text>
    </g>
  );
}

function RocketPreview({ config, cgMm, cpMm, stability }: { config: RocketConfig; cgMm: number; cpMm: number; stability: number }) {
  const totalLength = config.nose.lengthMm + config.body.lengthMm + (config.transition.enabled ? config.transition.lengthMm : 0);
  const scale = 700 / Math.max(totalLength, 1);
  const startX = 70;
  const centerY = 176;
  const bodyH = clamp(config.body.outerDiameterMm * scale, 34, 88);
  const noseW = config.nose.lengthMm * scale;
  const bodyW = config.body.lengthMm * scale;
  const transW = config.transition.enabled ? config.transition.lengthMm * scale : 0;
  const bodyX = startX + noseW;
  const bodyTop = centerY - bodyH / 2;
  const bodyBottom = centerY + bodyH / 2;
  const tailX = bodyX + bodyW + transW;
  const finRoot = config.fins.rootChordMm * scale;
  const finTip = config.fins.tipChordMm * scale;
  const finSpan = clamp(config.fins.spanMm * scale, 26, 112);
  const finSweep = config.fins.sweepMm * scale;
  const finX = bodyX + bodyW - finRoot - 12;
  const motorW = clamp(config.motor.casingLengthMm * scale, 62, Math.max(bodyW * 0.46, 64));
  const motorH = clamp(config.motor.casingDiameterMm * scale, 12, bodyH * 0.7);
  const payloadW = clamp(config.payload.lengthMm * scale, 38, Math.max(bodyW * 0.34, 42));
  const payloadX = clamp(startX + config.payload.cgFromNoseMm * scale - payloadW / 2, bodyX + 18, tailX - motorW - payloadW - 18);
  const electronicsW = clamp(bodyW * 0.16, 44, 110);
  const recoveryW = clamp(bodyW * 0.18, 54, 120);
  const recoveryX = bodyX + 18;
  const electronicsX = clamp(payloadX + payloadW + 16, bodyX + 26, tailX - motorW - electronicsW - 16);
  const motorX = tailX - motorW - 10;
  const cgX = startX + cgMm * scale;
  const cpX = startX + cpMm * scale;
  const aftDiameter = config.transition.enabled ? clamp(config.transition.aftDiameterMm * scale, 22, bodyH) : bodyH;
  const tailTop = centerY - aftDiameter / 2;
  const tailBottom = centerY + aftDiameter / 2;
  const sectionLines = [bodyX + bodyW * 0.18, bodyX + bodyW * 0.42, bodyX + bodyW * 0.68, bodyX + bodyW * 0.86].filter((x) => x < tailX - 12);

  return (
    <div className="rocket-preview rocket-preview-cutaway" id="preview">
      <div className="preview-grid" />
      <svg viewBox="0 0 900 380" role="img" aria-label="Corte lateral técnico do foguete com módulos internos, CG, CP e cotas principais">
        <defs>
          <linearGradient id="rocketShell" x1="0" x2="1">
            <stop offset="0" stopColor="#f8f3e7" stopOpacity="0.98" />
            <stop offset="0.34" stopColor="#d6d3c7" stopOpacity="0.94" />
            <stop offset="0.68" stopColor="#79848a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#111820" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="rocketDepth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6f7d84" stopOpacity="0.62" />
            <stop offset="0.52" stopColor="#27323a" stopOpacity="0.82" />
            <stop offset="1" stopColor="#061114" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="cutawayGlass" x1="0" x2="1">
            <stop offset="0" stopColor="#19d6df" stopOpacity="0.18" />
            <stop offset="0.5" stopColor="#f7f4ee" stopOpacity="0.08" />
            <stop offset="1" stopColor="#ff4b00" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="shellHighlight" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.82" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="moduleCyan" x1="0" x2="1">
            <stop offset="0" stopColor="#19d6df" stopOpacity="0.86" />
            <stop offset="1" stopColor="#009aa6" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="moduleAmber" x1="0" x2="1">
            <stop offset="0" stopColor="#ffc247" stopOpacity="0.92" />
            <stop offset="1" stopColor="#ff4b00" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="motorCore" x1="0" x2="1">
            <stop offset="0" stopColor="#202832" />
            <stop offset="0.58" stopColor="#0a0d10" />
            <stop offset="1" stopColor="#ff6a00" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="flame" x1="0" x2="1">
            <stop offset="0" stopColor="#ffe66d" />
            <stop offset="0.52" stopColor="#ff6a00" />
            <stop offset="1" stopColor="#ff4b00" />
          </linearGradient>
        </defs>

        <rect x="28" y="34" width="844" height="302" rx="16" fill="#0a1116" opacity="0.28" stroke="#203b46" />
        <line x1="52" y1={centerY} x2="838" y2={centerY} stroke="#38606a" strokeWidth="1" opacity="0.36" />

        <path d={nosePath(config.nose.type, startX, centerY, noseW, bodyH)} fill="url(#rocketShell)" stroke="#f7f4ee" strokeWidth="2.6" strokeLinejoin="round" />
        <path d={noseHighlightPath(config.nose.type, startX, centerY, noseW, bodyH)} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.62" />
        <line x1={bodyX} y1={bodyTop + 3} x2={bodyX} y2={bodyBottom - 3} stroke="#f7f4ee" strokeWidth="1.8" opacity="0.88" />
        <rect x={bodyX} y={bodyTop} width={bodyW} height={bodyH} rx="7" fill="url(#rocketShell)" stroke="#f7f4ee" strokeWidth="2.6" />
        <ellipse cx={bodyX} cy={centerY} rx="8" ry={bodyH / 2} fill="#f8f3e7" opacity="0.52" stroke="#f7f4ee" strokeWidth="1.6" />
        <ellipse cx={bodyX + bodyW} cy={centerY} rx="9" ry={bodyH / 2} fill="#111820" opacity="0.72" stroke="#f7f4ee" strokeWidth="1.4" />
        <rect x={bodyX + 8} y={bodyTop + 6} width={Math.max(bodyW - 16, 0)} height={bodyH * 0.22} rx="4" fill="url(#shellHighlight)" opacity="0.42" />
        <rect x={bodyX + 8} y={centerY - bodyH * 0.28} width={Math.max(bodyW - 16, 0)} height={bodyH * 0.56} rx="4" fill="url(#cutawayGlass)" opacity="0.64" stroke="#87939a" strokeWidth="1" />

        {config.transition.enabled ? (
          <path d={`M ${bodyX + bodyW} ${bodyTop} L ${tailX} ${tailTop} L ${tailX} ${tailBottom} L ${bodyX + bodyW} ${bodyBottom} Z`} fill="#1a232b" stroke="#f7f4ee" strokeWidth="2.2" strokeLinejoin="round" />
        ) : null}

        {sectionLines.map((x, index) => (
          <g key={`bulkhead-${index}`} opacity="0.38">
            <line x1={x} y1={bodyTop + 7} x2={x} y2={bodyBottom - 7} stroke="#d8d0bd" strokeWidth="1" />
            <circle cx={x} cy={centerY} r="2.2" fill="#d8d0bd" opacity="0.62" />
          </g>
        ))}

        <g className="internal-module">
          <rect x={recoveryX} y={centerY - bodyH * 0.24} width={recoveryW} height={bodyH * 0.48} rx="8" fill="#182a31" stroke="#19d6df" strokeWidth="1.4" strokeDasharray="3 4" />
          <path d={`M ${recoveryX + 8} ${centerY} C ${recoveryX + 24} ${centerY - bodyH * 0.22}, ${recoveryX + 42} ${centerY + bodyH * 0.22}, ${recoveryX + 58} ${centerY}`} fill="none" stroke="#19d6df" strokeWidth="1.5" opacity="0.9" />
          <text x={recoveryX + 8} y={centerY - bodyH * 0.31} fill="#4ee9ef" fontSize="10" fontFamily="IBM Plex Mono">REC</text>
        </g>

        <PayloadModule config={config} x={payloadX} width={payloadW} centerY={centerY} bodyH={bodyH} />

        <g className="internal-module">
          <rect x={electronicsX} y={centerY - bodyH * 0.25} width={electronicsW} height={bodyH * 0.5} rx="6" fill="#101820" stroke="#ffc247" strokeWidth="1.5" />
          {[0.2, 0.38, 0.56, 0.74].map((p) => <circle key={`pcb-${p}`} cx={electronicsX + electronicsW * p} cy={centerY - bodyH * 0.08} r="3" fill="#ffc247" />)}
          {[0.22, 0.46, 0.7].map((p) => <rect key={`chip-${p}`} x={electronicsX + electronicsW * p - 5} y={centerY + bodyH * 0.02} width="10" height="8" rx="1.5" fill="#19d6df" opacity="0.82" />)}
          <text x={electronicsX + 7} y={centerY + bodyH * 0.39} fill="#ffc247" fontSize="10" fontFamily="IBM Plex Mono">AVIONICS</text>
        </g>

        <g className="motor-pack">
          <rect x={motorX} y={centerY - motorH / 2} width={motorW} height={motorH} rx="4" fill="url(#motorCore)" stroke="#ff6a00" strokeWidth="2" />
          <rect x={motorX + 8} y={centerY - motorH * 0.32} width={Math.max(motorW - 22, 0)} height={motorH * 0.18} rx="2" fill="#ffc247" opacity="0.42" />
          <line x1={motorX + motorW * 0.18} y1={centerY - motorH / 2} x2={motorX + motorW * 0.18} y2={centerY + motorH / 2} stroke="#ff6a00" opacity="0.6" />
          <line x1={motorX + motorW * 0.78} y1={centerY - motorH / 2} x2={motorX + motorW * 0.78} y2={centerY + motorH / 2} stroke="#ff6a00" opacity="0.48" />
          <text x={motorX + 9} y={centerY + 4} fill="#ffc247" fontSize="11" fontFamily="IBM Plex Mono">MOTOR</text>
        </g>

        <path d={finPath(config.fins.type, finX, finRoot, finTip, finSpan, finSweep, bodyBottom)} fill="#121a21" stroke="#f7f4ee" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M ${tailX} ${centerY - motorH * 0.28} C ${tailX + 42} ${centerY - 36}, ${tailX + 62} ${centerY}, ${tailX + 42} ${centerY + 30} C ${tailX + 25} ${centerY + 16}, ${tailX + 14} ${centerY + motorH * 0.22}, ${tailX} ${centerY + motorH * 0.28} Z`} fill="url(#flame)" opacity="0.76" />

        <g className="cad-callouts">
          <line x1={cgX} y1="80" x2={cgX} y2="278" stroke="#ff4b00" strokeWidth="1.2" opacity="0.62" />
          <line x1={cpX} y1="92" x2={cpX} y2="292" stroke="#009aa6" strokeWidth="1.2" opacity="0.62" />
          <circle cx={cgX} cy="62" r="10" fill="#101820" stroke="#ff4b00" strokeWidth="4" />
          <circle cx={cpX} cy="306" r="10" fill="#101820" stroke="#009aa6" strokeWidth="4" />
          <text x={Math.min(cgX + 14, 742)} y="67" fill="#f7f4ee" fontSize="13" fontFamily="IBM Plex Mono">CG {Math.round(cgMm)} mm</text>
          <text x={Math.min(cpX + 14, 742)} y="311" fill="#f7f4ee" fontSize="13" fontFamily="IBM Plex Mono">CP {Math.round(cpMm)} mm</text>
        </g>

        <g className="viewport-mode-label">
          <rect x="620" y="48" width="218" height="34" rx="6" fill="#061114" opacity="0.92" stroke="#19d6df" strokeWidth="1" />
          <text x="634" y="69" fill="#19d6df" fontSize="11" fontFamily="IBM Plex Mono">CORTE LATERAL TÉCNICO · LIMPO</text>
        </g>

        <g className="dimension-line">
          <line x1={startX} y1="334" x2={tailX} y2="334" stroke="#ffc247" strokeWidth="2" />
          <line x1={startX} y1="326" x2={startX} y2="342" stroke="#ffc247" strokeWidth="2" />
          <line x1={tailX} y1="326" x2={tailX} y2="342" stroke="#ffc247" strokeWidth="2" />
          <text x={startX} y="354" fill="#ffc247" fontSize="12" fontFamily="IBM Plex Mono">L total {Math.round(totalLength)} mm · Ø {config.body.outerDiameterMm} mm · estabilidade {round(stability, 2)} calibres</text>
        </g>
      </svg>
    </div>
  );
}

type MissionStatus = 'planejamento' | 'desenvolvimento' | 'teste' | 'validacao' | 'competicao' | 'concluida' | 'concluido';
type DeliveryStatus = 'pendente' | 'enviado' | 'aprovado' | 'reprovado' | 'ajustes';
type TaskPriority = 'baixa' | 'media' | 'alta' | 'critica';
type RocketTaskStatus = 'pendente' | 'andamento' | 'concluida';

type Mission = {
  id: string;
  databaseId?: number;
  name: string;
  type: string;
  description: string;
  target: string;
  status: MissionStatus;
  progress: number;
  assignedTo: string[];
  competition?: string;
};

type RocketTask = {
  id: string | number;
  missionId: string;
  subsystem: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string[];
  status: RocketTaskStatus;
  checklist: { id: string; text: string; done: boolean }[];
  statusHistory: { status: RocketTaskStatus; author: string; at: string; note: string }[];
};

type Delivery = {
  id: string | number;
  missionId: string;
  subsystem: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: DeliveryStatus;
  notes: string;
  reviewer?: string;
  reviewComment?: string;
  reviewedAt?: string;
};

type Message = {
  id: string;
  missionId: string;
  subsystem: string;
  author: string;
  content: string;
  createdAt: string;
};

type RocketNotification = {
  id: string;
  title: string;
  description: string;
  subsystem: string;
  kind: 'mensagem' | 'demanda' | 'entrega' | 'progresso' | 'revisao';
  at: string;
};

const TEAM_MEMBERS = ['Gabriel', 'Larissa', 'Nicolly', 'Amanda', 'Yasmim', 'Davi', 'Gabriel N.', 'Vinícius', 'Laura', 'Time Rocket'];

const SUBSYSTEMS = [
  { id: 'avionica', name: 'Aviónica', description: 'Computador de bordo, sensores, GPS, aquisição de dados e lógica embarcada.' },
  { id: 'estrutura', name: 'Estrutura', description: 'Célula estrutural, conexões, envelopes mecânicos, integração e fabricação.' },
  { id: 'motor', name: 'Motor', description: 'Motor sólido, envelope propulsivo, caracterização, montagem e segurança.' },
  { id: 'propulsao', name: 'Propulsão', description: 'Integração propulsiva, propelente, ignição, interfaces e validações de bancada.' },
  { id: 'telemetria', name: 'Telemetria', description: 'Comunicação, rastreio, transmissão de dados, antenas e estação de solo.' },
  { id: 'recuperacao', name: 'Recuperação', description: 'Paraquedas, separação, ejeção, rastreabilidade, pouso e pós-voo.' },
  { id: 'energia', name: 'Energia', description: 'Baterias, alimentação, distribuição elétrica, redundância e segurança.' },
  { id: 'payload', name: 'Payload', description: 'Carga útil, CubeSat, experimentos, instrumentação e integração de missão.' },
];

function subsystemNumericId(subsystemId: string) {
  const index = SUBSYSTEMS.findIndex((subsystem) => subsystem.id === subsystemId);
  return index >= 0 ? index + 1 : 1;
}

function getInsertId(result: unknown) {
  if (!result || typeof result !== 'object') return undefined;
  const candidate = result as { insertId?: number; data?: { insertId?: number } };
  return candidate.insertId ?? candidate.data?.insertId;
}

const LASC_TIMELINE = [
  { id: 'design_submission', date: '2026-01-16', title: 'Submissão de Design', description: 'Pacote de design enviado para avaliação da LASC.', status: 'concluido' },
  { id: 'design_review', date: '2026-02-20', title: 'Design Review / Feedback', description: 'Análise das observações, riscos e ajustes solicitados.', status: 'atual' },
  { id: 'manufacturing', date: '2026-03-30', title: 'Fabricação e Integração', description: 'Construção, integração mecânica, elétrica e documentação de fabricação.', status: 'proximo' },
  { id: 'ground_tests', date: '2026-05-15', title: 'Testes em Solo', description: 'Ensaios, validações, contraprovas e testes operacionais.', status: 'proximo' },
  { id: 'flight_readiness', date: '2026-06-15', title: 'Flight Readiness Review', description: 'Pacote final de evidências, checklists e aprovação para competição.', status: 'proximo' },
  { id: 'competition', date: '2026-07-01', title: 'LASC 2026', description: 'Competição, operação de campo, lançamento e pós-voo.', status: 'proximo' },
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'cubesat-2u', name: 'CubeSat 2U', type: 'Satélite', description: 'Missão orbital/educacional com estrutura 2U, payload técnico e integração com documentação de competição.', target: '2U', status: 'desenvolvimento', progress: 42, assignedTo: ['Gabriel', 'Davi', 'Time Rocket'], competition: 'LASC / Missões satelitais' },
  { id: 'mg-vera-cruz-n1', name: 'MG-VERA CRUZ-N1', type: 'Foguete sólido', description: 'Foguete sólido para classe aproximada de 3 km, com foco em documentação, estabilidade, recuperação e validação técnica.', target: '3 km', status: 'desenvolvimento', progress: 58, assignedTo: ['Gabriel', 'Vinícius', 'Time Rocket'], competition: 'LASC 2026' },
  { id: 'mg-reis-n1', name: 'MG-REIS-N1', type: 'Foguete sólido', description: 'Foguete sólido para classe aproximada de 1 km, utilizado como plataforma incremental para testes e aprendizagem operacional.', target: '1 km', status: 'teste', progress: 67, assignedTo: ['Gabriel', 'Laura', 'Time Rocket'], competition: 'Competições nacionais / testes' },
];

const INITIAL_TASKS: RocketTask[] = [
  {
    id: 'task-1', missionId: 'mg-vera-cruz-n1', subsystem: 'avionica', title: 'Revisar pacote pós-submissão de design', description: 'Consolidar feedbacks e transformar observações em ações por subsistema.', priority: 'critica', dueDate: '2026-02-20', assignedTo: ['Gabriel', 'Larissa'], status: 'andamento',
    checklist: [
      { id: 'ck-1', text: 'Separar feedbacks por subsistema', done: true },
      { id: 'ck-2', text: 'Criar lista de ajustes obrigatórios', done: false },
      { id: 'ck-3', text: 'Validar riscos técnicos antes da fabricação', done: false },
    ],
    statusHistory: [
      { status: 'pendente', author: 'Gabriel', at: '2026-02-01 09:00', note: 'Demanda criada após a submissão de design.' },
      { status: 'andamento', author: 'Larissa', at: '2026-02-02 16:20', note: 'Primeiro item do checklist confirmado.' },
    ],
  },
  {
    id: 'task-2', missionId: 'mg-reis-n1', subsystem: 'recuperacao', title: 'Checklist de recuperação para voo 1 km', description: 'Validar sequência de recuperação e preparar evidências de teste.', priority: 'alta', dueDate: '2026-03-05', assignedTo: ['Laura', 'Time Rocket'], status: 'pendente',
    checklist: [
      { id: 'ck-4', text: 'Definir massa e envelope do sistema', done: false },
      { id: 'ck-5', text: 'Planejar teste de ejeção', done: false },
      { id: 'ck-6', text: 'Registrar evidências no sistema', done: false },
    ],
    statusHistory: [
      { status: 'pendente', author: 'Laura', at: '2026-02-04 11:10', note: 'Checklist aberto para planejamento de recuperação.' },
    ],
  },
];

const INITIAL_DELIVERIES: Delivery[] = [
  { id: 'del-1', missionId: 'mg-vera-cruz-n1', subsystem: 'avionica', title: 'Submissão de Design LASC enviada', submittedBy: 'Gabriel', submittedAt: '2026-01-16', status: 'aprovado', notes: 'Submissão de design já enviada. Próximo passo: leitura crítica e plano de ajustes.', reviewer: 'Gabriel', reviewComment: 'Marco concluído. Manter evidências organizadas.' },
  { id: 'del-2', missionId: 'mg-vera-cruz-n1', subsystem: 'avionica', title: 'Mapa inicial de sensores e telemetria', submittedBy: 'Davi', submittedAt: '2026-02-03', status: 'enviado', notes: 'Primeira versão de sensores, GPS e aquisição de dados para revisão.', reviewer: '', reviewComment: '' },
  { id: 'del-4', missionId: 'mg-vera-cruz-n1', subsystem: 'avionica', title: 'Matriz de resposta ao feedback LASC', submittedBy: 'Larissa', submittedAt: '2026-02-12', status: 'pendente', notes: 'Checklist de comentários, responsável por resposta e evidência necessária para cada item recebido.' },
  { id: 'del-5', missionId: 'mg-vera-cruz-n1', subsystem: 'estrutura', title: 'Pré-checklist de fabricação da estrutura', submittedBy: 'Vinícius', submittedAt: '2026-02-15', status: 'enviado', notes: 'Lista inicial de materiais, tolerâncias, interfaces e validações antes da fabricação.' },
  { id: 'del-3', missionId: 'cubesat-2u', subsystem: 'payload', title: 'Lista preliminar de payload CubeSat 2U', submittedBy: 'Time Rocket', submittedAt: '2026-02-05', status: 'ajustes', notes: 'Necessário separar requisitos obrigatórios e desejáveis.', reviewer: 'Gabriel', reviewComment: 'Ajustar massa, energia e volume útil.' },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 'msg-1', missionId: 'mg-vera-cruz-n1', subsystem: 'avionica', author: 'Gabriel', content: 'Design submission já foi enviado. Agora precisamos transformar o retorno da LASC em tarefas objetivas por subsistema.', createdAt: '2026-02-01 10:30' },
  { id: 'msg-2', missionId: 'mg-vera-cruz-n1', subsystem: 'avionica', author: 'Gabriel', content: 'Aviônica: preparar mapa de sensores, diagrama de blocos e lista de componentes críticos.', createdAt: '2026-02-02 14:15' },
];

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  baixa: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  media: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
  alta: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  critica: 'border-red-500/30 bg-red-500/10 text-red-200',
};

const TASK_STATUS_STYLE: Record<RocketTaskStatus, string> = {
  pendente: 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  andamento: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  concluida: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

const TASK_STATUS_LABEL: Record<RocketTaskStatus, string> = {
  pendente: 'Pendente',
  andamento: 'Em progresso',
  concluida: 'Concluído',
};

const DELIVERY_STYLE: Record<DeliveryStatus, string> = {
  pendente: 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  enviado: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  aprovado: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  reprovado: 'border-red-500/30 bg-red-500/10 text-red-200',
  ajustes: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
};

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Rocket() {
  const { user } = useAuth();
  const activeUserName = user?.name ?? 'Usuário Rocket';
  const activeTeamType = (user as any)?.teamType;
  const canCreateRocketTasks = activeTeamType === 'innovare_team';
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [tasks, setTasks] = useState<RocketTask[]>(INITIAL_TASKS);
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
  const [subsystemProgressOverrides, setSubsystemProgressOverrides] = useState<Record<string, number>>({});
  const [selectedMissionId, setSelectedMissionId] = useState('mg-vera-cruz-n1');
  const [selectedSubsystem, setSelectedSubsystem] = useState('avionica');
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [isNozzleModalOpen, setIsNozzleModalOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [missionForm, setMissionForm] = useState({ name: '', type: '', description: '', target: '', competition: '', assignedTo: [] as string[] });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'media' as TaskPriority, dueDate: '', assignedTo: [] as string[], checklistText: '' });
  const [taskFormError, setTaskFormError] = useState('');
  const [deliveryForm, setDeliveryForm] = useState({ title: '', submittedBy: '', notes: '' });
  const [progressForm, setProgressForm] = useState({ progress: '', note: '' });
  const [progressFormError, setProgressFormError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [notificationHistory, setNotificationHistory] = useState<RocketNotification[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const knownMessageIdsBySubsystemRef = useRef<Record<string, Set<string>>>({});

  // === CAD STATE & PERSISTENCE HOOKS ===
  const [activeTab, setActiveTab] = useState<'gestao' | 'cad'>('gestao');
  const [config, setConfig] = useState<RocketConfig>(() => {
    const saved = localStorage.getItem("innovare-rocket-config-" + selectedMissionId);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
    return getDefaultConfigForMission(selectedMissionId);
  });
  const [activePreset, setActivePreset] = useState("n1800");
  const [supportIntention, setSupportIntention] = useState<string | null>(null);
  const [activePart, setActivePart] = useState<ActivePart>("nose");

  // Effect to load config when mission selection changes
  useEffect(() => {
    const saved = localStorage.getItem("innovare-rocket-config-" + selectedMissionId);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to parse config on mission change", e);
      }
    }
    setConfig(getDefaultConfigForMission(selectedMissionId));
  }, [selectedMissionId]);

  // Effect to save config when config changes
  useEffect(() => {
    localStorage.setItem("innovare-rocket-config-" + selectedMissionId, JSON.stringify(config));
  }, [config, selectedMissionId]);

  const simulation = useMemo(() => simulateFlight(config), [config]);
  const motorDerived = useMemo(() => getMotorDerived(config.motor), [config.motor]);
  const massBreakdown = simulation.massBreakdown;
  const targetDelta = simulation.apogeeM - config.mission.targetApogee;
  const stabilityStatus = simulation.stability >= 1 && simulation.stability <= 2.5 ? "Margem educativa adequada" : simulation.stability < 1 ? "Atenção: estabilidade baixa" : "Atenção: estabilidade alta/pesada";

  const update = <K extends keyof RocketConfig>(section: K, patch: Partial<RocketConfig[K]>) => {
    setConfig((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
  };

  const applyPayloadType = (type: PayloadType) => {
    if (type === "cubesat") {
      const profile = cubesatProfiles[config.payload.cubesatUnits];
      update("payload", { type, lengthMm: profile.lengthMm, diameterMm: profile.diameterMm, massG: Math.min(profile.massG, 5000), name: profile.name });
      return;
    }

    const typeDefaults: Record<Exclude<PayloadType, "cubesat">, Partial<RocketConfig["payload"]>> = {
      cansat: { name: "CanSat telemetria básica", lengthMm: 150, diameterMm: 66, massG: 380 },
      scientific: { name: "Payload científico modular", lengthMm: 240, diameterMm: 84, massG: 760 },
      probe: { name: "Sonda experimental embarcada", lengthMm: 210, diameterMm: 72, massG: 520 },
      ballast: { name: "Lastro calibrado de CG", lengthMm: 80, diameterMm: 62, massG: 650 },
      custom: { name: "Módulo personalizado", lengthMm: config.payload.lengthMm, diameterMm: config.payload.diameterMm, massG: config.payload.massG },
    };
    update("payload", { type, ...typeDefaults[type] });
  };

  const applyCubeSatUnits = (cubesatUnits: CubeSatUnits) => {
    const profile = cubesatProfiles[cubesatUnits];
    update("payload", { type: "cubesat", cubesatUnits, lengthMm: profile.lengthMm, diameterMm: profile.diameterMm, massG: Math.min(profile.massG, 5000), name: profile.name });
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setConfig(JSON.parse(JSON.stringify(preset.config)) as RocketConfig);
    toast.success(`${preset.label} aplicado`, { description: "Campos, prévia e simulação foram recalculados." });
    setTimeout(() => scrollToSection("parametros"), 80);
  };

  const recalc = () => {
    toast.success("Simulação recalculada", { description: `Apogeu estimado: ${Math.round(simulation.apogeeM)} m · estabilidade: ${round(simulation.stability, 2)} calibres.` });
    scrollToSection("simulacao");
  };

  const exportProject = () => {
    const payload = {
      platform: "Innovare Rocket MVP",
      notice: "Pré-dimensionamento educativo. Requer validação técnica, ensaios e revisão de segurança antes de qualquer fabricação ou lançamento.",
      createdAt: new Date().toISOString(),
      config,
      derived: {
        motor: motorDerived,
        mass: massBreakdown,
        payload: {
          typeLabel: payloadTypeLabels[config.payload.type],
          cubeSatStandard: config.payload.type === "cubesat" ? cubesatUnitLabels[config.payload.cubesatUnits] : null,
        },
      },
      simulation: { ...simulation, chart: undefined },
    };
    downloadFile("innovare-rocket-projeto-parametrico.json", "application/json", JSON.stringify(payload, null, 2));
    toast.success("Projeto exportado em JSON");
  };

  const exportOpenRocket = () => {
    const xml = generateOrkXml(config, simulation, massBreakdown);
    downloadFile(`${config.mission.name.replace(/\s+/g, "_")}_openrocket.ork`, "application/xml", xml);
    toast.success("Arquivo OpenRocket (.ork) exportado");
  };

  const exportRocketPy = () => {
    const pythonScript = generateRocketPyScript(config, simulation, massBreakdown);
    downloadFile(`${config.mission.name.replace(/\s+/g, "_")}_simulation.py`, "text/plain", pythonScript);
    toast.success("Script RocketPy (.py) exportado");
  };

  const exportCsv = () => {
    const header = "tempo_s,altitude_m,velocidade_m_s,aceleracao_g";
    const rows = simulation.chart.map((point) => `${point.time},${point.altitude},${point.velocity},${point.acceleration}`);
    downloadFile("innovare-rocket-simulacao.csv", "text/csv", [header, ...rows].join("\n"));
    toast.success("CSV da simulação exportado");
  };

  const exportReport = () => {
    const report = `# Relatório educativo — ${config.mission.name}

Objetivo: ${config.mission.objective}

## Ambiente e Atmosfera
Altitude do local: ${config.mission.launchAltitude} m
Vento estimado: ${config.mission.windSpeed} m/s
Densidade do ar: ${config.mission.airDensity ?? 1.225} kg/m³
Temperatura ambiente: ${config.mission.temperature ?? 15} °C

## Geometria geral
Comprimento total: ${Math.round(simulation.totalLengthMm)} mm
Diâmetro externo: ${config.body.outerDiameterMm} mm
Coifa: ${noseLabels[config.nose.type]} com ${config.nose.lengthMm} mm
Aletas: ${config.fins.count}x ${finLabels[config.fins.type]} — raiz ${config.fins.rootChordMm} mm, ponta ${config.fins.tipChordMm} mm, envergadura ${config.fins.spanMm} mm

## Payload modular
Tipo: ${payloadTypeLabels[config.payload.type]}
Padrão CubeSat: ${config.payload.type === "cubesat" ? cubesatUnitLabels[config.payload.cubesatUnits] : "não aplicável"}
Nome: ${config.payload.name}
Envelope: ${config.payload.lengthMm} mm de comprimento × ${config.payload.diameterMm} mm de seção/diâmetro
Massa efetiva: ${round(massBreakdown.payload.effectiveG, 1)} g (${massModeLabels[massBreakdown.payload.mode]})
CG declarado desde a ponta: ${config.payload.cgFromNoseMm} mm

## Massa e motor
Massa inicial estimada: ${round(simulation.initialMassKg, 3)} kg
Massa seca efetiva: ${round(simulation.dryMassKg, 3)} kg
Parcela calculada automaticamente: ${round(massBreakdown.autoSharePct, 1)}% da massa inicial
Nose/body/fins/payload/motor usam massa calculada por padrão; campos manuais entram apenas quando marcados como medidos.
Motor: ${config.motor.name}
Empuxo médio: ${config.motor.avgThrustN} N
Empuxo pico: ${config.motor.peakThrustN} N
Tempo de queima: ${config.motor.burnTimeS} s
Impulso estimado: ${round(simulation.impulseNs, 1)} N.s
Pressão de câmara declarada: ${config.motor.chamberPressureBar} bar
Massa seca efetiva do motor: ${round(massBreakdown.motorDry.effectiveG, 1)} g (${massModeLabels[massBreakdown.motorDry.mode]})
Massa efetiva do propelente: ${round(massBreakdown.propellant.effectiveG, 1)} g (${massModeLabels[massBreakdown.propellant.mode]})

## Câmara, casing e montagem
Diâmetro do casing: ${config.motor.casingDiameterMm} mm
Comprimento do casing: ${config.motor.casingLengthMm} mm
Espessura do casing: ${config.motor.casingWallMm} mm
Ø câmara útil: ${config.motor.chamberDiameterMm} mm
Comprimento da câmara: ${config.motor.chamberLengthMm} mm
Volume geométrico aproximado da câmara: ${round(motorDerived.chamberVolumeCm3, 1)} cm³
Razão L/D da câmara: ${round(motorDerived.chamberLdRatio, 2)}
Tipo de encaixe: ${motorMountLabels[config.motor.mountType]}
Retentor: ${retainerLabels[config.motor.retainerType]}

## Nozzle
Ø garganta: ${config.motor.throatDiameterMm} mm
Ø saída: ${config.motor.nozzleExitDiameterMm} mm
Área da garganta: ${round(motorDerived.throatAreaMm2, 1)} mm²
Área de saída: ${round(motorDerived.exitAreaMm2, 1)} mm²
Razão de expansão geométrica: ${round(motorDerived.expansionRatio, 2)}:1
Ângulo convergente: ${config.motor.nozzleConvergentAngleDeg}°
Ângulo divergente: ${config.motor.nozzleDivergentAngleDeg}°
Comprimento convergente: ${config.motor.nozzleConvergentLengthMm} mm
Comprimento divergente: ${config.motor.nozzleDivergentLengthMm} mm
Comprimento total do nozzle: ${round(motorDerived.nozzleLengthMm, 1)} mm

## Grãos e inibição
Geometria: ${grainGeometryLabels[config.motor.grainGeometry]}
Inibição: ${grainInhibitionLabels[config.motor.grainInhibition]}
Quantidade: ${config.motor.grainCount}
Comprimento unitário: ${config.motor.grainLengthMm} mm
Ø externo do grão: ${config.motor.grainOuterDiameterMm} mm
Ø porto/furo: ${config.motor.grainCoreDiameterMm} mm
Espaçamento entre grãos: ${config.motor.grainSpacingMm} mm
Comprimento do pack: ${round(motorDerived.grainPackLengthMm, 1)} mm
Volume geométrico aproximado dos grãos: ${round(motorDerived.grainVolumeCm3, 1)} cm³
Densidade geométrica informativa: ${round(motorDerived.grainLoadingGcm3, 3)} g/cm³
Massa automática calculada dos grãos: ${round(massBreakdown.propellant.estimatedG, 1)} g

## Sistema de Recuperação
Diâmetro do paraquedas: ${config.recovery.parachuteDiameterMm} mm
Tipo de paraquedas: ${config.recovery.parachuteType === 'toroide' ? 'Toroide' : 'Hemisférico'}
Coeficiente de arrasto (Cd): ${config.recovery.parachuteType === 'toroide' ? '1.2' : '1.5'}
Velocidade de descida: ${round(simulation.descentRate, 1)} m/s
Tempo de descida estimado: ${round(simulation.descentTimeS, 1)} s

## Simulação simplificada
Apogeu estimado: ${Math.round(simulation.apogeeM)} m
Velocidade máxima: ${round(simulation.maxVelocity, 1)} m/s
Aceleração máxima: ${round(simulation.maxAccelerationG, 2)} g
Estabilidade: ${round(simulation.stability, 2)} calibres
CG: ${Math.round(simulation.cgMm)} mm
CP: ${Math.round(simulation.cpMm)} mm

## Observação
Este MVP é uma ferramenta educativa e de pré-dimensionamento. Não substitui OpenRocket/RocketPy, ensaios, normas, revisão por responsável técnico, análise de segurança, análise balística interna validada, avaliação de materiais, propriedade intelectual aplicável ou autorização de lançamento.
`;
    downloadFile("innovare-rocket-relatorio.md", "text/markdown", report);
    toast.success("Relatório técnico educativo exportado");
  };

  const registerSupport = (tier: string) => {
    const intention = `Apoio registrado: ${tier} · ${new Date().toLocaleString("pt-BR")}`;
    setSupportIntention(intention);
    downloadFile("innovare-rocket-intencao-de-apoio.txt", "text/plain", `${intention}\nProjeto: ${config.mission.name}\nObjetivo: manter simuladores, materiais educativos, biblioteca de presets e validações técnicas.\n`);
    toast.success("Intenção de apoio registrada", { description: "No MVP, o arquivo documenta a intenção. Depois conectamos Pix/Stripe." });
  };

  const selectPart = (part: ActivePart) => {
    setActivePart(part);
    const labels: Record<ActivePart, string> = {
      mission: "Missão aberta",
      nose: "Coifa selecionada",
      body: "Tubo principal selecionado",
      transition: "Transição selecionada",
      fins: "Aletas selecionadas",
      motor: "Motor selecionado",
      recovery: "Recuperação selecionada",
      payload: "Payload selecionado",
      electronics: "Eletrônica selecionada",
      simulation: "Simulação aberta",
      learning: "Cálculo guiado aberto",
      export: "Exportações abertas",
    };
    toast.info(labels[part], { description: "A janela de propriedades foi atualizada sem esconder a prévia do foguete." });
  };

  const insertComponent = (part: ActivePart) => {
    if (part === "transition") update("transition", { enabled: true });
    selectPart(part);
    toast.success("Componente inserido na montagem", { description: "Edite os parâmetros no painel de propriedades à direita." });
  };

  const assemblyItems: { id: ActivePart; label: string; detail: string; icon: any; state: "ok" | "warn" | "optional" }[] = [
    { id: "mission", label: "Missão", detail: `${config.mission.targetApogee} m alvo`, icon: Target, state: "ok" },
    { id: "nose", label: "Coifa", detail: `${noseLabels[config.nose.type]} · ${config.nose.lengthMm} mm`, icon: Rocket, state: "ok" },
    { id: "body", label: "Tubo / corpo", detail: `${config.body.lengthMm} x Ø${config.body.outerDiameterMm} mm`, icon: Layers3, state: "ok" },
    { id: "transition", label: "Transição", detail: config.transition.enabled ? `${config.transition.lengthMm} mm ativa` : "opcional inativa", icon: Boxes, state: config.transition.enabled ? "ok" : "optional" },
    { id: "fins", label: "Aletas", detail: `${config.fins.count}x ${finLabels[config.fins.type]}`, icon: Gauge, state: simulation.stability < 1 ? "warn" : "ok" },
    { id: "motor", label: "Motor", detail: `${config.motor.name} · ${round(massBreakdown.motorDry.effectiveG + massBreakdown.propellant.effectiveG, 0)} g`, icon: Zap, state: simulation.thrustToWeight < 5 ? "warn" : "ok" },
    { id: "recovery", label: "Recuperação", detail: `queda ${round(simulation.descentRate, 1)} m/s`, icon: ShieldAlert, state: simulation.descentRate > 9 ? "warn" : "ok" },
    { id: "payload", label: "Payload modular", detail: `${payloadTypeLabels[config.payload.type]} · ${round(massBreakdown.payload.effectiveG, 0)} g`, icon: Satellite, state: "ok" },
    { id: "electronics", label: "Eletrônica", detail: `${config.electronics.powerBudgetW} W · ${config.electronics.telemetryRateHz} Hz`, icon: CircuitBoard, state: "ok" },
    { id: "simulation", label: "Simulação", detail: `${Math.round(simulation.apogeeM)} m estimados`, icon: Activity, state: Math.abs(targetDelta) > config.mission.targetApogee * 0.35 ? "warn" : "ok" },
    { id: "export", label: "Exportar", detail: "JSON · CSV · relatório", icon: Download, state: "ok" },
  ];

  const partTitle: Record<ActivePart, { title: string; kicker: string; description: string }> = {
    mission: { title: "Propriedades da missão", kicker: "arquivo / projeto", description: "Defina o nome, objetivo e condições externas. Estes dados alimentam os resultados e os relatórios exportados." },
    nose: { title: "Inserir e editar coifa", kicker: "peça dianteira", description: "Escolha o tipo de coifa e ajuste comprimento, diâmetro, parede e material; a massa é calculada automaticamente e só vira manual quando você quiser." },
    body: { title: "Inserir e editar tubo principal", kicker: "estrutura", description: "Controle o corpo como componente tubular: dimensões, espessura, material, acoplador e rail buttons; a massa efetiva sai da geometria." },
    transition: { title: "Inserir transição / redução", kicker: "geometria opcional", description: "Ative a transição quando houver mudança de diâmetro entre corpo, motor, booster ou seção traseira." },
    fins: { title: "Inserir e editar aletas", kicker: "estabilidade", description: "Altere o formato e a geometria das aletas para deslocar o CP e controlar a estabilidade em calibres." },
    motor: { title: "Aba técnica do motor", kicker: "câmara · nozzle · grãos", description: "Veja o motor de perto em corte e edite casing, câmara, nozzle, encaixe, retentor, grãos, inibição, massa, empuxo, garganta e pressão." },
    recovery: { title: "Sistema de recuperação", kicker: "segurança", description: "Ajuste paraquedas, drogue, shock cord, delay e massa para estimar velocidade de descida." },
    payload: { title: "Payload modular", kicker: "CanSat · CubeSat · científico", description: "Escolha CanSat, CubeSat 1U/2U/3U/6U/12U, sonda, lastro ou módulo customizado; a prévia interna muda junto com as dimensões." },
    electronics: { title: "Eletrônica embarcada", kicker: "aviônica", description: "Registre potência, telemetria e massas medidas quando necessário; por padrão a aviônica também recebe uma estimativa educativa." },
    simulation: { title: "Simulação e curvas", kicker: "análise", description: "Leia os resultados principais e recalcule o voo simplificado mantendo a montagem à vista." },
    learning: { title: "Cálculo guiado", kicker: "educação técnica", description: "Entenda o que está sendo calculado e quais hipóteses precisam de validação técnica fora do MVP." },
    export: { title: "Exportar arquivos", kicker: "saída técnica", description: "Gere arquivos reais com a geometria preenchida, a simulação e o relatório educativo do projeto." },
  };

  const renderProperties = () => {
    if (activePart === "mission") {
      return <ParamSection title="Missão" kicker="objetivo" icon={Target}>
        <TextField label="Nome do projeto" value={config.mission.name} onChange={(name) => update("mission", { name })} />
        <TextField label="Objetivo da missão" value={config.mission.objective} onChange={(objective) => update("mission", { objective })} />
        <NumberField label="Apogeu alvo" unit="m" value={config.mission.targetApogee} min={50} max={5000} step={10} onChange={(targetApogee) => update("mission", { targetApogee })} />
        <NumberField label="Altitude do local" unit="m" value={config.mission.launchAltitude} min={0} max={2500} step={10} onChange={(launchAltitude) => update("mission", { launchAltitude })} />
        <NumberField label="Vento estimado" unit="m/s" value={config.mission.windSpeed} min={0} max={18} step={0.5} onChange={(windSpeed) => update("mission", { windSpeed })} />
        <NumberField label="Densidade do ar" unit="kg/m³" value={config.mission.airDensity ?? 1.225} min={0.1} max={2.5} step={0.005} onChange={(airDensity) => update("mission", { airDensity })} />
        <NumberField label="Temperatura ambiente" unit="°C" value={config.mission.temperature ?? 15} min={-40} max={60} step={0.5} onChange={(temperature) => update("mission", { temperature })} />
      </ParamSection>;
    }
    if (activePart === "nose") {
      return <ParamSection title="Coifa" kicker="nariz" icon={Rocket}>
        <SelectField<NoseType> label="Tipo de coifa" value={config.nose.type} options={noseLabels} onChange={(type) => update("nose", { type })} />
        <SelectField<MaterialKey> label="Material" value={config.nose.material} options={materialLabels} onChange={(material) => update("nose", { material })} />
        <NumberField label="Comprimento" unit="mm" value={config.nose.lengthMm} min={60} max={700} step={5} onChange={(lengthMm) => update("nose", { lengthMm })} />
        <NumberField label="Diâmetro base" unit="mm" value={config.nose.baseDiameterMm} min={25} max={180} step={1} onChange={(baseDiameterMm) => update("nose", { baseDiameterMm })} />
        <NumberField label="Espessura" unit="mm" value={config.nose.wallMm} min={0.6} max={8} step={0.1} onChange={(wallMm) => update("nose", { wallMm })} />
        <MassControl label="Massa efetiva da coifa" value={massBreakdown.nose} min={20} max={1600} step={5} onModeChange={(massMode) => update("nose", { massMode })} onManualChange={(massG) => update("nose", { massG })} />
      </ParamSection>;
    }
    if (activePart === "body") {
      return <ParamSection title="Corpo e tubo principal" kicker="estrutura" icon={Layers3}>
        <SelectField<MaterialKey> label="Material" value={config.body.material} options={materialLabels} onChange={(material) => update("body", { material })} />
        <NumberField label="Comprimento do corpo" unit="mm" value={config.body.lengthMm} min={180} max={3000} step={10} onChange={(lengthMm) => update("body", { lengthMm })} />
        <NumberField label="Diâmetro externo" unit="mm" value={config.body.outerDiameterMm} min={25} max={220} step={1} onChange={(outerDiameterMm) => update("body", { outerDiameterMm, innerDiameterMm: Math.max(outerDiameterMm - config.body.wallMm * 2, 1), wallMm: config.body.wallMm })} />
        <NumberField label="Diâmetro interno" unit="mm" value={config.body.innerDiameterMm} min={20} max={210} step={0.5} onChange={(innerDiameterMm) => update("body", { innerDiameterMm, wallMm: Math.max((config.body.outerDiameterMm - innerDiameterMm) / 2, 0.2) })} />
        <NumberField label="Espessura de parede" unit="mm" value={config.body.wallMm} min={0.5} max={10} step={0.1} onChange={(wallMm) => update("body", { wallMm, innerDiameterMm: Math.max(config.body.outerDiameterMm - wallMm * 2, 1) })} />
        <MassControl label="Massa efetiva do tubo" value={massBreakdown.body} min={60} max={6000} step={10} onModeChange={(massMode) => update("body", { massMode })} onManualChange={(massG) => update("body", { massG })} />
        <NumberField label="Acoplador" unit="mm" value={config.body.couplerLengthMm} min={0} max={500} step={5} onChange={(couplerLengthMm) => update("body", { couplerLengthMm })} />
        <NumberField label="Distância entre rail buttons" unit="mm" value={config.body.railButtonDistanceMm} min={80} max={1600} step={10} onChange={(railButtonDistanceMm) => update("body", { railButtonDistanceMm })} />
      </ParamSection>;
    }
    if (activePart === "transition") {
      return <ParamSection title="Transição / redução" kicker="geometria" icon={Boxes}>
        <ToggleField label="Usar transição" checked={config.transition.enabled} onChange={(enabled) => update("transition", { enabled })} />
        <NumberField label="Comprimento" unit="mm" value={config.transition.lengthMm} min={20} max={450} step={5} onChange={(lengthMm) => update("transition", { lengthMm })} />
        <NumberField label="Diâmetro dianteiro" unit="mm" value={config.transition.foreDiameterMm} min={25} max={220} step={1} onChange={(foreDiameterMm) => update("transition", { foreDiameterMm })} />
        <NumberField label="Diâmetro traseiro" unit="mm" value={config.transition.aftDiameterMm} min={20} max={200} step={1} onChange={(aftDiameterMm) => update("transition", { aftDiameterMm })} />
        <MassControl label="Massa efetiva da transição" value={massBreakdown.transition} min={0} max={1200} step={5} onModeChange={(massMode) => update("transition", { massMode })} onManualChange={(massG) => update("transition", { massG })} />
      </ParamSection>;
    }
    if (activePart === "fins") {
      return <ParamSection title="Aletas" kicker="estabilidade" icon={Gauge}>
        <SelectField<FinType> label="Tipo de aleta" value={config.fins.type} options={finLabels} onChange={(type) => update("fins", { type })} />
        <SelectField<MaterialKey> label="Material" value={config.fins.material} options={materialLabels} onChange={(material) => update("fins", { material })} />
        <NumberField label="Quantidade" unit="un" value={config.fins.count} min={3} max={8} step={1} onChange={(count) => update("fins", { count })} />
        <NumberField label="Corda raiz" unit="mm" value={config.fins.rootChordMm} min={30} max={520} step={5} onChange={(rootChordMm) => update("fins", { rootChordMm })} />
        <NumberField label="Corda ponta" unit="mm" value={config.fins.tipChordMm} min={0} max={360} step={5} onChange={(tipChordMm) => update("fins", { tipChordMm })} />
        <NumberField label="Envergadura" unit="mm" value={config.fins.spanMm} min={15} max={300} step={2} onChange={(spanMm) => update("fins", { spanMm })} />
        <NumberField label="Sweep / recuo" unit="mm" value={config.fins.sweepMm} min={0} max={260} step={2} onChange={(sweepMm) => update("fins", { sweepMm })} />
        <NumberField label="Espessura" unit="mm" value={config.fins.thicknessMm} min={1} max={16} step={0.5} onChange={(thicknessMm) => update("fins", { thicknessMm })} />
        <MassControl label="Massa efetiva por aleta" value={massBreakdown.finEach} min={5} max={600} step={5} onModeChange={(massMode) => update("fins", { massMode })} onManualChange={(massEachG) => update("fins", { massEachG })} />
      </ParamSection>;
    }
    if (activePart === "motor") {
      return <div className="inspector-stack">
        <ParamSection title="Motor detalhado" kicker="câmara · nozzle · grãos" icon={Zap}>
          <MotorCutaway motor={config.motor} />
          <TextField label="Nome do motor" value={config.motor.name} onChange={(name) => update("motor", { name })} />
          <SelectField<string> label="Propulsor" value={config.motor.propellantType || "knsb_fine"} options={propellantOptions} onChange={(propellantType) => update("motor", { propellantType })} />
          <SelectField<GrainGeometry> label="Geometria dos grãos" value={config.motor.grainGeometry} options={grainGeometryLabels} onChange={(grainGeometry) => update("motor", { grainGeometry })} />
          <SelectField<GrainInhibition> label="Inibição" value={config.motor.grainInhibition} options={grainInhibitionLabels} onChange={(grainInhibition) => update("motor", { grainInhibition })} />
          <SelectField<MotorMountType> label="Tipo de encaixe" value={config.motor.mountType} options={motorMountLabels} onChange={(mountType) => update("motor", { mountType })} />
          <SelectField<RetainerType> label="Retentor / montagem" value={config.motor.retainerType} options={retainerLabels} onChange={(retainerType) => update("motor", { retainerType })} />
          <NumberField label="Diâmetro do casing" unit="mm" value={config.motor.casingDiameterMm} min={18} max={160} step={1} onChange={(casingDiameterMm) => update("motor", { casingDiameterMm, chamberDiameterMm: Math.max(casingDiameterMm - config.motor.casingWallMm * 2, 1) })} />
          <NumberField label="Comprimento do casing" unit="mm" value={config.motor.casingLengthMm} min={80} max={1200} step={5} onChange={(casingLengthMm) => update("motor", { casingLengthMm })} />
          <NumberField label="Espessura casing" unit="mm" value={config.motor.casingWallMm} min={0.8} max={12} step={0.1} onChange={(casingWallMm) => update("motor", { casingWallMm, chamberDiameterMm: Math.max(config.motor.casingDiameterMm - casingWallMm * 2, 1) })} />
          <NumberField label="Ø câmara útil" unit="mm" value={config.motor.chamberDiameterMm} min={10} max={150} step={0.5} onChange={(chamberDiameterMm) => update("motor", { chamberDiameterMm })} />
          <NumberField label="Comprimento câmara" unit="mm" value={config.motor.chamberLengthMm} min={30} max={1000} step={5} onChange={(chamberLengthMm) => update("motor", { chamberLengthMm })} />
          <MassControl label="Massa seca efetiva" value={massBreakdown.motorDry} min={30} max={6000} step={10} onModeChange={(dryMassMode) => update("motor", { dryMassMode })} onManualChange={(dryMassG) => update("motor", { dryMassG })} />
          <MassControl label="Massa efetiva do propelente" value={massBreakdown.propellant} min={20} max={8000} step={10} onModeChange={(propellantMassMode) => update("motor", { propellantMassMode })} onManualChange={(propellantMassG) => update("motor", { propellantMassG })} />
          <NumberField label="Empuxo médio" unit="N" value={config.motor.avgThrustN} min={10} max={2500} step={5} onChange={(avgThrustN) => update("motor", { avgThrustN })} />
          <NumberField label="Empuxo pico" unit="N" value={config.motor.peakThrustN} min={20} max={4000} step={10} onChange={(peakThrustN) => update("motor", { peakThrustN })} />
          <NumberField label="Tempo de queima" unit="s" value={config.motor.burnTimeS} min={0.2} max={12} step={0.05} onChange={(burnTimeS) => update("motor", { burnTimeS })} />
          <NumberField label="Ø garganta" unit="mm" value={config.motor.throatDiameterMm} min={2} max={60} step={0.1} onChange={(throatDiameterMm) => update("motor", { throatDiameterMm })} />
          <NumberField label="Ø saída nozzle" unit="mm" value={config.motor.nozzleExitDiameterMm} min={3} max={140} step={0.5} onChange={(nozzleExitDiameterMm) => update("motor", { nozzleExitDiameterMm })} />
          <NumberField label="Ângulo convergente" unit="graus" value={config.motor.nozzleConvergentAngleDeg} min={10} max={75} step={0.5} onChange={(nozzleConvergentAngleDeg) => update("motor", { nozzleConvergentAngleDeg })} />
          <NumberField label="Ângulo divergente" unit="graus" value={config.motor.nozzleDivergentAngleDeg} min={5} max={35} step={0.5} onChange={(nozzleDivergentAngleDeg) => update("motor", { nozzleDivergentAngleDeg })} />
          <NumberField label="Comprimento convergente" unit="mm" value={config.motor.nozzleConvergentLengthMm} min={5} max={180} step={1} onChange={(nozzleConvergentLengthMm) => update("motor", { nozzleConvergentLengthMm })} />
          <NumberField label="Comprimento divergente" unit="mm" value={config.motor.nozzleDivergentLengthMm} min={5} max={260} step={1} onChange={(nozzleDivergentLengthMm) => update("motor", { nozzleDivergentLengthMm })} />
          <NumberField label="Pressão de câmara" unit="bar" value={config.motor.chamberPressureBar} min={5} max={120} step={1} onChange={(chamberPressureBar) => update("motor", { chamberPressureBar })} />
          <Button type="button" onClick={() => setIsNozzleModalOpen(true)} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-3 shadow-lg shadow-orange-500/10 border border-orange-500/20"><Wrench size={15} /> DESIGN DO BICO</Button>
          <NumberField label="Quantidade de grãos" unit="un" value={config.motor.grainCount} min={1} max={12} step={1} onChange={(grainCount) => update("motor", { grainCount })} />
          <NumberField label="Comprimento por grão" unit="mm" value={config.motor.grainLengthMm} min={10} max={220} step={1} onChange={(grainLengthMm) => update("motor", { grainLengthMm })} />
          <NumberField label="Ø externo do grão" unit="mm" value={config.motor.grainOuterDiameterMm} min={8} max={145} step={0.5} onChange={(grainOuterDiameterMm) => update("motor", { grainOuterDiameterMm })} />
          <NumberField label="Ø porto/furo" unit="mm" value={config.motor.grainCoreDiameterMm} min={2} max={120} step={0.5} onChange={(grainCoreDiameterMm) => update("motor", { grainCoreDiameterMm })} />
          <NumberField label="Espaçamento entre grãos" unit="mm" value={config.motor.grainSpacingMm} min={0} max={30} step={0.5} onChange={(grainSpacingMm) => update("motor", { grainSpacingMm })} />
        </ParamSection>
        <section className="motor-derived-panel full-field">
          <header><Calculator size={16} /><strong>Cálculos geométricos educativos</strong></header>
          <div className="motor-derived-grid">
            <MetricCard label="Razão expansão" value={`${round(motorDerived.expansionRatio, 2)}:1`} detail="área saída / garganta" />
            <MetricCard label="Área garganta" value={`${round(motorDerived.throatAreaMm2, 1)} mm²`} detail={`saída ${round(motorDerived.exitAreaMm2, 1)} mm²`} tone="orange" />
            <MetricCard label="Câmara L/D" value={`${round(motorDerived.chamberLdRatio, 2)}`} detail={`${round(motorDerived.chamberVolumeCm3, 1)} cm³ aproximados`} tone="yellow" />
            <MetricCard label="Pack de grãos" value={`${round(motorDerived.grainPackLengthMm, 1)} mm`} detail={`${round(motorDerived.grainVolumeCm3, 1)} cm³ geométricos`} />
            <MetricCard label="Massa seca" value={`${round(massBreakdown.motorDry.effectiveG, 0)} g`} detail={massModeLabels[massBreakdown.motorDry.mode]} tone="orange" />
            <MetricCard label="Propelente" value={`${round(massBreakdown.propellant.effectiveG, 0)} g`} detail={massModeLabels[massBreakdown.propellant.mode]} tone="yellow" />
          </div>
          <p>Os valores acima são geométricos e educativos. Eles ajudam a documentar proporções, comparar alternativas e preparar revisão técnica, mas não substituem ensaios, normas, análise de materiais, balística interna validada e autorização de lançamento.</p>
        </section>
      </div>;
    }
    if (activePart === "recovery") {
      const parachuteTypeLabels = {
        hemisferico: "Hemisférico (Cd ≈ 1.5)",
        toroide: "Toroide (Cd ≈ 1.2)",
      };
      return <ParamSection title="Recuperação" kicker="segurança" icon={ShieldAlert}>
        <SelectField<"hemisferico" | "toroide"> label="Tipo de paraquedas" value={config.recovery.parachuteType ?? "hemisferico"} options={parachuteTypeLabels} onChange={(parachuteType) => update("recovery", { parachuteType })} />
        <NumberField label="Paraquedas principal" unit="mm" value={config.recovery.parachuteDiameterMm} min={200} max={3500} step={20} onChange={(parachuteDiameterMm) => update("recovery", { parachuteDiameterMm })} />
        <NumberField label="Drogue" unit="mm" value={config.recovery.drogueDiameterMm} min={0} max={1500} step={20} onChange={(drogueDiameterMm) => update("recovery", { drogueDiameterMm })} />
        <NumberField label="Linha / shock cord" unit="mm" value={config.recovery.cordLengthMm} min={500} max={12000} step={100} onChange={(cordLengthMm) => update("recovery", { cordLengthMm })} />
        <NumberField label="Delay de ejeção" unit="s" value={config.recovery.ejectionDelayS} min={1} max={18} step={0.5} onChange={(ejectionDelayS) => update("recovery", { ejectionDelayS })} />
        <MassControl label="Massa efetiva da recuperação" value={massBreakdown.recovery} min={20} max={2500} step={10} onModeChange={(massMode) => update("recovery", { massMode })} onManualChange={(massG) => update("recovery", { massG })} />
      </ParamSection>;
    }
    if (activePart === "payload") {
      return <ParamSection title="Payload modular" kicker="CanSat · CubeSat · científico" icon={PackageCheck}>
        <SelectField<PayloadType> label="Tipo de carga útil" value={config.payload.type} options={payloadTypeLabels} onChange={applyPayloadType} />
        {config.payload.type === "cubesat" ? <SelectField<CubeSatUnits> label="Padrão CubeSat" value={config.payload.cubesatUnits} options={cubesatUnitLabels} onChange={applyCubeSatUnits} /> : null}
        <TextField label="Nome do payload" value={config.payload.name} onChange={(name) => update("payload", { name })} />
        <NumberField label={config.payload.type === "cubesat" ? "Comprimento do stack" : "Comprimento"} unit="mm" value={config.payload.lengthMm} min={20} max={900} step={5} onChange={(lengthMm) => update("payload", { lengthMm })} />
        <NumberField label={config.payload.type === "cubesat" ? "Seção quadrada / envelope" : "Diâmetro / envelope"} unit="mm" value={config.payload.diameterMm} min={15} max={220} step={1} onChange={(diameterMm) => update("payload", { diameterMm })} />
        <MassControl label="Massa efetiva do payload" value={massBreakdown.payload} min={10} max={12000} step={10} onModeChange={(massMode) => update("payload", { massMode })} onManualChange={(massG) => update("payload", { massG })} />
        <NumberField label="CG desde a ponta" unit="mm" value={config.payload.cgFromNoseMm} min={20} max={simulation.totalLengthMm} step={10} onChange={(cgFromNoseMm) => update("payload", { cgFromNoseMm })} />
      </ParamSection>;
    }
    if (activePart === "electronics") {
      return <ParamSection title="Eletrônica embarcada" kicker="aviônica" icon={CircuitBoard}>
        <MassControl label="Massa efetiva da aviônica" value={massBreakdown.electronics} min={5} max={3600} step={5} onModeChange={(massMode) => update("electronics", { massMode })} onManualChange={(avionicsMassG) => update("electronics", { avionicsMassG, batteryMassG: 0, sensorMassG: 0, radioMassG: 0 })} />
        {massBreakdown.electronics.mode === "manual" ? <>
          <NumberField label="Massa bateria" unit="g" value={config.electronics.batteryMassG} min={0} max={1000} step={5} onChange={(batteryMassG) => update("electronics", { batteryMassG })} />
          <NumberField label="Massa OBC/avionics" unit="g" value={config.electronics.avionicsMassG} min={5} max={1600} step={5} onChange={(avionicsMassG) => update("electronics", { avionicsMassG })} />
          <NumberField label="Massa sensores" unit="g" value={config.electronics.sensorMassG} min={0} max={800} step={5} onChange={(sensorMassG) => update("electronics", { sensorMassG })} />
          <NumberField label="Massa rádio" unit="g" value={config.electronics.radioMassG} min={0} max={800} step={5} onChange={(radioMassG) => update("electronics", { radioMassG })} />
        </> : null}
        <NumberField label="Orçamento potência" unit="W" value={config.electronics.powerBudgetW} min={0.5} max={80} step={0.5} onChange={(powerBudgetW) => update("electronics", { powerBudgetW })} />
        <NumberField label="Telemetria" unit="Hz" value={config.electronics.telemetryRateHz} min={1} max={200} step={1} onChange={(telemetryRateHz) => update("electronics", { telemetryRateHz })} />
      </ParamSection>;
    }
    if (activePart === "simulation") {
      return <div className="inspector-stack">
        <div className="metric-grid single">
          <MetricCard label="Apogeu estimado" value={`${Math.round(simulation.apogeeM)} m`} detail={`${targetDelta >= 0 ? "+" : ""}${Math.round(targetDelta)} m contra alvo`} />
          <MetricCard label="Velocidade máxima" value={`${round(simulation.maxVelocity, 1)} m/s`} detail="integração vertical simplificada" tone="orange" />
          <MetricCard label="Aceleração máxima" value={`${round(simulation.maxAccelerationG, 2)} g`} detail={`T/W ${round(simulation.thrustToWeight, 2)}`} tone="yellow" />
          <MetricCard label="Massa automática" value={`${round(massBreakdown.autoSharePct, 1)}%`} detail={`${round(massBreakdown.initialTotalG, 0)} g iniciais`} tone="orange" />
          <MetricCard label="Descida estimada" value={`${round(simulation.descentRate, 1)} m/s`} detail="com paraquedas principal" />
          <MetricCard label="Tempo de descida" value={`${round(simulation.descentTimeS, 1)} s`} detail="estimativa baseada no apogeu" tone="yellow" />
        </div>
        <Button onClick={recalc} className="primary-cta full-button"><Activity size={16} /> Recalcular simulação</Button>
      </div>;
    }
    if (activePart === "learning") {
      return <div className="learning-list compact-list">
        <article><BadgeCheck size={18} /><p><strong>Massa inicial:</strong> calculada por geometria, materiais, grãos, recuperação, payload e aviônica. Aqui: {round(simulation.initialMassKg, 3)} kg, com {round(massBreakdown.autoSharePct, 1)}% automático.</p></article>
        <article><BadgeCheck size={18} /><p><strong>Relação empuxo/peso:</strong> empuxo médio dividido pelo peso inicial. Aqui: {round(simulation.thrustToWeight, 2)}.</p></article>
        <article><BadgeCheck size={18} /><p><strong>Estabilidade:</strong> distância CP − CG em diâmetros do corpo. Aqui: {round(simulation.stability, 2)} calibres.</p></article>
        <article><BadgeCheck size={18} /><p><strong>Pressão, garganta e expansão:</strong> campos críticos para comparar risco, erosão, fabricação e consistência entre casing, câmara e nozzle.</p></article>
        <article><Zap size={18} /><p><strong>Grãos e inibição:</strong> o MVP documenta geometria, inibição, pack e montagem para revisão educacional, sem substituir balística interna validada.</p></article>
      </div>;
    }
    return <div className="export-stack cad-export">
      <Button onClick={exportProject} className="primary-cta"><Database size={16} /> Baixar JSON paramétrico</Button>
      <Button onClick={exportOpenRocket} variant="outline" className="secondary-cta"><Rocket size={16} /> Exportar para OpenRocket (.ork)</Button>
      <Button onClick={exportRocketPy} variant="outline" className="secondary-cta"><Cpu size={16} /> Exportar para RocketPy (.py)</Button>
      <Button onClick={exportCsv} variant="outline" className="secondary-cta"><Activity size={16} /> Baixar CSV da simulação</Button>
      <Button onClick={exportReport} variant="outline" className="secondary-cta"><ClipboardCheck size={16} /> Baixar relatório Markdown</Button>
      <Button onClick={() => registerSupport("Apoio laboratório · R$ 50")} variant="outline" className="secondary-cta"><HeartHandshake size={16} /> Registrar apoio futuro</Button>
      {supportIntention ? <p className="support-status">{supportIntention}</p> : null}
    </div>;
  };
  const selectedSubsystemInfo = SUBSYSTEMS.find((subsystem) => subsystem.id === selectedSubsystem) ?? SUBSYSTEMS[0];
  const selectedSubsystemNumericId = subsystemNumericId(selectedSubsystem);
  const utils = trpc.useUtils();
  const persistedMissionsQuery = trpc.rocket.missions.useQuery();
  const persistedSubsystemsQuery = trpc.rocket.subsystems.useQuery();
  const persistedMessagesQuery = trpc.rocket.messagesBySubsystem.useQuery({ subsystemId: selectedSubsystemNumericId });
  const persistedNotificationHistoryQuery = trpc.rocket.notificationHistory.useQuery({ limit: 8 });

  const persistedMissions = useMemo<Mission[]>(() => (persistedMissionsQuery.data ?? []).map((mission: any) => {
    const status = String(mission.status ?? 'planejamento') as MissionStatus;
    const progressByStatus: Record<string, number> = { planejamento: 10, desenvolvimento: 45, teste: 70, validacao: 82, competicao: 90, concluido: 100, concluida: 100 };
    const assignedTo = typeof mission.requirement === 'string' && mission.requirement.trim()
      ? mission.requirement.split(',').map((member: string) => member.trim()).filter(Boolean)
      : ['Time Rocket'];
    return {
      id: String(mission.id),
      databaseId: Number(mission.id),
      name: String(mission.name ?? 'Missão Rocket'),
      type: String(mission.category ?? mission.subsystem ?? 'Missão técnica'),
      description: String(mission.description ?? 'Missão registrada no banco de dados do Innovare Rocket.'),
      target: String(mission.objective ?? 'A definir'),
      competition: String(mission.payload ?? 'Contexto interno Rocket'),
      status,
      progress: progressByStatus[status] ?? 0,
      assignedTo: assignedTo.length ? assignedTo : ['Time Rocket'],
    };
  }), [persistedMissionsQuery.data]);

  const visibleMissions = useMemo(() => {
    if (!persistedMissionsQuery.isSuccess || persistedMissions.length === 0) return missions;
    const persistedNames = new Set(persistedMissions.map((mission) => mission.name.toLowerCase()));
    const localOnlyMissions = missions.filter((mission) => !persistedNames.has(mission.name.toLowerCase()) && !mission.databaseId);
    return [...persistedMissions, ...localOnlyMissions];
  }, [missions, persistedMissions, persistedMissionsQuery.isSuccess]);

  const selectedMission = visibleMissions.find((mission) => mission.id === selectedMissionId) ?? visibleMissions[0];

  const currentTasks = useMemo(() => tasks.filter((task) => task.missionId === selectedMission?.id && task.subsystem === selectedSubsystem), [tasks, selectedMission?.id, selectedSubsystem]);
  const currentDeliveries = useMemo(() => deliveries.filter((delivery) => delivery.missionId === selectedMission?.id && delivery.subsystem === selectedSubsystem), [deliveries, selectedMission?.id, selectedSubsystem]);
  const persistedCurrentMessages = useMemo<Message[]>(() => (persistedMessagesQuery.data ?? []).map((message: any) => ({
    id: String(message.id),
    missionId: selectedMission?.id ?? '',
    subsystem: selectedSubsystem,
    author: message.userId ? `Usuário #${message.userId}` : 'Usuário Rocket',
    content: String(message.content ?? ''),
    createdAt: message.createdAt ? new Date(message.createdAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
  })), [persistedMessagesQuery.data, selectedMission?.id, selectedSubsystem]);
  const localCurrentMessages = useMemo(() => messages.filter((message) => message.missionId === selectedMission?.id && message.subsystem === selectedSubsystem), [messages, selectedMission?.id, selectedSubsystem]);
  const currentMessages = persistedMessagesQuery.isSuccess ? persistedCurrentMessages : localCurrentMessages;
  const persistedNotificationHistory = useMemo<RocketNotification[]>(() => (persistedNotificationHistoryQuery.data ?? []).map((notification: any) => ({
    id: String(notification.id),
    title: String(notification.title ?? 'Evento Rocket'),
    description: String(notification.description ?? ''),
    subsystem: String(notification.subsystem ?? 'Rocket'),
    kind: String(notification.kind ?? 'mensagem') as RocketNotification['kind'],
    at: notification.at ? new Date(notification.at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
  })), [persistedNotificationHistoryQuery.data]);
  const visibleNotificationHistory = persistedNotificationHistoryQuery.isSuccess ? persistedNotificationHistory : notificationHistory;
  const subsystemSummaries = useMemo(() => SUBSYSTEMS.map((subsystem) => {
    const subsystemTasks = tasks.filter((task) => task.missionId === selectedMission?.id && task.subsystem === subsystem.id);
    const localSubsystemMessages = messages.filter((message) => message.missionId === selectedMission?.id && message.subsystem === subsystem.id);
    const persistedSubsystemMessages = subsystem.id === selectedSubsystem && persistedMessagesQuery.isSuccess ? persistedCurrentMessages : [];
    const subsystemMessages = persistedSubsystemMessages.length ? persistedSubsystemMessages : localSubsystemMessages;
    const unreadCount = subsystemMessages.filter((message) => !readMessageIds.includes(message.id)).length;
    const checklistItems = subsystemTasks.flatMap((task) => task.checklist);
    const completedItems = checklistItems.filter((item) => item.done).length;
    const computedProgress = checklistItems.length ? Math.round((completedItems / checklistItems.length) * 100) : 0;
    const persistedSubsystem = persistedSubsystemsQuery.data?.find((item: any) => Number(item.id) === subsystemNumericId(subsystem.id));
    const persistedProgress = typeof persistedSubsystem?.progress === 'number' ? persistedSubsystem.progress : undefined;
    const progress = subsystemProgressOverrides[subsystem.id] ?? persistedProgress ?? computedProgress;
    const status = persistedSubsystem?.status ? String(persistedSubsystem.status).replace('_', ' ') : subsystemTasks.some((task) => task.status === 'andamento') ? 'Em andamento' : subsystemTasks.some((task) => task.status === 'pendente') ? 'Pendente' : subsystemTasks.some((task) => task.status === 'concluida') ? 'Concluído' : 'Sem demanda';
    return { subsystemId: subsystem.id, progress, status, unread: unreadCount, lastMessage: subsystemMessages[0]?.content ?? 'Sem mensagens registradas ainda.' };
  }), [messages, persistedCurrentMessages, persistedMessagesQuery.isSuccess, persistedSubsystemsQuery.data, readMessageIds, selectedMission?.id, selectedSubsystem, subsystemProgressOverrides, tasks]);

  useEffect(() => {
    const notificationKey = `${selectedMission?.id ?? 'sem-missao'}:${selectedSubsystem}`;
    const visibleMessageIds = currentMessages.map((message) => message.id);
    if (!knownMessageIdsBySubsystemRef.current[notificationKey]) {
      knownMessageIdsBySubsystemRef.current[notificationKey] = new Set(visibleMessageIds);
      return;
    }
    const knownMessageIds = knownMessageIdsBySubsystemRef.current[notificationKey];
    const newMessages = currentMessages.filter((message) => !knownMessageIds.has(message.id));
    if (newMessages.length) {
      newMessages.forEach((message) => knownMessageIds.add(message.id));
      const latestMessage = newMessages[0];
      toast.info(`Nova mensagem em ${selectedSubsystemInfo.name}: ${latestMessage.content.slice(0, 90)}`);
      setNotificationHistory((current) => {
        const notification: RocketNotification = { id: `notif-${latestMessage.id}-${Date.now()}`, title: 'Nova mensagem do subsistema', description: latestMessage.content.slice(0, 120), subsystem: selectedSubsystemInfo.name, kind: 'mensagem', at: new Date().toLocaleString('pt-BR') };
        return [notification, ...current].slice(0, 8);
      });
    }
  }, [currentMessages, selectedMission?.id, selectedSubsystem, selectedSubsystemInfo.name]);

  useEffect(() => {
    const visibleMessageIds = currentMessages.map((message) => message.id);
    if (!visibleMessageIds.length) return;
    setReadMessageIds((current) => {
      const next = Array.from(new Set([...current, ...visibleMessageIds]));
      return next.length === current.length ? current : next;
    });
  }, [currentMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentMessages.length, selectedSubsystem, selectedMission?.id]);

  const currentTimelineStep = LASC_TIMELINE.find((step) => step.status === 'atual');
  const deliveryStats = {
    enviados: deliveries.filter((delivery) => delivery.status === 'enviado').length,
    aprovados: deliveries.filter((delivery) => delivery.status === 'aprovado').length,
    ajustes: deliveries.filter((delivery) => delivery.status === 'ajustes' || delivery.status === 'reprovado').length,
  };
  const currentTimelineIndex = LASC_TIMELINE.findIndex((step) => step.status === 'atual');
  const timelineProgress = Math.round(((currentTimelineIndex + 1) / LASC_TIMELINE.length) * 100);
  const nextTimelineStep = LASC_TIMELINE.find((step, index) => index > currentTimelineIndex && step.status === 'proximo');
  const completedTimelineSteps = LASC_TIMELINE.filter((step) => step.status === 'concluido').length;
  const reviewDeliveryMutation = trpc.rocket.reviewDelivery.useMutation();
  const updateRocketSubsystemProgressMutation = trpc.rocket.updateSubsystemProgress.useMutation();
  const createRocketTaskMutation = trpc.rocket.createTask.useMutation();
  const createRocketMissionMutation = trpc.rocket.createMission.useMutation();
  const updateRocketMissionMutation = trpc.rocket.updateMission.useMutation();
  const createRocketDeliveryMutation = trpc.rocket.createDelivery.useMutation();
  const updateRocketTaskStatusMutation = trpc.rocket.updateTaskStatus.useMutation();
  const createRocketMessageMutation = trpc.rocket.createMessage.useMutation();

  const addNotification = (event: Omit<RocketNotification, 'id' | 'at'>) => {
    setNotificationHistory((current) => [{ id: `notif-${Date.now()}`, at: new Date().toLocaleString('pt-BR'), ...event }, ...current].slice(0, 8));
  };

  const toggleMember = (member: string, form: 'mission' | 'task') => {
    if (form === 'mission') {
      setMissionForm((current) => ({ ...current, assignedTo: current.assignedTo.includes(member) ? current.assignedTo.filter((item) => item !== member) : [...current.assignedTo, member] }));
    } else {
      setTaskForm((current) => ({ ...current, assignedTo: current.assignedTo.includes(member) ? current.assignedTo.filter((item) => item !== member) : [...current.assignedTo, member] }));
    }
  };

  const resetMissionForm = () => {
    setMissionForm({ name: '', type: '', description: '', target: '', competition: '', assignedTo: [] });
    setEditingMissionId(null);
    setShowMissionForm(false);
  };

  const openCreateMissionForm = () => {
    if (!canCreateRocketTasks) {
      toast.error('Somente a Innovare Team pode criar missões Rocket.');
      return;
    }
    setEditingMissionId(null);
    setMissionForm({ name: '', type: '', description: '', target: '', competition: '', assignedTo: [] });
    setShowMissionForm(true);
  };

  const openEditMissionForm = (mission: Mission) => {
    if (!canCreateRocketTasks) {
      toast.error('Somente a Innovare Team pode editar missões Rocket.');
      return;
    }
    setEditingMissionId(mission.id);
    setMissionForm({ name: mission.name, type: mission.type, description: mission.description, target: mission.target, competition: mission.competition ?? '', assignedTo: mission.assignedTo });
    setShowMissionForm(true);
  };

  const handleSaveMission = async () => {
    if (!canCreateRocketTasks) {
      toast.error('Somente a Innovare Team pode criar ou editar missões Rocket.');
      return;
    }

    if (!missionForm.name.trim() || !missionForm.type.trim() || !missionForm.description.trim()) {
      toast.error('Preencha nome, tipo e descrição da missão.');
      return;
    }

    const assignedTo = missionForm.assignedTo.length ? missionForm.assignedTo : [activeUserName];
    const missionPayload = {
      name: missionForm.name.trim(),
      category: missionForm.type.trim(),
      description: missionForm.description.trim(),
      objective: missionForm.target.trim() || 'A definir',
      payload: missionForm.competition.trim() || 'A definir',
      requirement: assignedTo.join(', '),
      status: 'planejamento' as const,
    };

    try {
      if (editingMissionId) {
        const missionToEdit = visibleMissions.find((mission) => mission.id === editingMissionId);
        if (missionToEdit?.databaseId) {
          const result = await updateRocketMissionMutation.mutateAsync({ id: missionToEdit.databaseId, ...missionPayload });
          const updatedId = Number((result as any).data?.id ?? missionToEdit.databaseId);
          const updatedMission: Mission = {
            id: String(updatedId),
            databaseId: updatedId,
            name: missionPayload.name,
            type: missionPayload.category,
            description: missionPayload.description,
            target: missionPayload.objective,
            competition: missionPayload.payload,
            status: missionPayload.status,
            progress: missionToEdit.progress,
            assignedTo,
          };
          setMissions((current) => current.map((mission) => mission.id === editingMissionId ? updatedMission : mission));
          setSelectedMissionId(updatedMission.id);
          await utils.rocket.missions.invalidate();
          toast.success('Missão Rocket editada com persistência.');
        } else {
          setMissions((current) => current.map((mission) => mission.id === editingMissionId ? { ...mission, name: missionPayload.name, type: missionPayload.category, description: missionPayload.description, target: missionPayload.objective, competition: missionPayload.payload, assignedTo } : mission));
          toast.success('Missão demonstrativa editada localmente.');
        }
      } else {
        const result = await createRocketMissionMutation.mutateAsync(missionPayload);
        const persistedId = Number((result as any).data?.id ?? Date.now());
        const mission: Mission = {
          id: String(persistedId),
          databaseId: persistedId,
          name: missionPayload.name,
          type: missionPayload.category,
          description: missionPayload.description,
          target: missionPayload.objective,
          competition: missionPayload.payload,
          status: 'planejamento',
          progress: 10,
          assignedTo,
        };
        setMissions((current) => [mission, ...current]);
        setSelectedMissionId(mission.id);
        await utils.rocket.missions.invalidate();
        toast.success('Missão Rocket criada com persistência.');
      }
      resetMissionForm();
    } catch (error) {
      toast.error(editingMissionId ? 'Não foi possível persistir a edição da missão Rocket.' : 'Não foi possível persistir a nova missão Rocket.');
    }
  };

  const createTask = async () => {
    if (!canCreateRocketTasks) {
      toast.error('Somente a Innovare Team pode criar demandas/instruções para o Rocket.');
      return;
    }

    if (!selectedMission || !taskForm.title.trim() || !taskForm.description.trim() || !taskForm.dueDate || taskForm.assignedTo.length === 0) {
      const validationMessage = 'Preencha título, descrição, responsável e prazo da demanda.';
      setTaskFormError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setTaskFormError('');

    const checklist = taskForm.checklistText
      .split('\n')
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text, index) => ({ id: `ck-${Date.now()}-${index}`, text, done: false }));

    try {
      const result = await createRocketTaskMutation.mutateAsync({
        subsystemId: subsystemNumericId(selectedSubsystem),
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        dueDate: new Date(taskForm.dueDate),
      });
      const persistedId = getInsertId((result as any).data) ?? `task-${Date.now()}`;
      const task: RocketTask = {
        id: persistedId,
        missionId: selectedMission.id,
        subsystem: selectedSubsystem,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        assignedTo: taskForm.assignedTo,
        status: 'pendente',
        checklist: checklist.length ? checklist : [{ id: `ck-${Date.now()}`, text: 'Confirmar entendimento da demanda', done: false }],
        statusHistory: [{ status: 'pendente', author: activeUserName, at: new Date().toLocaleString('pt-BR'), note: 'Demanda criada pela Innovare Team.' }],
      };
      setTasks((current) => [task, ...current]);
      setTaskForm({ title: '', description: '', priority: 'media', dueDate: '', assignedTo: [], checklistText: '' });
      setTaskFormError('');
      setShowTaskForm(false);
      addNotification({ title: 'Demanda criada', description: task.title, subsystem: selectedSubsystemInfo.name, kind: 'demanda' });
      toast.success('Demanda criada e persistida para o subsistema.');
    } catch (error) {
      setTaskFormError('Não foi possível persistir a demanda Rocket. Verifique o banco e tente novamente.');
      toast.error('Não foi possível persistir a demanda Rocket. Verifique o banco e tente novamente.');
    }
  };

  const updateSubsystemProgress = async () => {
    if (!canCreateRocketTasks) {
      toast.error('Somente a Innovare Team pode atualizar progresso técnico por subsistema.');
      return;
    }

    const parsedProgress = Number(progressForm.progress);
    if (!selectedMission || !Number.isFinite(parsedProgress) || parsedProgress < 0 || parsedProgress > 100 || !progressForm.note.trim()) {
      const validationMessage = 'Informe um progresso entre 0 e 100 e registre uma justificativa técnica.';
      setProgressFormError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setProgressFormError('');
    const roundedProgress = Math.round(parsedProgress);
    const persistedStatus = roundedProgress >= 100 ? 'concluido' : roundedProgress >= 75 ? 'validacao' : roundedProgress >= 40 ? 'teste' : roundedProgress > 0 ? 'desenvolvimento' : 'planejamento';
    const progressNote = `Atualização de progresso do subsistema ${selectedSubsystemInfo.name}: ${roundedProgress}% — ${progressForm.note.trim()}`;

    try {
      await updateRocketSubsystemProgressMutation.mutateAsync({ subsystemId: selectedSubsystemNumericId, progress: roundedProgress, status: persistedStatus });
      await createRocketMessageMutation.mutateAsync({ subsystemId: selectedSubsystemNumericId, content: progressNote, messageType: 'status' });
      await utils.rocket.subsystems.invalidate();
      await utils.rocket.notificationHistory.invalidate({ limit: 8 });
      await utils.rocket.messagesBySubsystem.invalidate({ subsystemId: selectedSubsystemNumericId });
      const nextOverrides = { ...subsystemProgressOverrides, [selectedSubsystem]: roundedProgress };
      setSubsystemProgressOverrides(nextOverrides);
      setMissions((current) => current.map((mission) => {
        if (mission.id !== selectedMission.id) return mission;
        const subsystemAverage = Math.round(SUBSYSTEMS.reduce((sum, subsystem) => {
          const subsystemTasks = tasks.filter((task) => task.missionId === selectedMission.id && task.subsystem === subsystem.id);
          const checklistItems = subsystemTasks.flatMap((task) => task.checklist);
          const completedItems = checklistItems.filter((item) => item.done).length;
          const computedProgress = checklistItems.length ? Math.round((completedItems / checklistItems.length) * 100) : 0;
          return sum + (nextOverrides[subsystem.id] ?? computedProgress);
        }, 0) / SUBSYSTEMS.length);
        return { ...mission, progress: subsystemAverage };
      }));
      setMessages((current) => [{ id: `msg-${Date.now()}`, missionId: selectedMission.id, subsystem: selectedSubsystem, author: activeUserName, content: progressNote, createdAt: new Date().toLocaleString('pt-BR') }, ...current]);
      setProgressForm({ progress: '', note: '' });
      addNotification({ title: 'Progresso atualizado', description: progressNote, subsystem: selectedSubsystemInfo.name, kind: 'progresso' });
      toast.success('Progresso do subsistema atualizado, persistido e registrado no histórico.');
    } catch (error) {
      setProgressFormError('Não foi possível persistir o progresso do subsistema agora.');
      toast.error('Não foi possível persistir o progresso do subsistema agora.');
    }
  };

  const createDelivery = async () => {
    if (!selectedMission || !deliveryForm.title || !deliveryForm.submittedBy) {
      toast.error('Preencha título e responsável pela entrega.');
      return;
    }

    try {
      const result = await createRocketDeliveryMutation.mutateAsync({
        subsystemId: subsystemNumericId(selectedSubsystem),
        title: deliveryForm.title,
        submittedBy: deliveryForm.submittedBy,
        notes: deliveryForm.notes,
      });
      const persistedId = getInsertId((result as any).data) ?? `del-${Date.now()}`;
      const delivery: Delivery = {
        id: persistedId,
        missionId: selectedMission.id,
        subsystem: selectedSubsystem,
        title: deliveryForm.title,
        submittedBy: deliveryForm.submittedBy,
        submittedAt: new Date().toISOString().slice(0, 10),
        status: 'enviado',
        notes: deliveryForm.notes,
      };
      setDeliveries((current) => [delivery, ...current]);
      setDeliveryForm({ title: '', submittedBy: '', notes: '' });
      setShowDeliveryForm(false);
      addNotification({ title: 'Entrega registrada', description: delivery.title, subsystem: selectedSubsystemInfo.name, kind: 'entrega' });
      toast.success('Entrega registrada e persistida para revisão.');
    } catch (error) {
      toast.error('Não foi possível persistir a entrega Rocket. Verifique o banco e tente novamente.');
    }
  };

  const toggleChecklist = async (taskId: string | number, checklistId: string) => {
    const taskBeforeChange = tasks.find((task) => task.id === taskId);
    let nextTaskStatus: RocketTask['status'] = 'andamento';
    let persistedStatus: 'em_progresso' | 'concluida' = 'em_progresso';
    setTasks((current) => current.map((task) => {
      if (task.id !== taskId) return task;
      const nextChecklist = task.checklist.map((item) => item.id === checklistId ? { ...item, done: !item.done } : item);
      const completed = nextChecklist.every((item) => item.done);
      nextTaskStatus = completed ? 'concluida' : 'andamento';
      persistedStatus = completed ? 'concluida' : 'em_progresso';
      const statusChanged = task.status !== nextTaskStatus;
      return {
        ...task,
        checklist: nextChecklist,
        status: nextTaskStatus,
        statusHistory: statusChanged ? [
          { status: nextTaskStatus, author: activeUserName, at: new Date().toLocaleString('pt-BR'), note: completed ? 'Checklist concluído pelo time responsável.' : 'Checklist atualizado e demanda em progresso.' },
          ...task.statusHistory,
        ] : task.statusHistory,
      };
    }));

    if (typeof taskId === 'number') {
      try {
        await updateRocketTaskStatusMutation.mutateAsync({ taskId, status: persistedStatus });
      } catch (error) {
        if (taskBeforeChange) setTasks((current) => current.map((task) => task.id === taskId ? taskBeforeChange : task));
        toast.error('Não foi possível persistir o status da checklist Rocket.');
      }
    }
  };

  const markTaskOk = async (taskId: string | number) => {
    const previousTasks = tasks;
    setTasks((current) => current.map((task) => task.id === taskId ? {
      ...task,
      status: 'concluida',
      checklist: task.checklist.map((item) => ({ ...item, done: true })),
      statusHistory: [
        { status: 'concluida', author: activeUserName, at: new Date().toLocaleString('pt-BR'), note: 'Time confirmou conclusão pelo botão Marcar como OK.' },
        ...task.statusHistory,
      ],
    } : task));

    if (typeof taskId === 'number') {
      try {
        await updateRocketTaskStatusMutation.mutateAsync({ taskId, status: 'concluida' });
      } catch (error) {
        setTasks(previousTasks);
        toast.error('Não foi possível persistir a conclusão da demanda Rocket.');
        return;
      }
    }

    toast.success('Demanda marcada como concluída pelo time.');
  };

  const reviewDelivery = async (deliveryId: string | number, status: 'aprovado' | 'reprovado' | 'ajustes') => {
    const reviewComment = status === 'aprovado' ? 'Entrega aprovada. Pode seguir para a próxima etapa.' : status === 'reprovado' ? 'Entrega reprovada. Refaça conforme critérios técnicos.' : 'Entrega requer ajustes antes da aprovação.';
    const reviewedAt = new Date().toLocaleString('pt-BR');
    const previousDeliveries = deliveries;
    setDeliveries((current) => current.map((delivery) => delivery.id === deliveryId ? { ...delivery, status, reviewer: activeUserName, reviewComment, reviewedAt } : delivery));

    if (typeof deliveryId === 'number') {
      try {
        await reviewDeliveryMutation.mutateAsync({ deliveryId, status });
      } catch (error) {
        setDeliveries(previousDeliveries);
        toast.error('Não foi possível persistir a revisão da entrega Rocket.');
        return;
      }
    }

    addNotification({ title: status === 'aprovado' ? 'Entrega aprovada' : status === 'reprovado' ? 'Entrega reprovada' : 'Ajustes solicitados', description: reviewComment, subsystem: selectedSubsystemInfo.name, kind: 'revisao' });
    toast.success(status === 'aprovado' ? 'Entrega aprovada.' : status === 'reprovado' ? 'Entrega reprovada.' : 'Ajustes solicitados.');
  };

  const sendMessage = async () => {
    if (!selectedMission || !messageText.trim()) return;
    const content = messageText.trim();
    try {
      const result = await createRocketMessageMutation.mutateAsync({
        subsystemId: subsystemNumericId(selectedSubsystem),
        content,
        messageType: 'comentario',
      });
      const persistedId = getInsertId((result as any).data) ?? `msg-${Date.now()}`;
      setMessages((current) => [{ id: String(persistedId), missionId: selectedMission.id, subsystem: selectedSubsystem, author: activeUserName, content, createdAt: new Date().toLocaleString('pt-BR') }, ...current]);
      setMessageText('');
      await utils.rocket.messagesBySubsystem.invalidate({ subsystemId: subsystemNumericId(selectedSubsystem) });
      await utils.rocket.notificationHistory.invalidate({ limit: 8 });
      addNotification({ title: 'Mensagem enviada', description: content, subsystem: selectedSubsystemInfo.name, kind: 'mensagem' });
      toast.success('Mensagem persistida para o subsistema.');
    } catch (error) {
      toast.error('Não foi possível persistir a mensagem Rocket.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-orange-300/80">Missões, subsistemas e entregas</p>
            <h1 className="mt-2 text-4xl font-bold text-gradient">Innovare Rocket</h1>
            <p className="mt-2 max-w-4xl text-slate-400">Painel operacional para missões, competição LASC, demandas por subsistema, checklists e aprovação ou reprovação de entregas dos membros.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setActiveTab('gestao')}
                className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-md transition-all ${
                  activeTab === 'gestao'
                    ? 'bg-orange-500 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gestão de Missão
              </button>
              <button
                onClick={() => setActiveTab('cad')}
                className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-md transition-all ${
                  activeTab === 'cad'
                    ? 'bg-cyan-500 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dimensionamento CAD
              </button>
            </div>
            {activeTab === 'gestao' ? (
              canCreateRocketTasks ? <Button onClick={openCreateMissionForm} className="btn-cinema"><Plus className="mr-2 h-5 w-5" /> Nova Missão</Button> : <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-100">Missões são criadas pela Innovare Team</span>
            ) : null}
          </div>
        </div>

        {activeTab === 'gestao' ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="border-cyan-500/20 bg-cyan-500/10 p-4"><p className="text-sm text-slate-400">Missões ativas</p><p className="mt-2 text-3xl font-bold text-white">{visibleMissions.length}</p></Card>
              <Card className="border-orange-500/20 bg-orange-500/10 p-4"><p className="text-sm text-slate-400">Etapa atual LASC</p><p className="mt-2 text-lg font-bold text-white">{currentTimelineStep?.title}</p></Card>
              <Card className="border-emerald-500/20 bg-emerald-500/10 p-4"><p className="text-sm text-slate-400">Entregas aprovadas</p><p className="mt-2 text-3xl font-bold text-white">{deliveryStats.aprovados}</p></Card>
              <Card className="border-red-500/20 bg-red-500/10 p-4"><p className="text-sm text-slate-400">Aguardando revisão/ajustes</p><p className="mt-2 text-3xl font-bold text-white">{deliveryStats.enviados + deliveryStats.ajustes}</p></Card>
            </div>

            <Card className="border-cyan-500/20 bg-slate-950/70 p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Histórico de notificações</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Últimos eventos do Rocket</h2>
                  <p className="mt-1 text-sm text-slate-400">Carregado do histórico persistido de mensagens, demandas, entregas e progresso.</p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">{visibleNotificationHistory.length} registro(s)</span>
              </div>
              {persistedNotificationHistoryQuery.isLoading && <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Carregando histórico de notificações Rocket...</p>}
              {persistedNotificationHistoryQuery.isError && <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">Não foi possível carregar o histórico persistido agora. Os eventos locais desta sessão continuam disponíveis.</p>}
              {!persistedNotificationHistoryQuery.isLoading && !visibleNotificationHistory.length && <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Nenhuma notificação Rocket registrada ainda.</p>}
              {!!visibleNotificationHistory.length && (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {visibleNotificationHistory.map((notification) => (
                    <div key={notification.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">{notification.title}</p>
                          <p className="mt-1 text-xs text-cyan-200">{notification.subsystem} · {notification.kind}</p>
                        </div>
                        <span className="text-[11px] text-slate-500">{notification.at}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{notification.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {showMissionForm && (
              <Card className="border border-orange-500/30 bg-white/5 p-6 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-white">{editingMissionId ? 'Editar missão' : 'Criar nova missão'}</h2><button onClick={resetMissionForm} className="text-slate-400 hover:text-white"><XCircle className="h-5 w-5" /></button></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input value={missionForm.name} onChange={(e) => setMissionForm({ ...missionForm, name: e.target.value })} className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Nome: MG-NOVA-MISSÃO" />
                  <input value={missionForm.type} onChange={(e) => setMissionForm({ ...missionForm, type: e.target.value })} className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Tipo: foguete, CubeSat, competição" />
                  <input value={missionForm.target} onChange={(e) => setMissionForm({ ...missionForm, target: e.target.value })} className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Meta: 1 km, 3 km, 2U, etc." />
                  <input value={missionForm.competition} onChange={(e) => setMissionForm({ ...missionForm, competition: e.target.value })} className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Competição ou contexto" />
                  <textarea value={missionForm.description} onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })} className="min-h-24 rounded border border-white/20 bg-white/10 px-3 py-2 text-white md:col-span-2" placeholder="Descrição técnica da missão" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                  {TEAM_MEMBERS.map((member) => <label key={member} className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"><input type="checkbox" checked={missionForm.assignedTo.includes(member)} onChange={() => toggleMember(member, 'mission')} /> {member}</label>)}
                </div>
                <Button onClick={handleSaveMission} disabled={createRocketMissionMutation.isPending || updateRocketMissionMutation.isPending} className="btn-cinema mt-4 w-full">{createRocketMissionMutation.isPending || updateRocketMissionMutation.isPending ? 'Salvando missão...' : editingMissionId ? 'Salvar alterações' : 'Criar missão'}</Button>
              </Card>
            )}

            <Card className="border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-orange-300" /><h2 className="text-xl font-bold text-white">Timeline LASC 2026 — onde estamos agora</h2></div>
                <div className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-100">Estamos em <strong>{currentTimelineStep?.title}</strong>; próximo marco: <strong>{nextTimelineStep?.title}</strong>.</div>
              </div>
              <div className="mb-5 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>{completedTimelineSteps} etapa concluída · etapa atual {currentTimelineIndex + 1} de {LASC_TIMELINE.length}</span><span className="font-bold text-orange-200">{timelineProgress}% do caminho macro</span></div>
                <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-orange-400 to-cyan-400" style={{ width: `${timelineProgress}%` }} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-6">
                {LASC_TIMELINE.map((step, index) => (
                  <div key={step.id} className={`relative rounded-xl border p-4 ${step.status === 'concluido' ? 'border-emerald-500/40 bg-emerald-500/10' : step.status === 'atual' ? 'border-orange-400 bg-orange-500/15 shadow-[0_0_24px_rgba(249,115,22,0.18)]' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</span>{step.status === 'atual' && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">AGORA</span>}{step.status === 'concluido' && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}</div>
                    <p className="mt-2 text-sm font-bold text-white">{step.title}</p>
                    <p className="mt-1 text-xs text-orange-200">{formatDate(step.date)}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {visibleMissions.map((mission) => (
                <Card key={mission.id} onClick={() => setSelectedMissionId(mission.id)} className={`cursor-pointer border p-4 transition-all ${selectedMission?.id === mission.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-slate-950/70 hover:border-orange-400/60'}`}>
                  <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-white">{mission.name}</h3><p className="text-sm text-slate-400">{mission.type} · {mission.target}</p></div><div className="flex items-center gap-2">{canCreateRocketTasks && <button aria-label={`Editar missão ${mission.name}`} onClick={(event) => { event.stopPropagation(); openEditMissionForm(mission); }} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200"><Pencil className="h-4 w-4" /></button>}<RocketIcon className="h-6 w-6 text-orange-300" /></div></div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{mission.description}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400" style={{ width: `${mission.progress}%` }} /></div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>{mission.competition}</span><span className="font-bold text-cyan-300">{mission.progress}%</span></div>
                  <p className="mt-2 text-xs text-slate-500">Equipe: {mission.assignedTo.join(', ')}</p>
                </Card>
              ))}
            </div>

            {selectedMission && (
              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[300px_1fr]">
                <Card className="h-fit border-white/10 bg-slate-950/70 p-4">
                  <h2 className="mb-3 text-lg font-bold text-white">Subsistemas</h2>
                  <div className="space-y-2">
                    {SUBSYSTEMS.map((subsystem) => {
                      const summary = subsystemSummaries.find((item) => item.subsystemId === subsystem.id);
                      return (
                        <button key={subsystem.id} onClick={() => setSelectedSubsystem(subsystem.id)} className={`w-full rounded-lg border p-3 text-left transition-all ${selectedSubsystem === subsystem.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-orange-400/60'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-white">{subsystem.name}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-400">{subsystem.description}</p>
                            </div>
                            {(summary?.unread ?? 0) > 0 && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">{summary?.unread}</span>}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400"><span>{summary?.status}</span><span className="font-bold text-cyan-300">{summary?.progress ?? 0}%</span></div>
                          <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400" style={{ width: `${summary?.progress ?? 0}%` }} /></div>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">Último recado: {summary?.lastMessage}</p>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="border-cyan-500/20 bg-slate-950/80 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div><p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{selectedMission.name}</p><h2 className="mt-2 text-2xl font-bold text-white">{selectedSubsystemInfo.name}</h2><p className="mt-2 text-sm text-slate-400">{selectedSubsystemInfo.description}</p></div>
                      <div className="flex flex-wrap gap-2">{canCreateRocketTasks ? <Button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="mr-2 h-4 w-4" /> Demanda</Button> : <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200">Demandas são criadas pela Innovare Team</span>}<Button onClick={() => setShowDeliveryForm(!showDeliveryForm)} className="bg-orange-600 hover:bg-orange-700"><Send className="mr-2 h-4 w-4" /> Entrega</Button></div>
                    </div>
                  </Card>

                  {canCreateRocketTasks && (
                    <Card className="border-emerald-500/20 bg-emerald-500/10 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-300" /><h3 className="text-lg font-bold text-white">Atualizar progresso por subsistema</h3></div>
                          <p className="mt-2 text-sm text-emerald-100/80">Registre um percentual técnico para o subsistema selecionado e uma justificativa. O percentual é persistido no cadastro do subsistema e o histórico também é salvo como mensagem de status.</p>
                        </div>
                        <div className="rounded-full border border-emerald-400/30 bg-black/20 px-4 py-2 text-sm font-bold text-emerald-100">Progresso atual: {subsystemSummaries.find((item) => item.subsystemId === selectedSubsystem)?.progress ?? 0}%</div>
                      </div>
                      {progressFormError && <p role="alert" className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{progressFormError}</p>}
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
                        <label className="space-y-2 text-sm font-semibold text-emerald-100">
                          <span>Progresso técnico (%) *</span>
                          <input aria-label="Progresso técnico do subsistema" type="number" min="0" max="100" value={progressForm.progress} onChange={(e) => setProgressForm({ ...progressForm, progress: e.target.value })} className="w-full rounded border border-emerald-400/30 bg-slate-950 px-3 py-2 text-white" placeholder="0 a 100" />
                        </label>
                        <label className="space-y-2 text-sm font-semibold text-emerald-100">
                          <span>Justificativa técnica *</span>
                          <input aria-label="Justificativa técnica do progresso" value={progressForm.note} onChange={(e) => setProgressForm({ ...progressForm, note: e.target.value })} className="w-full rounded border border-emerald-400/30 bg-slate-950 px-3 py-2 text-white" placeholder="Ex.: bancada validada, simulação concluída, pendência de integração" />
                        </label>
                      </div>
                      <Button onClick={updateSubsystemProgress} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"><Target className="mr-2 h-4 w-4" /> Registrar progresso do subsistema</Button>
                    </Card>
                  )}

                  {showTaskForm && canCreateRocketTasks && (
                    <Card className="border-cyan-500/20 bg-white/5 p-5">
                      <h3 className="mb-2 text-lg font-bold text-white">Nova demanda / atividade</h3>
                      <p className="mb-4 text-sm text-slate-400">Campos obrigatórios: título, descrição, responsável e prazo. A demanda só entra na lista após confirmação de persistência no banco.</p>
                      {taskFormError && <p role="alert" className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{taskFormError}</p>}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm font-semibold text-slate-200">
                          <span>Título da atividade *</span>
                          <input aria-label="Título da atividade" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Título da atividade" />
                        </label>
                        <label className="space-y-2 text-sm font-semibold text-slate-200">
                          <span>Prioridade</span>
                          <select aria-label="Prioridade da demanda" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white"><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option></select>
                        </label>
                        <label className="space-y-2 text-sm font-semibold text-slate-200">
                          <span>Prazo da demanda *</span>
                          <input aria-label="Prazo da demanda" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white" />
                        </label>
                        <div className="rounded border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs leading-relaxed text-cyan-100">Responsáveis podem ser selecionados abaixo. Ao menos um membro precisa ser atribuído antes da persistência.</div>
                        <label className="space-y-2 text-sm font-semibold text-slate-200 md:col-span-2">
                          <span>Descrição da demanda *</span>
                          <textarea aria-label="Descreva o que precisa ser feito" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="min-h-20 w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Descreva o que precisa ser feito" />
                        </label>
                        <label className="space-y-2 text-sm font-semibold text-slate-200 md:col-span-2">
                          <span>Checklist técnico</span>
                          <textarea aria-label="Checklist: um item por linha" value={taskForm.checklistText} onChange={(e) => setTaskForm({ ...taskForm, checklistText: e.target.value })} className="min-h-24 w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Checklist: um item por linha" />
                        </label>
                      </div>
                      <fieldset className="mt-4">
                        <legend className="mb-2 text-sm font-semibold text-slate-200">Responsável pela demanda *</legend>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{TEAM_MEMBERS.map((member) => <label key={member} className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"><input aria-label={`Responsável ${member}`} type="checkbox" checked={taskForm.assignedTo.includes(member)} onChange={() => toggleMember(member, 'task')} /> {member}</label>)}</div>
                      </fieldset>
                      <Button onClick={createTask} className="btn-cinema mt-4 w-full">Criar demanda</Button>
                    </Card>
                  )}

                  {showDeliveryForm && (
                    <Card className="border-orange-500/20 bg-white/5 p-5">
                      <h3 className="mb-4 text-lg font-bold text-white">Registrar entrega para aprovação</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input value={deliveryForm.title} onChange={(e) => setDeliveryForm({ ...deliveryForm, title: e.target.value })} className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Título da entrega" />
                        <select value={deliveryForm.submittedBy} onChange={(e) => setDeliveryForm({ ...deliveryForm, submittedBy: e.target.value })} className="rounded border border-white/20 bg-slate-950 px-3 py-2 text-white"><option value="">Quem enviou?</option>{TEAM_MEMBERS.map((member) => <option key={member} value={member}>{member}</option>)}</select>
                        <textarea value={deliveryForm.notes} onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })} className="min-h-24 rounded border border-white/20 bg-white/10 px-3 py-2 text-white md:col-span-2" placeholder="Notas, link de arquivo, evidências, observações técnicas" />
                      </div>
                      <Button onClick={createDelivery} className="btn-cinema mt-4 w-full">Enviar entrega para revisão</Button>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Card className="border-white/10 bg-black/20 p-5">
                      <div className="mb-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-cyan-300" /><h3 className="text-lg font-bold text-white">Demandas e checklists</h3></div>
                      <div className="space-y-3">
                        {currentTasks.length === 0 ? <p className="text-sm text-slate-500">Nenhuma demanda neste subsistema.</p> : currentTasks.map((task) => {
                          const completion = Math.round((task.checklist.filter((item) => item.done).length / Math.max(task.checklist.length, 1)) * 100);
                          return <div key={task.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{task.title}</p><p className="mt-1 text-sm text-slate-400">{task.description}</p></div><div className="flex flex-col items-end gap-2"><span className={`rounded border px-2 py-1 text-xs font-bold capitalize ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span><span className={`rounded border px-2 py-1 text-xs font-bold ${TASK_STATUS_STYLE[task.status]}`}>{TASK_STATUS_LABEL[task.status]}</span></div></div><div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400"><span className="flex items-center gap-1"><UserRound className="h-3 w-3" /> Responsáveis: {task.assignedTo.join(', ')}</span><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(task.dueDate)}</span><span className="flex items-center gap-1"><Target className="h-3 w-3" /> {completion}%</span></div><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${completion}%` }} /></div><div className="mt-3 space-y-2">{task.checklist.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded bg-white/5 px-3 py-2 text-sm text-slate-300"><input type="checkbox" checked={item.done} onChange={() => toggleChecklist(task.id, item.id)} /> <span className={item.done ? 'line-through opacity-60' : ''}>{item.text}</span></label>)}</div><Button onClick={() => markTaskOk(task.id)} disabled={task.status === 'concluida'} className="mt-3 w-full bg-emerald-600 text-xs hover:bg-emerald-700 disabled:opacity-60"><CheckCircle2 className="mr-2 h-4 w-4" /> Marcar como OK</Button><div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Histórico de mudanças de status</p><div className="mt-2 space-y-2">{task.statusHistory.map((entry, index) => <div key={`${task.id}-history-${index}`} className="text-xs text-slate-400"><span className="font-semibold text-cyan-200">{TASK_STATUS_LABEL[entry.status]}</span> por {entry.author} em {entry.at}: {entry.note}</div>)}</div></div></div>;
                        })}
                      </div>
                    </Card>

                    <Card className="border-white/10 bg-black/20 p-5">
                      <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-orange-300" /><h3 className="text-lg font-bold text-white">Entregas e aprovação</h3></div>
                      <div className="space-y-3">
                        {currentDeliveries.length === 0 ? <p className="text-sm text-slate-500">Nenhuma entrega registrada neste subsistema.</p> : currentDeliveries.map((delivery) => <div key={delivery.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{delivery.title}</p><p className="mt-1 text-sm text-slate-400">{delivery.notes}</p></div><span className={`rounded border px-2 py-1 text-xs font-bold capitalize ${DELIVERY_STYLE[delivery.status]}`}>{delivery.status}</span></div><p className="mt-2 text-xs text-slate-500">Enviado por {delivery.submittedBy} em {formatDate(delivery.submittedAt)}</p>{delivery.reviewComment && <p className="mt-2 rounded bg-white/5 px-3 py-2 text-sm text-slate-300">Revisão: {delivery.reviewComment}</p>}<p className="mt-2 text-xs text-slate-500">{delivery.reviewer ? `Revisado por ${delivery.reviewer}${delivery.reviewedAt ? ` em ${delivery.reviewedAt}` : ''}` : 'Aguardando aprovação técnica da coordenação.'}</p><div className="mt-3 grid grid-cols-3 gap-2"><Button onClick={() => reviewDelivery(delivery.id, 'aprovado')} className="bg-emerald-600 text-xs hover:bg-emerald-700"><ThumbsUp className="mr-1 h-3 w-3" /> Aprovar</Button><Button onClick={() => reviewDelivery(delivery.id, 'ajustes')} className="bg-orange-600 text-xs hover:bg-orange-700">Ajustes</Button><Button onClick={() => reviewDelivery(delivery.id, 'reprovado')} className="bg-red-600 text-xs hover:bg-red-700"><ThumbsDown className="mr-1 h-3 w-3" /> Reprovar</Button></div></div>)}
                      </div>
                    </Card>
                  </div>

                  <Card className="border-white/10 bg-black/20 p-5">
                    <div className="mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-cyan-300" /><h3 className="text-lg font-bold text-white">Comunicação do subsistema</h3></div>
                    <div className="mb-4 flex gap-2"><input value={messageText} onChange={(e) => setMessageText(e.target.value)} className="flex-1 rounded border border-white/20 bg-white/10 px-3 py-2 text-white" placeholder="Escreva orientação, dúvida, decisão ou instrução para o time" /><Button onClick={sendMessage} className="bg-cyan-600 hover:bg-cyan-700"><Send className="h-4 w-4" /></Button></div>
                    <div className="space-y-3">
                      {persistedMessagesQuery.isLoading && <p className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">Carregando histórico persistido do subsistema...</p>}
                      {persistedMessagesQuery.isError && <p className="rounded-lg border border-orange-400/20 bg-orange-400/10 p-3 text-sm text-orange-100">Não foi possível carregar o histórico persistido agora. Exibindo mensagens locais de apoio.</p>}
                      {!persistedMessagesQuery.isLoading && currentMessages.length === 0 && <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-400">Nenhuma mensagem registrada para este subsistema.</p>}
                      {!persistedMessagesQuery.isLoading && currentMessages.map((message) => {
                        const isRead = readMessageIds.includes(message.id);
                        return <div key={message.id} className="rounded-lg border border-white/10 bg-white/5 p-3"><div className="flex justify-between gap-3 text-xs text-slate-500"><span className="font-bold text-cyan-300">{message.author}</span><span className={isRead ? 'text-emerald-300' : 'text-orange-300'}>{isRead ? 'Lido' : 'Não lido'}</span><span>{message.createdAt}</span></div><p className="mt-2 text-sm text-slate-300">{message.content}</p></div>;
                      })}
                      <div ref={messagesEndRef} aria-hidden="true" />
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="cad-shell relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <header className="cad-ribbon">
              <button className="brand cad-brand" onClick={() => selectPart("mission")}>
                <InnovareLogo />
                <span className="brand-copy"><strong>Innovare Rocket</strong><small>CAD paramétrico aeroespacial</small></span>
              </button>
              <div className="ribbon-tabs">
                <button className={`ribbon-tab ${activePart !== "simulation" && activePart !== "export" ? "active" : ""}`} onClick={() => selectPart("nose")}>Montagem</button>
                <button className={`ribbon-tab ${activePart === "simulation" ? "active" : ""}`} onClick={() => selectPart("simulation")}>Simulação</button>
                <button className={`ribbon-tab ${activePart === "export" ? "active" : ""}`} onClick={() => selectPart("export")}>Exportar</button>
              </div>
              <div className="ribbon-tools">
                <Button onClick={() => insertComponent("nose")} className="cad-tool"><Rocket size={15} /> Coifa</Button>
                <Button onClick={() => insertComponent("body")} className="cad-tool"><Box size={15} /> Tubo</Button>
                <Button onClick={() => insertComponent("fins")} className="cad-tool"><Gauge size={15} /> Aletas</Button>
                <Button onClick={() => insertComponent("motor")} className="cad-tool"><Zap size={15} /> Motor</Button>
                <Button onClick={recalc} className="primary-cta"><Activity size={15} /> Simular</Button>
              </div>
            </header>

            <section className="cad-presets">
              <span className="section-kicker"><Sparkles size={14} /> presets</span>
              <div className="preset-chips">
                {presets.map((preset) => (
                  <button key={preset.id} className={`preset-chip ${activePreset === preset.id ? "active" : ""}`} onClick={() => applyPreset(preset)}>
                    <strong>{preset.label}</strong><small>{preset.description}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="cad-workspace" id="parametros">
              <aside className="assembly-browser" aria-label="Árvore lateral de montagem">
                <div className="browser-title">
                  <span className="section-kicker"><Layers3 size={14} /> árvore de montagem</span>
                  <h2>{config.mission.name}</h2>
                  <p>Abra uma peça para editar somente a janela de propriedades dela.</p>
                </div>
                <div className="tree-root">
                  <button className="tree-project" onClick={() => selectPart("mission")}><ChevronRight size={15} /> 10001.iam · montagem</button>
                  {assemblyItems.map((item) => {
                    const Icon = item.icon;
                    return <button key={item.id} className={`tree-node ${activePart === item.id ? "active" : ""} state-${item.state}`} onClick={() => selectPart(item.id)}>
                      <span className="tree-icon"><Icon size={15} /></span>
                      <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                    </button>;
                  })}
                </div>
                <div className="browser-actions">
                  <button onClick={() => insertComponent("transition")}><Boxes size={14} /> Inserir transição</button>
                  <button onClick={() => insertComponent("payload")}><Satellite size={14} /> Inserir payload</button>
                  <button onClick={() => selectPart("learning")}><GraduationCap size={14} /> Cálculo guiado</button>
                </div>
              </aside>

              <section className="viewport-column">
                <div className="viewport-toolbar">
                  <div>
                    <span className="section-kicker"><Target size={14} /> viewport técnico em corte</span>
                    <h1>Montagem paramétrica do foguete</h1>
                  </div>
                  <div className="viewport-actions">
                    <button onClick={() => selectPart("nose")}><MousePointer2 size={14} /> Selecionar peça</button>
                    <button onClick={() => selectPart("simulation")}><Activity size={14} /> Ver resultados</button>
                    <button onClick={exportProject}><Download size={14} /> JSON</button>
                  </div>
                </div>
                <div className="cad-viewport" id="preview">
                  <RocketPreview config={config} cgMm={simulation.cgMm} cpMm={simulation.cpMm} stability={simulation.stability} />
                  <div className="viewport-overlay top-left">
                    <strong>{activePreset}</strong>
                    <span>{partTitle[activePart].title}</span>
                  </div>
                  <div className="view-cube">SIDE<br /><span>CUT</span></div>
                </div>
                <div className="status-strip">
                  <MetricCard label="Comprimento" value={`${Math.round(simulation.totalLengthMm)} mm`} detail="coifa + corpo + transição" />
                  <MetricCard label="Massa inicial" value={`${round(simulation.initialMassKg, 2)} kg`} detail={`${round(massBreakdown.autoSharePct, 0)}% auto · inclui propelente`} tone="orange" />
                  <MetricCard label="Estabilidade" value={`${round(simulation.stability, 2)} cal`} detail={stabilityStatus} tone="yellow" />
                  <MetricCard label="Apogeu" value={`${Math.round(simulation.apogeeM)} m`} detail={`${targetDelta >= 0 ? "+" : ""}${Math.round(targetDelta)} m contra alvo`} />
                </div>
              </section>

              <aside className="property-inspector">
                <div className="inspector-header">
                  <span className="section-kicker">{partTitle[activePart].kicker}</span>
                  <h2>{partTitle[activePart].title}</h2>
                  <p>{partTitle[activePart].description}</p>
                </div>
                <div className="inspector-window">
                  {renderProperties()}
                </div>
              </aside>
            </section>

            <section className="cad-analysis" id="simulacao">
              <div className="technical-panel">
                <span className="section-kicker"><Gauge size={15} /> curva de voo</span>
                <h2>Altitude x tempo</h2>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={simulation.chart}>
                      <defs><linearGradient id="altitudeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#009aa6" stopOpacity={0.58} /><stop offset="95%" stopColor="#009aa6" stopOpacity={0.02} /></linearGradient></defs>
                      <CartesianGrid stroke="#1d3942" strokeDasharray="4 8" />
                      <XAxis dataKey="time" stroke="#9fb4b9" />
                      <YAxis stroke="#9fb4b9" />
                      <Tooltip contentStyle={{ background: "#080d10", border: "1px solid #244550", color: "#f7f4ee" }} />
                      <Area dataKey="altitude" stroke="#009aa6" fill="url(#altitudeFill)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="technical-panel">
                <span className="section-kicker"><Zap size={15} /> velocidade e aceleração</span>
                <h2>Resposta dinâmica</h2>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={simulation.chart}>
                      <CartesianGrid stroke="#1d3942" strokeDasharray="4 8" />
                      <XAxis dataKey="time" stroke="#9fb4b9" />
                      <YAxis stroke="#9fb4b9" />
                      <Tooltip contentStyle={{ background: "#080d10", border: "1px solid #244550", color: "#f7f4ee" }} />
                      <Line type="monotone" dataKey="velocity" stroke="#ff4b00" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="acceleration" stroke="#ffc247" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="technical-panel" id="exportar">
                <span className="section-kicker"><Download size={15} /> arquivos</span>
                <h2>Exportação rápida</h2>
                <div className="export-stack">
                  <Button onClick={exportProject} className="primary-cta"><Database size={16} /> JSON</Button>
                  <Button onClick={exportCsv} variant="outline" className="secondary-cta"><Activity size={16} /> CSV</Button>
                  <Button onClick={exportReport} variant="outline" className="secondary-cta"><ClipboardCheck size={16} /> Relatório</Button>
                </div>
              </div>
            </section>

            <footer className="footer-note cad-footer">
              <strong>Innovare Rocket MVP.</strong> Interface reorganizada como bancada CAD educativa: montagem à esquerda, viewport persistente ao centro e janela de propriedades à direita. Ferramenta de pré-dimensionamento; não substitui validação técnica, ensaios, normas ou autorização de lançamento.
            </footer>
          </div>
        )}

        {isNozzleModalOpen && (() => {
          const Dc = config.motor.chamberDiameterMm;
          const Dt = config.motor.throatDiameterMm;
          const Pc = config.motor.chamberPressureBar;
          const propType = config.motor.propellantType || "knsb_fine";
          const gamma = propellantGammas[propType] || 1.135;
          const theta_c = config.motor.nozzleConvergentAngleDeg;
          const theta_d = config.motor.nozzleDivergentAngleDeg;

          // Pressão em bar, convertemos a razão Pc / Pe (1.013 bar)
          const pr = Math.max(Pc / 1.013, 1.0);
          // Mach de saída
          const Me = Math.sqrt((2 / (gamma - 1)) * (Math.pow(pr, (gamma - 1) / gamma) - 1));
          // Taxa de expansão
          const Er = (1 / Me) * Math.pow((2 / (gamma + 1)) * (1 + ((gamma - 1) / 2) * Me * Me), (gamma + 1) / (2 * (gamma - 1)));
          // Diâmetro de saída
          const Dexit = Dt * Math.sqrt(Er);
          // Comprimento de convergência
          const Lc = (Dc - Dt) / (2 * Math.tan((theta_c / 2) * Math.PI / 180));
          // Comprimento de divergência
          const Ld = (Dexit - Dt) / (2 * Math.tan((theta_d / 2) * Math.PI / 180));

          // SVG Nozzle Drawing params
          const svgW = 400;
          const svgH = 220;
          const centerY = svgH / 2;
          
          // Escalar horizontal e verticalmente
          const scaleX = 260 / Math.max(Lc + Ld, 40);
          const scaleY = 120 / Math.max(Dc, Dexit, 20);

          // Pontos X:
          const xStart = 50;
          const xConvergenceStart = xStart + 30; // comprimento reto da câmara
          const xThroat = xConvergenceStart + Lc * scaleX;
          const xExit = xThroat + Ld * scaleX;
          
          // Coordenadas Y:
          const yChamberTop = centerY - (Dc / 2) * scaleY;
          const yChamberBottom = centerY + (Dc / 2) * scaleY;
          const yThroatTop = centerY - (Dt / 2) * scaleY;
          const yThroatBottom = centerY + (Dt / 2) * scaleY;
          const yExitTop = centerY - (Dexit / 2) * scaleY;
          const yExitBottom = centerY + (Dexit / 2) * scaleY;

          // Função para aplicar os valores otimizados ao CAD
          const handleApplyNozzle = () => {
            update("motor", {
              nozzleExitDiameterMm: round(Dexit, 2),
              nozzleConvergentLengthMm: round(Lc, 2),
              nozzleDivergentLengthMm: round(Ld, 2),
            });
            setIsNozzleModalOpen(false);
            toast.success("Design de bico otimizado aplicado ao CAD!");
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <header className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Meteor Engine Design</span>
                    <h2 className="text-xl font-bold text-white">Ferramenta de projeto de bico</h2>
                  </div>
                  <button onClick={() => setIsNozzleModalOpen(false)} className="text-slate-400 hover:text-white" aria-label="Fechar modal">
                    <XCircle className="h-6 w-6" />
                  </button>
                </header>

                <div className="space-y-4">
                  {/* Inputs de Ângulos */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-slate-300">Ângulo de convergência (°)</span>
                      <input 
                        type="number" 
                        min="15" 
                        max="120" 
                        value={theta_c} 
                        onChange={(e) => update("motor", { nozzleConvergentAngleDeg: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none" 
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-slate-300">Ângulo de divergência (°)</span>
                      <input 
                        type="number" 
                        min="5" 
                        max="45" 
                        value={theta_d} 
                        onChange={(e) => update("motor", { nozzleDivergentAngleDeg: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none" 
                      />
                    </label>
                  </div>

                  {/* Outputs Calculados */}
                  <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Propulsor selecionado:</span>
                      <span className="font-bold text-cyan-300">{propellantOptions[propType]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de expansão (ε):</span>
                      <span className="font-bold text-white">{round(Er, 2)}:1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Velocidade de saída estimada:</span>
                      <span className="font-bold text-emerald-400">Mach {round(Me, 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comprimento de convergência:</span>
                      <span className="font-bold text-white">{round(Lc, 2)} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comprimento da divergência:</span>
                      <span className="font-bold text-white">{round(Ld, 2)} mm</span>
                    </div>
                    <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2">
                      <span>Diâmetro de saída do bocal:</span>
                      <span className="text-orange-300">{round(Dexit, 2)} mm</span>
                    </div>
                  </div>

                  {/* SVG Desenho Técnico */}
                  <div className="flex justify-center rounded-xl border border-white/5 bg-slate-950 p-4">
                    <svg width={svgW} height={svgH} className="text-slate-400">
                      {/* Eixo de simetria (centerline) */}
                      <line x1="10" y1={centerY} x2={svgW - 10} y2={centerY} stroke="#ffea79" strokeDasharray="3 5" strokeWidth="1" />
                      
                      {/* Paredes superiores e inferiores do bico */}
                      <line x1={xStart} y1={yChamberTop} x2={xConvergenceStart} y2={yChamberTop} stroke="#ffffff" strokeWidth="2.5" />
                      <line x1={xStart} y1={yChamberBottom} x2={xConvergenceStart} y2={yChamberBottom} stroke="#ffffff" strokeWidth="2.5" />
                      
                      <line x1={xConvergenceStart} y1={yChamberTop} x2={xThroat} y2={yThroatTop} stroke="#ffffff" strokeWidth="2.5" />
                      <line x1={xConvergenceStart} y1={yChamberBottom} x2={xThroat} y2={yThroatBottom} stroke="#ffffff" strokeWidth="2.5" />
                      
                      <line x1={xThroat} y1={yThroatTop} x2={xExit} y2={yExitTop} stroke="#ffffff" strokeWidth="2.5" />
                      <line x1={xThroat} y1={yThroatBottom} x2={xExit} y2={yExitBottom} stroke="#ffffff" strokeWidth="2.5" />

                      {/* Dimensões verticais */}
                      <line x1={xThroat} y1={yThroatTop} x2={xThroat} y2={yThroatBottom} stroke="#ff7300" strokeWidth="1.5" />
                      <circle cx={xThroat} cy={yThroatTop} r="3" fill="#ff7300" />
                      <circle cx={xThroat} cy={yThroatBottom} r="3" fill="#ff7300" />
                      
                      <line x1={xExit} y1={yExitTop} x2={xExit} y2={yExitBottom} stroke="#e93fe9" strokeWidth="1.5" />
                      <circle cx={xExit} cy={yExitTop} r="3" fill="#e93fe9" />
                      <circle cx={xExit} cy={yExitBottom} r="3" fill="#e93fe9" />

                      {/* Linhas indicadoras horizontais */}
                      <line x1={xConvergenceStart} y1={centerY + 60} x2={xThroat} y2={centerY + 60} stroke="#46e3ee" strokeWidth="1" />
                      <line x1={xConvergenceStart} y1={centerY + 55} x2={xConvergenceStart} y2={centerY + 65} stroke="#46e3ee" strokeWidth="1" />
                      <line x1={xThroat} y1={centerY + 55} x2={xThroat} y2={centerY + 65} stroke="#46e3ee" strokeWidth="1" />

                      <line x1={xThroat} y1={centerY + 60} x2={xExit} y2={centerY + 60} stroke="#46e3ee" strokeWidth="1" />
                      <line x1={xExit} y1={centerY + 55} x2={xExit} y2={centerY + 65} stroke="#46e3ee" strokeWidth="1" />

                      {/* Textos de legenda */}
                      <text x={xThroat - 5} y={yThroatTop - 12} fill="#ff7300" fontSize="9" fontWeight="bold" textAnchor="end">Ø Garganta ({Dt}mm)</text>
                      <text x={xExit + 5} y={yExitTop - 5} fill="#e93fe9" fontSize="9" fontWeight="bold">Ø Saída ({round(Dexit, 1)}mm)</text>
                      <text x={xConvergenceStart + (Lc*scaleX)/2} y={centerY + 72} fill="#46e3ee" fontSize="8" textAnchor="middle">L. Convergência</text>
                      <text x={xThroat + (Ld*scaleX)/2} y={centerY + 72} fill="#46e3ee" fontSize="8" textAnchor="middle">L. Divergência</text>
                      
                      <text x={xConvergenceStart + 10} y={centerY - 35} fill="#3ee946" fontSize="9" textAnchor="start">Conv: {theta_c}°</text>
                      <text x={xThroat + 15} y={centerY - 25} fill="#3ee946" fontSize="9">Div: {theta_d}°</text>
                    </svg>
                  </div>
                </div>

                <footer className="mt-5 flex gap-2">
                  <Button onClick={handleApplyNozzle} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2"><CheckCircle2 size={16} /> APLICAR NO CAD</Button>
                  <Button onClick={() => setIsNozzleModalOpen(false)} variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-slate-300 font-bold py-2 px-4 rounded-xl"><XCircle size={16} /> FECHAR</Button>
                </footer>
              </div>
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}

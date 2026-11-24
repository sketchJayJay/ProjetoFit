import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  Menu,
  Plus,
  Search,
  Settings,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
  ClipboardList,
  CalendarClock,
  BadgeCheck,
  NotebookPen,
  Trophy,
  Cloud,
  CloudOff,
  LoaderCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import CloudGateway, { useCoachEvents } from "./features/CloudGateway";
import {
  CoachDashboard,
  NewStudentForm,
  CoachStudents,
  StudentManager,
} from "./features/CoachWorkspace";
import StudentExperience from "./features/StudentExperience";
import { Action, Avatar, Brand, Panel, Pill } from "./components/ui";
import {
  dayOffset,
  normalizeEvent,
  sameId,
  studentProjection,
  today,
  uid,
} from "./lib/model";

const navItems = [
  { key: "dashboard", label: "Visão geral", icon: Home },
  { key: "alunos", label: "Alunos e painéis", icon: Users },
  { key: "treinos", label: "Treinos", icon: Dumbbell },
  { key: "avaliacoes", label: "Avaliações", icon: ClipboardList },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "checkins", label: "Check-ins", icon: HeartPulse },
  { key: "financeiro", label: "Financeiro", icon: Wallet },
  { key: "config", label: "Configurações", icon: Settings },
];

const initialStudents = [
  {
    id: 101,
    nome: "Lucas Martins",
    email: "lucas@exemplo.com",
    telefone: "(32) 99821-3344",
    plano: "Híbrido",
    objetivo: "Hipertrofia",
    status: "Ativo",
    genero: "Masculino",
    nascimento: "1998-04-12",
    academia: "Academia Prime",
    restricoes: "Leve desconforto no ombro direito.",
    observacoes: "Aluno constante e responde bem à progressão de carga.",
    entrada: "2026-01-08",
    adesao: 92,
    treinoHoje: "Treino A • Peito + tríceps",
    ultimoCheckin: "2026-03-16",
  },
  {
    id: 102,
    nome: "Mariana Costa",
    email: "mariana@exemplo.com",
    telefone: "(32) 99877-2211",
    plano: "Online",
    objetivo: "Emagrecimento",
    status: "Ativo",
    genero: "Feminino",
    nascimento: "1995-08-20",
    academia: "Treina em casa",
    restricoes: "Sensibilidade no joelho esquerdo.",
    observacoes: "Precisa de reforço na rotina de sono.",
    entrada: "2026-02-02",
    adesao: 78,
    treinoHoje: "Cardio + inferiores",
    ultimoCheckin: "2026-03-17",
  },
  {
    id: 103,
    nome: "Ana Luiza",
    email: "ana@exemplo.com",
    telefone: "(32) 99911-8833",
    plano: "Presencial",
    objetivo: "Glúteos e pernas",
    status: "Ativo",
    genero: "Feminino",
    nascimento: "2001-12-02",
    academia: "Studio EVO",
    restricoes: "Sem restrições relevantes.",
    observacoes: "Excelente constância e evolução rápida.",
    entrada: "2025-12-15",
    adesao: 96,
    treinoHoje: "Treino C • Inferiores",
    ultimoCheckin: "2026-03-14",
  },
  {
    id: 104,
    nome: "Pedro Henrique",
    email: "pedro@exemplo.com",
    telefone: "(32) 99712-1234",
    plano: "Híbrido",
    objetivo: "Condicionamento",
    status: "Ativo",
    genero: "Masculino",
    nascimento: "1992-06-05",
    academia: "Studio EVO",
    restricoes: "Baixa mobilidade de tornozelo.",
    observacoes: "Boa evolução no condicionamento.",
    entrada: "2026-01-20",
    adesao: 84,
    treinoHoje: "Treino funcional + cardio",
    ultimoCheckin: "2026-03-12",
  },
];

const initialEvaluations = [
  {
    id: 1,
    alunoId: 101,
    data: "2026-01-08",
    peso: 87,
    gordura: 23,
    cintura: 94,
    peito: 105,
    quadril: 99,
    observacoes: "Início da consultoria.",
  },
  {
    id: 2,
    alunoId: 101,
    data: "2026-02-10",
    peso: 85.2,
    gordura: 19.5,
    cintura: 90,
    peito: 106,
    quadril: 98,
    observacoes: "Evolução consistente.",
  },
  {
    id: 3,
    alunoId: 101,
    data: "2026-03-12",
    peso: 84,
    gordura: 17,
    cintura: 87,
    peito: 108,
    quadril: 97,
    observacoes: "Ótimo ganho de composição corporal.",
  },
  {
    id: 4,
    alunoId: 102,
    data: "2026-02-02",
    peso: 71.5,
    gordura: 28,
    cintura: 84,
    peito: 92,
    quadril: 103,
    observacoes: "Começo do plano online.",
  },
  {
    id: 5,
    alunoId: 102,
    data: "2026-03-15",
    peso: 68,
    gordura: 24,
    cintura: 80,
    peito: 90,
    quadril: 100,
    observacoes: "Boa resposta ao cardio e déficit controlado.",
  },
  {
    id: 6,
    alunoId: 103,
    data: "2026-01-09",
    peso: 64.5,
    gordura: 23,
    cintura: 76,
    peito: 88,
    quadril: 102,
    observacoes: "Objetivo em foco de membros inferiores.",
  },
  {
    id: 7,
    alunoId: 103,
    data: "2026-03-17",
    peso: 62,
    gordura: 20,
    cintura: 73,
    peito: 89,
    quadril: 104,
    observacoes: "Ganho de definição com bom volume de glúteo.",
  },
  {
    id: 8,
    alunoId: 104,
    data: "2026-01-20",
    peso: 93,
    gordura: 24,
    cintura: 99,
    peito: 107,
    quadril: 101,
    observacoes: "Condicionamento baixo no início.",
  },
  {
    id: 9,
    alunoId: 104,
    data: "2026-03-09",
    peso: 91,
    gordura: 21,
    cintura: 96,
    peito: 108,
    quadril: 100,
    observacoes: "Melhora no cardio e resistência.",
  },
];

const initialExercises = [
  {
    id: 1,
    nome: "Agachamento livre",
    grupo: "Pernas",
    dificuldade: "Intermediário",
    equipamento: "Barra",
    video: "Demo",
  },
  {
    id: 2,
    nome: "Supino reto",
    grupo: "Peito",
    dificuldade: "Intermediário",
    equipamento: "Barra",
    video: "Demo",
  },
  {
    id: 3,
    nome: "Remada curvada",
    grupo: "Costas",
    dificuldade: "Intermediário",
    equipamento: "Barra",
    video: "Demo",
  },
  {
    id: 4,
    nome: "Levantamento terra romeno",
    grupo: "Posterior",
    dificuldade: "Avançado",
    equipamento: "Barra",
    video: "Demo",
  },
  {
    id: 5,
    nome: "Bike HIIT",
    grupo: "Cardio",
    dificuldade: "Livre",
    equipamento: "Bike",
    video: "Demo",
  },
  {
    id: 6,
    nome: "Elevação lateral",
    grupo: "Ombros",
    dificuldade: "Iniciante",
    equipamento: "Halter",
    video: "Demo",
  },
];

const initialWorkouts = [
  {
    id: 1,
    alunoId: 101,
    nome: "Treino A",
    foco: "Peito + tríceps",
    dias: "Segunda e quinta",
    exercicios: [
      "Supino reto 4x10",
      "Supino inclinado 3x12",
      "Crucifixo 3x12",
      "Tríceps corda 4x12",
      "Mergulho banco 3x falha",
    ],
    status: "Ativo",
  },
  {
    id: 2,
    alunoId: 101,
    nome: "Treino B",
    foco: "Costas + bíceps",
    dias: "Terça e sexta",
    exercicios: [
      "Puxada alta 4x10",
      "Remada baixa 4x12",
      "Rosca direta 3x12",
      "Rosca martelo 3x12",
    ],
    status: "Ativo",
  },
  {
    id: 3,
    alunoId: 102,
    nome: "Treino Online 1",
    foco: "Cardio + pernas",
    dias: "Segunda, quarta e sexta",
    exercicios: [
      "Agachamento livre 4x12",
      "Afundo 3x12",
      "Bike HIIT 12 min",
      "Prancha 3x40s",
    ],
    status: "Ativo",
  },
  {
    id: 4,
    alunoId: 103,
    nome: "Treino C",
    foco: "Inferiores e glúteos",
    dias: "Terça e quinta",
    exercicios: [
      "Agachamento livre 5x8",
      "Leg press 4x12",
      "Stiff 4x10",
      "Abdutora 4x15",
      "Elevação pélvica 4x12",
    ],
    status: "Ativo",
  },
];

const initialAgenda = [
  {
    id: 1,
    alunoId: 101,
    data: today(),
    hora: "08:00",
    tipo: "Avaliação física",
    local: "Academia Prime",
    status: "Confirmado",
  },
  {
    id: 2,
    alunoId: 102,
    data: today(),
    hora: "11:30",
    tipo: "Check-in online",
    local: "Google Meet",
    status: "Confirmado",
  },
  {
    id: 3,
    alunoId: 103,
    data: today(),
    hora: "17:00",
    tipo: "Treino presencial",
    local: "Studio EVO",
    status: "Confirmado",
  },
  {
    id: 4,
    alunoId: 104,
    data: "2026-03-20",
    hora: "19:00",
    tipo: "Reavaliação",
    local: "Studio EVO",
    status: "Pendente",
  },
];

const initialPayments = [
  {
    id: 1,
    alunoId: 101,
    descricao: "Mensalidade março",
    valor: 350,
    vencimento: "2026-03-05",
    status: "Pago",
    forma: "Pix",
  },
  {
    id: 2,
    alunoId: 102,
    descricao: "Consultoria março",
    valor: 250,
    vencimento: "2026-03-10",
    status: "Pendente",
    forma: "Pix",
  },
  {
    id: 3,
    alunoId: 103,
    descricao: "Plano presencial março",
    valor: 380,
    vencimento: "2026-03-08",
    status: "Pago",
    forma: "Cartão",
  },
  {
    id: 4,
    alunoId: 104,
    descricao: "Plano híbrido março",
    valor: 320,
    vencimento: "2026-03-11",
    status: "Pago",
    forma: "Pix",
  },
];

const initialCheckins = [
  {
    id: 1,
    alunoId: 101,
    data: "2026-03-16",
    humor: "Excelente",
    energia: "Alta",
    sono: "8h",
    dieta: "85%",
    observacoes: "Subi carga no supino e mantive cardio.",
    resposta: "Excelente semana. Vamos manter progressão controlada.",
  },
  {
    id: 2,
    alunoId: 102,
    data: "2026-03-17",
    humor: "Boa",
    energia: "Média",
    sono: "6h",
    dieta: "80%",
    observacoes: "Fiz os treinos, mas senti joelho no afundo.",
    resposta: "Vamos trocar afundo por cadeira extensora e focar mobilidade.",
  },
  {
    id: 3,
    alunoId: 103,
    data: "2026-03-14",
    humor: "Excelente",
    energia: "Alta",
    sono: "7h",
    dieta: "90%",
    observacoes: "Glúteo queimando bonito e sem dor.",
    resposta: "Ótimo. Na próxima semana vamos subir volume.",
  },
];

const initialProfile = {
  nomeNegocio: "EvoFit Pro Studio",
  personalNome: "Jater Jr",
  cref: "CREF 000000-G/MG",
  whatsapp: "(32) 98428-5414",
  email: "contato@evofitpro.com",
  planoPadrao: "Híbrido",
  mensagemBoasVindas:
    "Bem-vindo ao seu novo ciclo. Vamos evoluir com constância.",
};

initialAgenda.forEach((entry, i) => {
  entry.data = dayOffset(i === 3 ? 1 : 0);
});
initialPayments.forEach((entry, i) => {
  entry.vencimento = dayOffset(i === 1 ? 3 : -2);
});
initialStudents.forEach((student, i) => {
  student.metaSemanal = [4, 3, 3, 3][i];
  student.focoDoCiclo = [
    "Execução consistente e progressão de carga",
    "Construir uma rotina que cabe no seu dia",
    "Técnica, força e constância",
    "Mais disposição em cada movimento",
  ][i];
  student.mensagemPersonal = [
    "Sua evolução é construída em cada repetição. Vamos manter a técnica e registrar suas cargas.",
    "Não precisa ser perfeito. Precisa fazer sentido para você. Conte comigo para ajustar sua rotina.",
    "Cada treino é uma oportunidade de construir sua melhor versão, no seu ritmo.",
    "Seu objetivo guia cada escolha. Vamos avançar com constância, respeitando seus limites.",
  ][i];
});

const STORAGE_KEYS = {
  students: "evofit_students_v2",
  evaluations: "evofit_evaluations_v2",
  exercises: "evofit_exercises_v2",
  workouts: "evofit_workouts_v2",
  agenda: "evofit_agenda_v2",
  payments: "evofit_payments_v2",
  checkins: "evofit_checkins_v2",
  profile: "evofit_profile_v2",
  events: "evofit_events_v3",
};

const DEFAULT_SNAPSHOT = {
  [STORAGE_KEYS.students]: initialStudents,
  [STORAGE_KEYS.evaluations]: initialEvaluations,
  [STORAGE_KEYS.exercises]: initialExercises,
  [STORAGE_KEYS.workouts]: initialWorkouts,
  [STORAGE_KEYS.agenda]: initialAgenda,
  [STORAGE_KEYS.payments]: initialPayments,
  [STORAGE_KEYS.checkins]: initialCheckins,
  [STORAGE_KEYS.profile]: initialProfile,
  [STORAGE_KEYS.events]: [],
};

let cacheOwner = "demo";
const cacheKey = (key) =>
  cacheOwner === "demo" ? key : `${key}::${cacheOwner}`;
function clearLocalSnapshot() {
  Object.keys(STORAGE_KEYS).forEach((key) =>
    window.localStorage.removeItem(cacheKey(STORAGE_KEYS[key])),
  );
}

function writeSnapshotToLocalStorage(
  payload = DEFAULT_SNAPSHOT,
  defaults = DEFAULT_SNAPSHOT,
) {
  Object.entries(defaults).forEach(([storageKey, fallbackValue]) => {
    const value = payload?.[storageKey] ?? fallbackValue;
    window.localStorage.setItem(cacheKey(storageKey), JSON.stringify(value));
  });
}

function readSnapshotFromLocalStorage() {
  const snapshot = {};
  Object.entries(DEFAULT_SNAPSHOT).forEach(([storageKey, fallbackValue]) => {
    try {
      const raw = window.localStorage.getItem(cacheKey(storageKey));
      snapshot[storageKey] = raw ? JSON.parse(raw) : fallbackValue;
    } catch {
      snapshot[storageKey] = fallbackValue;
    }
  });
  return snapshot;
}

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(cacheKey(key));
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(cacheKey(key), JSON.stringify(value));
    } catch {
      window.dispatchEvent(new CustomEvent("evofit-storage-error"));
      return;
    }
    window.dispatchEvent(
      new CustomEvent("evofit-storage-update", { detail: { key, value } }),
    );
  }, [key, value]);

  return [value, setValue];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "border-white/10 bg-white/5 text-zinc-200",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    warn: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    info: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function StatCard({ title, value, meta, icon: Icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-sm text-emerald-400">{meta}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  step,
  required = false,
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        required={required}
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = "" }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
      />
    </div>
  );
}

function Button({
  children,
  onClick,
  type = "button",
  tone = "primary",
  className = "",
}) {
  const styles = {
    primary: "bg-emerald-400 text-zinc-950 hover:opacity-90",
    secondary: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition ${styles[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function EvaluationsView({
  students,
  selectedStudentId,
  setSelectedStudentId,
  evaluations,
  setEvaluations,
}) {
  const [form, setForm] = useState({
    alunoId: String(selectedStudentId || students[0]?.id || ""),
    data: today(),
    peso: "",
    gordura: "",
    cintura: "",
    peito: "",
    quadril: "",
    observacoes: "",
  });

  useEffect(() => {
    if (selectedStudentId) {
      setForm((current) => ({
        ...current,
        alunoId: String(selectedStudentId),
      }));
    }
  }, [selectedStudentId]);

  const selectedStudent = students.find(
    (student) => student.id === Number(form.alunoId),
  );
  const studentEvaluations = evaluations
    .filter((item) => item.alunoId === Number(form.alunoId))
    .sort((a, b) => a.data.localeCompare(b.data));
  const chartData = studentEvaluations.map((item) => ({
    data: formatDate(item.data).slice(0, 5),
    peso: item.peso,
    gordura: item.gordura,
  }));

  function addEvaluation(event) {
    event.preventDefault();
    if (
      !form.alunoId ||
      !form.data ||
      !form.peso ||
      Number(form.peso) <= 0 ||
      Number(form.gordura) < 0 ||
      Number(form.gordura) > 100
    )
      return;
    const newEvaluation = {
      id: Date.now(),
      alunoId: Number(form.alunoId),
      data: form.data,
      peso: Number(form.peso || 0),
      gordura: Number(form.gordura || 0),
      cintura: Number(form.cintura || 0),
      peito: Number(form.peito || 0),
      quadril: Number(form.quadril || 0),
      observacoes: form.observacoes,
    };
    setEvaluations([...evaluations, newEvaluation]);
    setSelectedStudentId(Number(form.alunoId));
    setForm({
      ...form,
      peso: "",
      gordura: "",
      cintura: "",
      peito: "",
      quadril: "",
      observacoes: "",
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle
          title="Nova avaliação"
          subtitle="Peso, medidas e evolução física"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
            <select
              aria-label="Aluno"
              value={form.alunoId}
              onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nome}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Data"
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={form.peso}
            onChange={(e) => setForm({ ...form, peso: e.target.value })}
          />
          <Input
            label="% gordura"
            type="number"
            step="0.1"
            value={form.gordura}
            onChange={(e) => setForm({ ...form, gordura: e.target.value })}
          />
          <Input
            label="Cintura (cm)"
            type="number"
            value={form.cintura}
            onChange={(e) => setForm({ ...form, cintura: e.target.value })}
          />
          <Input
            label="Peito (cm)"
            type="number"
            value={form.peito}
            onChange={(e) => setForm({ ...form, peito: e.target.value })}
          />
          <Input
            label="Quadril (cm)"
            type="number"
            value={form.quadril}
            onChange={(e) => setForm({ ...form, quadril: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Observações"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Leitura da avaliação, ajustes e pontos de atenção"
          />
        </div>
        <Button onClick={addEvaluation} className="mt-4">
          <Plus className="h-4 w-4" /> Salvar avaliação
        </Button>
      </Card>

      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle
            title="Gráfico do aluno"
            subtitle={
              selectedStudent
                ? `Histórico de ${selectedStudent.nome}`
                : "Selecione um aluno"
            }
          />
          {chartData.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="data" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#34d399"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="gordura"
                    stroke="#22d3ee"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Sem histórico"
              text="Cadastre a primeira avaliação para gerar o gráfico."
            />
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Histórico de avaliações"
            subtitle="Linha do tempo do progresso"
          />
          <div className="space-y-3">
            {studentEvaluations.length ? (
              [...studentEvaluations]
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {formatDate(item.data)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Peso {item.peso} kg • Gordura {item.gordura}% •
                          Cintura {item.cintura} cm
                        </p>
                      </div>
                      <Badge tone="success">
                        {selectedStudent?.nome || "Aluno"}
                      </Badge>
                    </div>
                    {item.observacoes ? (
                      <p className="mt-3 text-sm text-zinc-400">
                        {item.observacoes}
                      </p>
                    ) : null}
                  </div>
                ))
            ) : (
              <EmptyState
                title="Nada por aqui"
                text="Ainda não existem avaliações para este aluno."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function WorkoutsView({
  students,
  selectedStudentId,
  setSelectedStudentId,
  workouts,
  setWorkouts,
  exercises,
  setExercises,
}) {
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [exerciseForm, setExerciseForm] = useState({
    nome: "",
    grupo: "Pernas",
    dificuldade: "Iniciante",
    equipamento: "Livre",
  });
  const [workoutForm, setWorkoutForm] = useState({
    alunoId: String(selectedStudentId || students[0]?.id || ""),
    nome: "Treino Novo",
    foco: "Hipertrofia",
    dias: "Segunda e quinta",
    exercicios: "Agachamento livre 4x10\nSupino reto 4x10",
  });

  useEffect(() => {
    if (selectedStudentId) {
      setWorkoutForm((current) => ({
        ...current,
        alunoId: String(selectedStudentId),
      }));
    }
  }, [selectedStudentId]);

  const selectedStudent = students.find(
    (student) => student.id === Number(workoutForm.alunoId),
  );
  const selectedWorkouts = workouts.filter(
    (item) => item.alunoId === Number(workoutForm.alunoId),
  );

  function addExercise(event) {
    event.preventDefault();
    if (!exerciseForm.nome.trim()) return;
    setExercises([
      { id: Date.now(), ...exerciseForm, video: "Demo" },
      ...exercises,
    ]);
    setExerciseForm({
      nome: "",
      grupo: "Pernas",
      dificuldade: "Iniciante",
      equipamento: "Livre",
    });
  }

  function addWorkout(event) {
    event.preventDefault();
    setFormError("");
    if (
      !workoutForm.alunoId ||
      !workoutForm.nome.trim() ||
      !workoutForm.exercicios.trim()
    ) {
      setFormError("Selecione um aluno e informe o nome e os exercícios.");
      return;
    }
    if (
      workoutForm.exercicios.split("\n").filter((x) => x.trim()).length > 50
    ) {
      setFormError("Use até 50 exercícios por ficha.");
      return;
    }
    const newWorkout = {
      id: editingId || Date.now(),
      alunoId: Number(workoutForm.alunoId),
      nome: workoutForm.nome,
      foco: workoutForm.foco,
      dias: workoutForm.dias,
      exercicios: workoutForm.exercicios
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      status: "Ativo",
    };
    setWorkouts((items) =>
      editingId
        ? items.map((w) => (sameId(w.id, editingId) ? newWorkout : w))
        : [newWorkout, ...items],
    );
    setEditingId(null);
    setSelectedStudentId(Number(workoutForm.alunoId));
    setWorkoutForm({
      ...workoutForm,
      nome: "Treino Novo",
      foco: "Hipertrofia",
      dias: "Segunda e quinta",
      exercicios: "Agachamento livre 4x10\nSupino reto 4x10",
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle
            title="Biblioteca de exercícios"
            subtitle="Monte sua base personalizada"
          />
          <form onSubmit={addExercise} className="space-y-4">
            <Input
              label="Nome do exercício"
              value={exerciseForm.nome}
              onChange={(e) =>
                setExerciseForm({ ...exerciseForm, nome: e.target.value })
              }
              placeholder="Ex: Leg press 45"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Grupo muscular"
                value={exerciseForm.grupo}
                onChange={(e) =>
                  setExerciseForm({ ...exerciseForm, grupo: e.target.value })
                }
                options={[
                  "Pernas",
                  "Peito",
                  "Costas",
                  "Ombros",
                  "Bíceps",
                  "Tríceps",
                  "Cardio",
                  "Core",
                ]}
              />
              <Select
                label="Dificuldade"
                value={exerciseForm.dificuldade}
                onChange={(e) =>
                  setExerciseForm({
                    ...exerciseForm,
                    dificuldade: e.target.value,
                  })
                }
                options={["Iniciante", "Intermediário", "Avançado", "Livre"]}
              />
            </div>
            <Input
              label="Equipamento"
              value={exerciseForm.equipamento}
              onChange={(e) =>
                setExerciseForm({
                  ...exerciseForm,
                  equipamento: e.target.value,
                })
              }
              placeholder="Ex: barra, halter, bike"
            />
            <Button type="submit">
              <Plus className="h-4 w-4" /> Adicionar exercício
            </Button>
          </form>

          <div className="mt-6 grid gap-3">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <div>
                  <p className="font-medium text-white">{exercise.nome}</p>
                  <p className="text-sm text-zinc-400">
                    {exercise.grupo} • {exercise.equipamento}
                  </p>
                </div>
                <Badge tone="info">{exercise.dificuldade}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle
            title="Montar treino"
            subtitle="Crie fichas por aluno"
          />
          <form onSubmit={addWorkout} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Aluno
                </label>
                <select
                  aria-label="Aluno"
                  value={workoutForm.alunoId}
                  onChange={(e) =>
                    setWorkoutForm({ ...workoutForm, alunoId: e.target.value })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nome}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Nome do treino"
                value={workoutForm.nome}
                onChange={(e) =>
                  setWorkoutForm({ ...workoutForm, nome: e.target.value })
                }
              />
              <Input
                label="Foco"
                value={workoutForm.foco}
                onChange={(e) =>
                  setWorkoutForm({ ...workoutForm, foco: e.target.value })
                }
              />
              <Input
                label="Dias"
                value={workoutForm.dias}
                onChange={(e) =>
                  setWorkoutForm({ ...workoutForm, dias: e.target.value })
                }
                placeholder="Ex: Seg, Qua, Sex"
              />
            </div>
            <Textarea
              label="Exercícios"
              value={workoutForm.exercicios}
              onChange={(e) =>
                setWorkoutForm({ ...workoutForm, exercicios: e.target.value })
              }
              placeholder="Um exercício por linha"
            />
            <Button type="submit">
              <Plus className="h-4 w-4" />{" "}
              {editingId ? "Salvar alterações" : "Salvar treino"}
            </Button>
            {editingId && (
              <Button
                tone="secondary"
                onClick={() => {
                  setEditingId(null);
                  setWorkoutForm({
                    ...workoutForm,
                    nome: "Treino Novo",
                    exercicios: "",
                  });
                }}
              >
                Cancelar edição
              </Button>
            )}
            {formError && (
              <p className="notice error" role="alert">
                {formError}
              </p>
            )}
          </form>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Treinos do aluno"
            subtitle={
              selectedStudent
                ? `${selectedStudent.nome} selecionado`
                : "Selecione um aluno"
            }
          />
          <div className="space-y-3">
            {selectedWorkouts.length ? (
              selectedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{workout.nome}</p>
                      <p className="text-sm text-zinc-400">
                        {workout.foco} • {workout.dias}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        tone={workout.status === "Inativo" ? "warn" : "success"}
                      >
                        {workout.status}
                      </Badge>
                      <button
                        className="text-action"
                        onClick={() => {
                          setEditingId(workout.id);
                          setWorkoutForm({
                            alunoId: String(workout.alunoId),
                            nome: workout.nome,
                            foco: workout.foco,
                            dias: workout.dias,
                            exercicios: workout.exercicios.join("\n"),
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-action"
                        onClick={() =>
                          setWorkouts((items) =>
                            items.map((w) =>
                              sameId(w.id, workout.id)
                                ? {
                                    ...w,
                                    status:
                                      w.status === "Inativo"
                                        ? "Ativo"
                                        : "Inativo",
                                  }
                                : w,
                            ),
                          )
                        }
                      >
                        {workout.status === "Inativo" ? "Reativar" : "Arquivar"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {workout.exercicios.map((exercise) => (
                      <div
                        key={exercise}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200"
                      >
                        {exercise}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Sem treino ainda"
                text="Crie a primeira ficha para este aluno."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AgendaView({ students, agenda, setAgenda }) {
  const [form, setForm] = useState({
    alunoId: String(students[0]?.id || ""),
    data: today(),
    hora: "08:00",
    tipo: "Avaliação física",
    local: "Studio EVO",
    status: "Confirmado",
  });

  function addAgenda(event) {
    event.preventDefault();
    if (!form.alunoId || !form.data || !form.hora) return;
    const newItem = {
      id: Date.now(),
      alunoId: Number(form.alunoId),
      data: form.data,
      hora: form.hora,
      tipo: form.tipo,
      local: form.local,
      status: form.status,
    };
    setAgenda(
      [newItem, ...agenda].sort((a, b) =>
        `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`),
      ),
    );
  }

  const groupedAgenda = useMemo(() => {
    const map = {};
    agenda.forEach((item) => {
      if (!map[item.data]) map[item.data] = [];
      map[item.data].push(item);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [agenda]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle
          title="Novo compromisso"
          subtitle="Agenda do personal organizada"
        />
        <form onSubmit={addAgenda} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
            <select
              aria-label="Aluno"
              value={form.alunoId}
              onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Data"
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
            <Input
              label="Hora"
              type="time"
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
            />
            <Input
              label="Tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            />
            <Input
              label="Local"
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={["Confirmado", "Pendente", "Concluído"]}
          />
          <Button type="submit">
            <Plus className="h-4 w-4" /> Adicionar compromisso
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Calendário simplificado"
          subtitle="Visual por dia"
        />
        <div className="space-y-6">
          {groupedAgenda.length ? (
            groupedAgenda.map(([date, items]) => (
              <div key={date}>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {formatDate(date)}
                </p>
                <div className="space-y-3">
                  {items
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              {students.find(
                                (student) => student.id === item.alunoId,
                              )?.nome || "Aluno"}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {item.tipo} • {item.local}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="info">{item.hora}</Badge>
                            <Badge
                              tone={
                                item.status === "Pendente" ? "warn" : "success"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Agenda vazia"
              text="Cadastre o primeiro compromisso do dia."
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function CheckinsView({ students, checkins, setCheckins }) {
  const [form, setForm] = useState({
    alunoId: String(students[0]?.id || ""),
    data: today(),
    humor: "Boa",
    energia: "Média",
    sono: "7h",
    dieta: "80%",
    observacoes: "",
    resposta: "",
  });

  function addCheckin(event) {
    event.preventDefault();
    if (!form.alunoId || !form.data) return;
    const newCheckin = {
      id: Date.now(),
      alunoId: Number(form.alunoId),
      ...form,
    };
    setCheckins([newCheckin, ...checkins]);
    setForm({ ...form, observacoes: "", resposta: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle
          title="Novo check-in"
          subtitle="Modelo do acompanhamento online"
        />
        <form onSubmit={addCheckin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
            <select
              aria-label="Aluno"
              value={form.alunoId}
              onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Data"
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
            <Select
              label="Humor"
              value={form.humor}
              onChange={(e) => setForm({ ...form, humor: e.target.value })}
              options={["Excelente", "Boa", "Média", "Baixa"]}
            />
            <Select
              label="Energia"
              value={form.energia}
              onChange={(e) => setForm({ ...form, energia: e.target.value })}
              options={["Alta", "Média", "Baixa"]}
            />
            <Input
              label="Sono"
              value={form.sono}
              onChange={(e) => setForm({ ...form, sono: e.target.value })}
              placeholder="Ex: 7h"
            />
            <Input
              label="Dieta"
              value={form.dieta}
              onChange={(e) => setForm({ ...form, dieta: e.target.value })}
              placeholder="Ex: 85%"
            />
          </div>
          <Textarea
            label="Observações do aluno"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Como foi a semana, dores, treinos, alimentação..."
          />
          <Textarea
            label="Resposta do personal"
            value={form.resposta}
            onChange={(e) => setForm({ ...form, resposta: e.target.value })}
            placeholder="Ajustes e feedback do profissional"
          />
          <Button type="submit">
            <Plus className="h-4 w-4" /> Salvar check-in
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Linha do tempo de check-ins"
          subtitle="Leitura rápida e prática"
        />
        <div className="space-y-3">
          {checkins.length ? (
            checkins.map((item) => {
              const student = students.find(
                (student) => student.id === item.alunoId,
              );
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {student?.nome || "Aluno"}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {formatDate(item.data)} • Sono {item.sono} • Dieta{" "}
                        {item.dieta}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="info">Humor {item.humor}</Badge>
                      <Badge tone="success">Energia {item.energia}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Aluno
                      </p>
                      <p className="mt-2 text-sm text-zinc-200">
                        {item.observacoes}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-emerald-300">
                        Personal
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {item.resposta || "Sem resposta ainda."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="Sem check-ins"
              text="Cadastre o primeiro acompanhamento semanal."
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function FinanceView({ students, payments, setPayments }) {
  const [form, setForm] = useState({
    alunoId: String(students[0]?.id || ""),
    descricao: "Mensalidade",
    valor: "350",
    vencimento: dayOffset(7),
    status: "Pendente",
    forma: "Pix",
  });

  function addPayment(event) {
    event.preventDefault();
    if (
      !form.alunoId ||
      !form.descricao.trim() ||
      !form.vencimento ||
      !Number.isFinite(Number(form.valor)) ||
      Number(form.valor) <= 0
    )
      return;
    const newPayment = {
      id: Date.now(),
      alunoId: Number(form.alunoId),
      descricao: form.descricao,
      valor: Number(form.valor),
      vencimento: form.vencimento,
      status: form.status,
      forma: form.forma,
      dataPagamento: form.status === "Pago" ? today() : null,
    };
    setPayments([newPayment, ...payments]);
  }

  const totals = useMemo(() => {
    const total = payments.reduce((sum, item) => sum + Number(item.valor), 0);
    const paid = payments
      .filter((item) => item.status === "Pago")
      .reduce((sum, item) => sum + Number(item.valor), 0);
    const pending = payments
      .filter((item) => item.status === "Pendente")
      .reduce((sum, item) => sum + Number(item.valor), 0);
    return { total, paid, pending };
  }, [payments]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Faturamento total"
          value={formatCurrency(totals.total)}
          meta="Soma geral cadastrada"
          icon={TrendingUp}
        />
        <StatCard
          title="Recebido"
          value={formatCurrency(totals.paid)}
          meta="Entradas confirmadas"
          icon={Wallet}
        />
        <StatCard
          title="A receber"
          value={formatCurrency(totals.pending)}
          meta="Pendências do mês"
          icon={CreditCard}
        />
        <StatCard
          title="Mensalidades"
          value={payments.length}
          meta="Registros cadastrados"
          icon={Target}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <SectionTitle
            title="Novo lançamento"
            subtitle="Controle financeiro do personal"
          />
          <form onSubmit={addPayment} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
              <select
                aria-label="Aluno"
                value={form.alunoId}
                onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Descrição"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
              <Input
                label="Valor"
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
              <Input
                label="Vencimento"
                type="date"
                value={form.vencimento}
                onChange={(e) =>
                  setForm({ ...form, vencimento: e.target.value })
                }
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={["Pendente", "Pago"]}
              />
            </div>
            <Select
              label="Forma de pagamento"
              value={form.forma}
              onChange={(e) => setForm({ ...form, forma: e.target.value })}
              options={["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"]}
            />
            <Button type="submit">
              <Plus className="h-4 w-4" /> Salvar lançamento
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Pagamentos"
            subtitle="Visual por aluno e status"
          />
          <div className="space-y-3">
            {payments.map((item) => {
              const student = students.find(
                (student) => student.id === item.alunoId,
              );
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {student?.nome || "Aluno"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {item.descricao} • Vence em {formatDate(item.vencimento)}{" "}
                      • {item.forma}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">
                      {formatCurrency(item.valor)}
                    </p>
                    <Badge tone={item.status === "Pago" ? "success" : "warn"}>
                      {item.status}
                    </Badge>
                    <button
                      className="text-action"
                      onClick={() =>
                        setPayments((items) =>
                          items.map((p) =>
                            sameId(p.id, item.id)
                              ? {
                                  ...p,
                                  status:
                                    p.status === "Pago" ? "Pendente" : "Pago",
                                  dataPagamento:
                                    p.status === "Pago" ? null : today(),
                                }
                              : p,
                          ),
                        )
                      }
                    >
                      {item.status === "Pago"
                        ? "Voltar a pendente"
                        : "Marcar pago"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsView({ profile, setProfile }) {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  function saveSettings(event) {
    event.preventDefault();
    setProfile(form);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5">
        <SectionTitle
          title="Identidade do negócio"
          subtitle="Ajustes gerais do sistema"
        />
        <form onSubmit={saveSettings} className="space-y-4">
          <Input
            label="Nome do negócio"
            value={form.nomeNegocio}
            onChange={(e) => setForm({ ...form, nomeNegocio: e.target.value })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome do personal"
              value={form.personalNome}
              onChange={(e) =>
                setForm({ ...form, personalNome: e.target.value })
              }
            />
            <Input
              label="CREF"
              value={form.cref}
              onChange={(e) => setForm({ ...form, cref: e.target.value })}
            />
            <Input
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <Select
            label="Plano padrão"
            value={form.planoPadrao}
            onChange={(e) => setForm({ ...form, planoPadrao: e.target.value })}
            options={["Online", "Presencial", "Híbrido"]}
          />
          <Textarea
            label="Mensagem de boas-vindas"
            value={form.mensagemBoasVindas}
            onChange={(e) =>
              setForm({ ...form, mensagemBoasVindas: e.target.value })
            }
          />
          <Button type="submit">
            <NotebookPen className="h-4 w-4" /> Salvar configurações
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Resumo do sistema"
          subtitle="O que esta versão já entrega"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              icon: Users,
              title: "Cadastro de alunos",
              text: "Ficha completa com plano, objetivo, contato e observações.",
            },
            {
              icon: ClipboardList,
              title: "Avaliações físicas",
              text: "Peso, medidas, gordura e gráfico de evolução.",
            },
            {
              icon: Dumbbell,
              title: "Treinos por aluno",
              text: "Biblioteca de exercícios e montagem de fichas.",
            },
            {
              icon: CalendarDays,
              title: "Agenda",
              text: "Compromissos presenciais, online e retornos.",
            },
            {
              icon: Wallet,
              title: "Financeiro",
              text: "Mensalidades, status e controle simples de caixa.",
            },
            {
              icon: UserRound,
              title: "Área do aluno",
              text: "Painel individual com treino guiado, evolução e conversa.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-white">{item.title}</p>
                </div>
                <p className="mt-3 text-sm text-zinc-400">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm text-emerald-300">Acompanhamento individual</p>
          <p className="mt-2 text-sm leading-6 text-zinc-200">
            Personalize o painel e crie convites em Alunos e painéis. O acesso
            online usa o e-mail autorizado e a senha do aluno.
          </p>
        </div>
      </Card>
    </div>
  );
}

const storage = {
  owner: (value) => {
    cacheOwner = value;
  },
  read: readSnapshotFromLocalStorage,
  write: writeSnapshotToLocalStorage,
  empty: (user) => ({
    ...Object.fromEntries(Object.values(STORAGE_KEYS).map((key) => [key, []])),
    [STORAGE_KEYS.profile]: {
      ...initialProfile,
      nomeNegocio: "Meu espaço de treino",
      personalNome: user.user_metadata?.name || "Personal",
      email: user.email || "",
      cref: "",
      whatsapp: "",
    },
  }),
};

function DashboardApp({ cloudStatus = "demo", onSignOut, session, flush }) {
  const [students, setStudents] = useLocalStorageState(
    STORAGE_KEYS.students,
    initialStudents,
  );
  const [evaluations, setEvaluations] = useLocalStorageState(
    STORAGE_KEYS.evaluations,
    initialEvaluations,
  );
  const [exercises, setExercises] = useLocalStorageState(
    STORAGE_KEYS.exercises,
    initialExercises,
  );
  const [workouts, setWorkouts] = useLocalStorageState(
    STORAGE_KEYS.workouts,
    initialWorkouts,
  );
  const [agenda, setAgenda] = useLocalStorageState(
    STORAGE_KEYS.agenda,
    initialAgenda,
  );
  const [payments, setPayments] = useLocalStorageState(
    STORAGE_KEYS.payments,
    initialPayments,
  );
  const [checkins, setCheckins] = useLocalStorageState(
    STORAGE_KEYS.checkins,
    initialCheckins,
  );
  const [profile, setProfile] = useLocalStorageState(
    STORAGE_KEYS.profile,
    initialProfile,
  );
  const [demoEvents, setDemoEvents] = useLocalStorageState(
    STORAGE_KEYS.events,
    [],
  );
  const remote = useCoachEvents(session);
  const events = session ? remote.events : demoEvents;
  const state = {
    students,
    evaluations,
    exercises,
    workouts,
    agenda,
    payments,
    checkins,
    profile,
    events,
  };
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id);
  const [previewId, setPreviewId] = useState(null);
  const [manager, setManager] = useState(null);
  const [storageError, setStorageError] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  useEffect(() => {
    const handler = () => setStorageError(true);
    window.addEventListener("evofit-storage-error", handler);
    return () => window.removeEventListener("evofit-storage-error", handler);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [previewId, activeTab]);
  const navigate = (tab, id) => {
    if (id) setSelectedStudentId(id);
    setActiveTab(tab);
    setMobileOpen(false);
    setManager(null);
    window.scrollTo({ top: 0 });
  };
  const openStudent = (student, tab = "profile") =>
    setManager({ id: student.id, tab });
  const openPreview = (student) => {
    setManager(null);
    setPreviewId(student.id);
    window.scrollTo({ top: 0 });
  };
  const managedStudent = students.find((s) => sameId(s.id, manager?.id));
  const previewStudent = students.find((s) => sameId(s.id, previewId));
  async function eventForStudent(studentId, kind, payload, author = "student") {
    if (session) {
      await flush();
      const { error } = await supabase.rpc("record_coach_event", {
        p_student_id: String(studentId),
        p_id: uid(),
        p_kind: kind,
        p_payload: payload,
      });
      if (error) throw new Error(error.message);
      await remote.refresh();
    } else
      setDemoEvents((items) => [
        ...items,
        {
          id: uid(),
          alunoId: studentId,
          kind,
          payload,
          author,
          created_at: new Date().toISOString(),
        },
      ]);
  }
  async function coachMessage(studentId, text) {
    if (session) {
      await flush();
      await remote.send(studentId, text);
    } else await eventForStudent(studentId, "message", { text }, "coach");
  }
  async function signOut() {
    try {
      await flush();
      await onSignOut();
    } catch (err) {
      setSignOutError(
        "Não foi possível salvar antes de sair. Tente novamente para preservar suas alterações.",
      );
    }
  }
  if (previewStudent)
    return (
      <StudentExperience
        key={previewStudent.id}
        data={studentProjection(previewStudent, state)}
        scope={session?.user?.id || "demo"}
        preview
        onExit={() => setPreviewId(null)}
        onEvent={(kind, payload) =>
          eventForStudent(previewStudent.id, kind, payload)
        }
        onRefresh={session ? remote.refresh : undefined}
      />
    );
  function content() {
    if (activeTab === "dashboard")
      return (
        <CoachDashboard
          state={state}
          onNavigate={navigate}
          onStudent={openStudent}
          onPreview={openPreview}
        />
      );
    if (activeTab === "alunos")
      return (
        <CoachStudents
          state={state}
          onStudent={openStudent}
          onPreview={openPreview}
          onCreate={() => navigate("cadastro")}
        />
      );
    if (activeTab === "cadastro")
      return (
        <NewStudentForm
          profile={profile}
          onBack={() => navigate("alunos")}
          onCreate={(student) => {
            setStudents((items) => [student, ...items]);
            setSelectedStudentId(student.id);
            navigate("alunos");
          }}
        />
      );
    const body =
      activeTab === "avaliacoes" ? (
        <EvaluationsView
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          evaluations={evaluations}
          setEvaluations={setEvaluations}
        />
      ) : activeTab === "treinos" ? (
        <WorkoutsView
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          workouts={workouts}
          setWorkouts={setWorkouts}
          exercises={exercises}
          setExercises={setExercises}
        />
      ) : activeTab === "agenda" ? (
        <AgendaView students={students} agenda={agenda} setAgenda={setAgenda} />
      ) : activeTab === "checkins" ? (
        <>
          <Panel className="received-checkins">
            <div className="panel-head">
              <div>
                <span className="eyebrow">ENVIADOS PELOS ALUNOS</span>
                <h3>Check-ins dos painéis individuais</h3>
              </div>
            </div>
            {events.filter((e) => e.kind === "checkin").length ? (
              events
                .filter((e) => e.kind === "checkin")
                .sort((a, b) => b.created_at.localeCompare(a.created_at))
                .map((e) => (
                  <button
                    className="attention-item"
                    key={e.id}
                    onClick={() => {
                      const student = students.find((s) =>
                        sameId(s.id, e.alunoId),
                      );
                      if (student) openStudent(student, "messages");
                    }}
                  >
                    <Avatar
                      name={students.find((s) => sameId(s.id, e.alunoId))?.nome}
                    />
                    <span>
                      <strong>
                        {students.find((s) => sameId(s.id, e.alunoId))?.nome} ·{" "}
                        {e.payload.mood}
                      </strong>
                      <small>
                        Energia {e.payload.energy}/5 · Sono {e.payload.sleep}h ·{" "}
                        {e.payload.date}
                      </small>
                      <small>{e.payload.note}</small>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))
            ) : (
              <p className="muted">
                O próximo check-in enviado por um aluno aparece aqui.
              </p>
            )}
          </Panel>
          <CheckinsView
            students={students}
            checkins={checkins}
            setCheckins={setCheckins}
          />
        </>
      ) : activeTab === "financeiro" ? (
        <FinanceView
          students={students}
          payments={payments}
          setPayments={setPayments}
        />
      ) : (
        <>
          <SettingsView profile={profile} setProfile={setProfile} />
          <Panel className="data-settings">
            <h3>Cópia dos seus dados</h3>
            <p>Guarde uma cópia completa dos registros deste painel.</p>
            <Action
              secondary
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob(
                    [
                      JSON.stringify(
                        {
                          ...Object.fromEntries(
                            Object.entries(STORAGE_KEYS).map(([key, value]) => [
                              value,
                              key === "events" ? demoEvents : state[key],
                            ]),
                          ),
                          portalEvents: events,
                        },
                        null,
                        2,
                      ),
                    ],
                    { type: "application/json" },
                  ),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `EvoFit-backup-${today()}.json`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Exportar backup
            </Action>
          </Panel>
        </>
      );
    return <div className="legacy-module">{body}</div>;
  }
  return (
    <div className="coach-shell">
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`coach-sidebar ${mobileOpen ? "open" : ""}`}>
        <Brand />
        <button
          className="mobile-menu-close icon-button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">
          <span className="workspace-monogram">
            {(profile.nomeNegocio || "Meu espaço").slice(0, 2).toUpperCase()}
          </span>
          <span>
            <strong>{profile.nomeNegocio}</strong>
            <small>Seu espaço de acompanhamento</small>
          </span>
        </div>
        <div className="sidebar-section-label">ESPAÇO DE TRABALHO</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={activeTab === item.key ? "active" : ""}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {item.key === "alunos" && <small>{students.length}</small>}
              {activeTab === item.key && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="sidebar-note-icon">
            <Target size={21} />
            <span>Feito para acompanhar.</span>
          </div>
          <p>
            Um objetivo por aluno.
            <br />
            Um olhar para cada jornada.
          </p>
          <button onClick={() => navigate("alunos")}>
            Conhecer os painéis
            <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-user">
          <Avatar name={profile.personalNome} index={2} />
          <span>
            <strong>{profile.personalNome}</strong>
            <small>Personal trainer</small>
          </span>
          {onSignOut && (
            <button aria-label="Sair" className="icon-button" onClick={signOut}>
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>
      <div className="coach-body">
        <header className="coach-header">
          <div>
            <button
              className="mobile-menu-button icon-button"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Seu espaço <ChevronRight size={12} />
              <strong>
                {navItems.find((n) => n.key === activeTab)?.label ||
                  "Novo aluno"}
              </strong>
            </span>
          </div>
          <div>
            <span className="header-date">
              {new Date().toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                weekday: "short",
              })}
            </span>
            <span className={`sync-status ${cloudStatus}`}>
              <span />
              {cloudStatus === "online"
                ? "Salvo na nuvem"
                : cloudStatus === "syncing"
                  ? "Salvando…"
                  : cloudStatus === "error"
                    ? "Salvar novamente"
                    : "Demonstração"}
            </span>
            <button
              className="header-avatar"
              aria-label="Abrir configurações"
              onClick={() => navigate("config")}
            >
              <Avatar name={profile.personalNome} index={2} />
            </button>
          </div>
        </header>
        {!session && (
          <div className="demo-notice">
            <span className="live-dot" />
            Demonstração · os registros ficam neste navegador. Acesso online dos
            alunos disponível após configurar o Supabase.
          </div>
        )}
        {storageError && (
          <p className="notice error" role="alert">
            Seu navegador não conseguiu guardar os dados. Exporte um backup nas
            configurações antes de fechar.
          </p>
        )}
        {signOutError && (
          <p className="notice error" role="alert">
            {signOutError}
          </p>
        )}
        {session && remote.error && (
          <p className="notice error" role="alert">
            {remote.error}
          </p>
        )}
        <main className="coach-content">{content()}</main>
        <footer className="coach-footer">
          <span>
            EVOFIT PRO <b>© {new Date().getFullYear()}</b>
          </span>
          <span>O próximo passo de cada aluno começa com você.</span>
        </footer>
      </div>
      {managedStudent && (
        <StudentManager
          key={managedStudent.id}
          student={managedStudent}
          state={state}
          setStudents={setStudents}
          session={session}
          flush={flush}
          initialTab={manager.tab}
          onClose={() => setManager(null)}
          onPreview={openPreview}
          onNavigate={navigate}
          onCoachMessage={coachMessage}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CloudGateway
      storage={storage}
      render={(props) => (
        <DashboardApp key={props.session?.user?.id || "demo"} {...props} />
      )}
    />
  );
}

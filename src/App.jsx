import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
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

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "alunos", label: "Alunos", icon: Users },
  { key: "avaliacoes", label: "Avaliações", icon: ClipboardList },
  { key: "treinos", label: "Treinos", icon: Dumbbell },
  { key: "agenda", label: "Agenda", icon: CalendarClock },
  { key: "checkins", label: "Check-ins", icon: Activity },
  { key: "financeiro", label: "Financeiro", icon: Wallet },
  { key: "alunoapp", label: "Área do Aluno", icon: UserRound },
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
  { id: 1, alunoId: 101, data: "2026-01-08", peso: 87, gordura: 23, cintura: 94, peito: 105, quadril: 99, observacoes: "Início da consultoria." },
  { id: 2, alunoId: 101, data: "2026-02-10", peso: 85.2, gordura: 19.5, cintura: 90, peito: 106, quadril: 98, observacoes: "Evolução consistente." },
  { id: 3, alunoId: 101, data: "2026-03-12", peso: 84, gordura: 17, cintura: 87, peito: 108, quadril: 97, observacoes: "Ótimo ganho de composição corporal." },
  { id: 4, alunoId: 102, data: "2026-02-02", peso: 71.5, gordura: 28, cintura: 84, peito: 92, quadril: 103, observacoes: "Começo do plano online." },
  { id: 5, alunoId: 102, data: "2026-03-15", peso: 68, gordura: 24, cintura: 80, peito: 90, quadril: 100, observacoes: "Boa resposta ao cardio e déficit controlado." },
  { id: 6, alunoId: 103, data: "2026-01-09", peso: 64.5, gordura: 23, cintura: 76, peito: 88, quadril: 102, observacoes: "Objetivo em foco de membros inferiores." },
  { id: 7, alunoId: 103, data: "2026-03-17", peso: 62, gordura: 20, cintura: 73, peito: 89, quadril: 104, observacoes: "Ganho de definição com bom volume de glúteo." },
  { id: 8, alunoId: 104, data: "2026-01-20", peso: 93, gordura: 24, cintura: 99, peito: 107, quadril: 101, observacoes: "Condicionamento baixo no início." },
  { id: 9, alunoId: 104, data: "2026-03-09", peso: 91, gordura: 21, cintura: 96, peito: 108, quadril: 100, observacoes: "Melhora no cardio e resistência." },
];

const initialExercises = [
  { id: 1, nome: "Agachamento livre", grupo: "Pernas", dificuldade: "Intermediário", equipamento: "Barra", video: "Demo" },
  { id: 2, nome: "Supino reto", grupo: "Peito", dificuldade: "Intermediário", equipamento: "Barra", video: "Demo" },
  { id: 3, nome: "Remada curvada", grupo: "Costas", dificuldade: "Intermediário", equipamento: "Barra", video: "Demo" },
  { id: 4, nome: "Levantamento terra romeno", grupo: "Posterior", dificuldade: "Avançado", equipamento: "Barra", video: "Demo" },
  { id: 5, nome: "Bike HIIT", grupo: "Cardio", dificuldade: "Livre", equipamento: "Bike", video: "Demo" },
  { id: 6, nome: "Elevação lateral", grupo: "Ombros", dificuldade: "Iniciante", equipamento: "Halter", video: "Demo" },
];

const initialWorkouts = [
  {
    id: 1,
    alunoId: 101,
    nome: "Treino A",
    foco: "Peito + tríceps",
    dias: "Segunda e quinta",
    exercicios: ["Supino reto 4x10", "Supino inclinado 3x12", "Crucifixo 3x12", "Tríceps corda 4x12", "Mergulho banco 3x falha"],
    status: "Ativo",
  },
  {
    id: 2,
    alunoId: 101,
    nome: "Treino B",
    foco: "Costas + bíceps",
    dias: "Terça e sexta",
    exercicios: ["Puxada alta 4x10", "Remada baixa 4x12", "Rosca direta 3x12", "Rosca martelo 3x12"],
    status: "Ativo",
  },
  {
    id: 3,
    alunoId: 102,
    nome: "Treino Online 1",
    foco: "Cardio + pernas",
    dias: "Segunda, quarta e sexta",
    exercicios: ["Agachamento livre 4x12", "Afundo 3x12", "Bike HIIT 12 min", "Prancha 3x40s"],
    status: "Ativo",
  },
  {
    id: 4,
    alunoId: 103,
    nome: "Treino C",
    foco: "Inferiores e glúteos",
    dias: "Terça e quinta",
    exercicios: ["Agachamento livre 5x8", "Leg press 4x12", "Stiff 4x10", "Abdutora 4x15", "Elevação pélvica 4x12"],
    status: "Ativo",
  },
];

const initialAgenda = [
  { id: 1, alunoId: 101, data: "2026-03-19", hora: "08:00", tipo: "Avaliação física", local: "Academia Prime", status: "Confirmado" },
  { id: 2, alunoId: 102, data: "2026-03-19", hora: "11:30", tipo: "Check-in online", local: "Google Meet", status: "Confirmado" },
  { id: 3, alunoId: 103, data: "2026-03-19", hora: "17:00", tipo: "Treino presencial", local: "Studio EVO", status: "Confirmado" },
  { id: 4, alunoId: 104, data: "2026-03-20", hora: "19:00", tipo: "Reavaliação", local: "Studio EVO", status: "Pendente" },
];

const initialPayments = [
  { id: 1, alunoId: 101, descricao: "Mensalidade março", valor: 350, vencimento: "2026-03-05", status: "Pago", forma: "Pix" },
  { id: 2, alunoId: 102, descricao: "Consultoria março", valor: 250, vencimento: "2026-03-10", status: "Pendente", forma: "Pix" },
  { id: 3, alunoId: 103, descricao: "Plano presencial março", valor: 380, vencimento: "2026-03-08", status: "Pago", forma: "Cartão" },
  { id: 4, alunoId: 104, descricao: "Plano híbrido março", valor: 320, vencimento: "2026-03-11", status: "Pago", forma: "Pix" },
];

const initialCheckins = [
  { id: 1, alunoId: 101, data: "2026-03-16", humor: "Excelente", energia: "Alta", sono: "8h", dieta: "85%", observacoes: "Subi carga no supino e mantive cardio.", resposta: "Excelente semana. Vamos manter progressão controlada." },
  { id: 2, alunoId: 102, data: "2026-03-17", humor: "Boa", energia: "Média", sono: "6h", dieta: "80%", observacoes: "Fiz os treinos, mas senti joelho no afundo.", resposta: "Vamos trocar afundo por cadeira extensora e focar mobilidade." },
  { id: 3, alunoId: 103, data: "2026-03-14", humor: "Excelente", energia: "Alta", sono: "7h", dieta: "90%", observacoes: "Glúteo queimando bonito e sem dor.", resposta: "Ótimo. Na próxima semana vamos subir volume." },
];

const initialProfile = {
  nomeNegocio: "EvoFit Pro Studio",
  personalNome: "Jater Jr",
  cref: "CREF 000000-G/MG",
  whatsapp: "(32) 98428-5414",
  email: "contato@evofitpro.com",
  planoPadrao: "Híbrido",
  mensagemBoasVindas: "Bem-vindo ao seu novo ciclo. Vamos evoluir com constância.",
};

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-sm ${className}`}>{children}</div>;
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
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
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

function Input({ label, value, onChange, type = "text", placeholder = "", min, step }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">{label}</label>
      <input
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
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">{label}</label>
      <select value={value} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
      />
    </div>
  );
}

function Button({ children, onClick, type = "button", tone = "primary", className = "" }) {
  const styles = {
    primary: "bg-emerald-400 text-zinc-950 hover:opacity-90",
    secondary: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
  };
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition ${styles[tone]} ${className}`}>
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

function DashboardView({ students, evaluations, payments, agenda, checkins }) {
  const activeStudents = students.filter((student) => student.status === "Ativo").length;
  const paidAmount = payments.filter((item) => item.status === "Pago").reduce((sum, item) => sum + Number(item.valor), 0);
  const pendingAmount = payments.filter((item) => item.status === "Pendente").reduce((sum, item) => sum + Number(item.valor), 0);
  const onlineCount = students.filter((student) => ["Online", "Híbrido"].includes(student.plano)).length;

  const revenueByMonth = useMemo(() => {
    const grouped = {};
    payments.forEach((item) => {
      const [year, month] = item.vencimento.split("-");
      const key = `${month}/${year.slice(-2)}`;
      grouped[key] = (grouped[key] || 0) + Number(item.valor);
    });
    return Object.entries(grouped).map(([mes, valor]) => ({ mes, valor }));
  }, [payments]);

  const bestStudents = useMemo(() => {
    return [...students].sort((a, b) => b.adesao - a.adesao).slice(0, 3);
  }, [students]);

  const evolutionChart = useMemo(() => {
    const lucasData = evaluations
      .filter((item) => item.alunoId === 101)
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((item) => ({
        data: formatDate(item.data).slice(0, 5),
        peso: item.peso,
        gordura: item.gordura,
      }));
    return lucasData;
  }, [evaluations]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Alunos ativos" value={activeStudents} meta="Base completa do sistema" icon={Users} />
        <StatCard title="Consultorias online" value={onlineCount} meta="Online + híbrido" icon={Activity} />
        <StatCard title="Recebido" value={formatCurrency(paidAmount)} meta="Faturamento confirmado" icon={Wallet} />
        <StatCard title="Em aberto" value={formatCurrency(pendingAmount)} meta="Acompanhar cobranças" icon={CreditCard} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="p-5">
          <SectionTitle title="Evolução corporal" subtitle="Exemplo do gráfico de progresso do aluno" action={<Badge tone="info">Lucas Martins</Badge>} />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="data" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip />
                <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="gordura" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Radar do dia" subtitle="O que merece ação agora" />
          <div className="space-y-4">
            {[
              { icon: Bell, title: `${checkins.length} check-ins recebidos`, text: "Acompanhe alimentação, sono e feedback dos alunos." },
              { icon: CalendarDays, title: `${agenda.length} compromissos registrados`, text: "Agenda completa de avaliações, retornos e treinos." },
              { icon: Dumbbell, title: "Treinos prontos", text: "Monte fichas individuais e veja a área do aluno." },
              { icon: Wallet, title: `${payments.filter((item) => item.status === "Pendente").length} cobrança pendente`, text: "Controle financeiro simples, direto e visual." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-zinc-400">{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1.15fr_0.8fr]">
        <Card className="p-5">
          <SectionTitle title="Agenda próxima" subtitle="Compromissos e retornos" />
          <div className="space-y-3">
            {agenda.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="font-medium text-white">{students.find((student) => student.id === item.alunoId)?.nome || "Aluno"}</p>
                  <p className="text-sm text-zinc-400">{item.tipo} • {item.local}</p>
                </div>
                <Badge tone="info">{formatDate(item.data)} • {item.hora}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Receita por vencimento" subtitle="Visão simples do caixa" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="mes" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="#34d399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Top adesão" subtitle="Quem está voando" />
          <div className="space-y-3">
            {bestStudents.map((student, index) => (
              <div key={student.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{index + 1}. {student.nome}</p>
                    <p className="text-sm text-zinc-400">{student.objetivo}</p>
                  </div>
                  <Badge tone="success">{student.adesao}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StudentsView({ students, setStudents, selectedStudentId, setSelectedStudentId, evaluations, workouts, payments, checkins }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    plano: "Híbrido",
    objetivo: "Hipertrofia",
    academia: "",
    restricoes: "",
    observacoes: "",
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => student.nome.toLowerCase().includes(search.toLowerCase()));
  }, [students, search]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const selectedEvaluations = evaluations.filter((item) => item.alunoId === selectedStudent?.id).sort((a, b) => b.data.localeCompare(a.data));
  const latestEvaluation = selectedEvaluations[0];
  const selectedWorkouts = workouts.filter((item) => item.alunoId === selectedStudent?.id);
  const selectedPayments = payments.filter((item) => item.alunoId === selectedStudent?.id);
  const selectedCheckins = checkins.filter((item) => item.alunoId === selectedStudent?.id);

  function addStudent(event) {
    event.preventDefault();
    if (!form.nome.trim()) return;
    const newStudent = {
      id: Date.now(),
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      plano: form.plano,
      objetivo: form.objetivo,
      status: "Ativo",
      genero: "Não informado",
      nascimento: "",
      academia: form.academia,
      restricoes: form.restricoes,
      observacoes: form.observacoes,
      entrada: new Date().toISOString().slice(0, 10),
      adesao: 0,
      treinoHoje: "Ainda não montado",
      ultimoCheckin: "-",
    };
    setStudents([newStudent, ...students]);
    setSelectedStudentId(newStudent.id);
    setForm({ nome: "", email: "", telefone: "", plano: "Híbrido", objetivo: "Hipertrofia", academia: "", restricoes: "", observacoes: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle title="Cadastrar aluno" subtitle="Base do sistema do personal" />
          <form onSubmit={addStudent} className="space-y-4">
            <Input label="Nome do aluno" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: João Pedro" />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="aluno@email.com" />
              <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(32) 99999-9999" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Plano" value={form.plano} onChange={(e) => setForm({ ...form, plano: e.target.value })} options={["Online", "Presencial", "Híbrido"]} />
              <Select label="Objetivo" value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} options={["Hipertrofia", "Emagrecimento", "Condicionamento", "Definição", "Reabilitação", "Glúteos e pernas"]} />
            </div>
            <Input label="Academia / local" value={form.academia} onChange={(e) => setForm({ ...form, academia: e.target.value })} placeholder="Studio, academia ou casa" />
            <Textarea label="Restrições" value={form.restricoes} onChange={(e) => setForm({ ...form, restricoes: e.target.value })} placeholder="Lesões, dores, observações médicas" />
            <Textarea label="Observações do personal" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Pontos importantes do aluno" />
            <Button type="submit"><Plus className="h-4 w-4" /> Cadastrar aluno</Button>
          </form>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Lista de alunos"
            subtitle="Busque e selecione para ver os detalhes"
            action={
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar aluno"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white outline-none placeholder:text-zinc-500"
                />
              </div>
            }
          />
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedStudent?.id === student.id ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/20 hover:border-white/20"}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-white">{student.nome}</p>
                      <Badge tone="success">{student.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{student.plano} • {student.objetivo}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="info">{student.treinoHoje}</Badge>
                    <Badge>{student.adesao}% adesão</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        {selectedStudent ? (
          <>
            <SectionTitle title="Perfil do aluno" subtitle="Ficha central com informações do acompanhamento" action={<Badge tone="info">Selecionado</Badge>} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Plano</p>
                <p className="mt-2 font-semibold text-white">{selectedStudent.plano}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Objetivo</p>
                <p className="mt-2 font-semibold text-white">{selectedStudent.objetivo}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Adesão</p>
                <p className="mt-2 font-semibold text-white">{selectedStudent.adesao}%</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Contato</p>
                <p className="mt-2 text-white">{selectedStudent.email || "Sem e-mail"}</p>
                <p className="mt-1 text-zinc-400">{selectedStudent.telefone || "Sem telefone"}</p>
                <p className="mt-1 text-zinc-500">{selectedStudent.academia || "Sem local definido"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Restrições e observações</p>
                <p className="mt-2 text-white">{selectedStudent.restricoes || "Sem restrições."}</p>
                <p className="mt-3 text-sm text-zinc-400">{selectedStudent.observacoes || "Sem observações."}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Última avaliação</p>
                {latestEvaluation ? (
                  <>
                    <p className="mt-2 text-2xl font-bold text-white">{latestEvaluation.peso} kg</p>
                    <p className="text-sm text-emerald-400">{latestEvaluation.gordura}% gordura</p>
                    <p className="mt-3 text-sm text-zinc-400">{formatDate(latestEvaluation.data)}</p>
                  </>
                ) : (
                  <p className="mt-2 text-zinc-400">Sem avaliação cadastrada.</p>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Treinos ativos</p>
                <p className="mt-2 text-2xl font-bold text-white">{selectedWorkouts.length}</p>
                <p className="mt-3 text-sm text-zinc-400">{selectedStudent.treinoHoje}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Financeiro</p>
                <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(selectedPayments.reduce((sum, item) => sum + Number(item.valor), 0))}</p>
                <p className="mt-3 text-sm text-zinc-400">{selectedPayments.filter((item) => item.status === "Pendente").length} pendência(s)</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div>
                <p className="mb-3 font-semibold text-white">Treinos</p>
                <div className="space-y-3">
                  {selectedWorkouts.length ? selectedWorkouts.map((workout) => (
                    <div key={workout.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{workout.nome}</p>
                        <Badge tone="success">{workout.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{workout.foco} • {workout.dias}</p>
                    </div>
                  )) : <EmptyState title="Sem treinos" text="Cadastre um treino para este aluno no módulo Treinos." />}
                </div>
              </div>
              <div>
                <p className="mb-3 font-semibold text-white">Check-ins</p>
                <div className="space-y-3">
                  {selectedCheckins.length ? selectedCheckins.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{formatDate(item.data)}</p>
                        <Badge tone="info">{item.humor}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">{item.observacoes}</p>
                    </div>
                  )) : <EmptyState title="Sem check-ins" text="Este aluno ainda não enviou acompanhamento." />}
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="Nenhum aluno selecionado" text="Escolha um aluno na lista para abrir a ficha." />
        )}
      </Card>
    </div>
  );
}

function EvaluationsView({ students, selectedStudentId, setSelectedStudentId, evaluations, setEvaluations }) {
  const [form, setForm] = useState({ alunoId: String(selectedStudentId || students[0]?.id || ""), data: "2026-03-19", peso: "", gordura: "", cintura: "", peito: "", quadril: "", observacoes: "" });

  useEffect(() => {
    if (selectedStudentId) {
      setForm((current) => ({ ...current, alunoId: String(selectedStudentId) }));
    }
  }, [selectedStudentId]);

  const selectedStudent = students.find((student) => student.id === Number(form.alunoId));
  const studentEvaluations = evaluations.filter((item) => item.alunoId === Number(form.alunoId)).sort((a, b) => a.data.localeCompare(b.data));
  const chartData = studentEvaluations.map((item) => ({ data: formatDate(item.data).slice(0, 5), peso: item.peso, gordura: item.gordura }));

  function addEvaluation(event) {
    event.preventDefault();
    if (!form.alunoId || !form.data) return;
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
    setForm({ ...form, peso: "", gordura: "", cintura: "", peito: "", quadril: "", observacoes: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle title="Nova avaliação" subtitle="Peso, medidas e evolução física" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
            <select value={form.alunoId} onChange={(e) => setForm({ ...form, alunoId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.nome}</option>
              ))}
            </select>
          </div>
          <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          <Input label="Peso (kg)" type="number" step="0.1" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
          <Input label="% gordura" type="number" step="0.1" value={form.gordura} onChange={(e) => setForm({ ...form, gordura: e.target.value })} />
          <Input label="Cintura (cm)" type="number" value={form.cintura} onChange={(e) => setForm({ ...form, cintura: e.target.value })} />
          <Input label="Peito (cm)" type="number" value={form.peito} onChange={(e) => setForm({ ...form, peito: e.target.value })} />
          <Input label="Quadril (cm)" type="number" value={form.quadril} onChange={(e) => setForm({ ...form, quadril: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Leitura da avaliação, ajustes e pontos de atenção" />
        </div>
        <Button onClick={addEvaluation} className="mt-4"><Plus className="h-4 w-4" /> Salvar avaliação</Button>
      </Card>

      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle title="Gráfico do aluno" subtitle={selectedStudent ? `Histórico de ${selectedStudent.nome}` : "Selecione um aluno"} />
          {chartData.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="data" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={3} />
                  <Line type="monotone" dataKey="gordura" stroke="#22d3ee" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Sem histórico" text="Cadastre a primeira avaliação para gerar o gráfico." />
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle title="Histórico de avaliações" subtitle="Linha do tempo do progresso" />
          <div className="space-y-3">
            {studentEvaluations.length ? [...studentEvaluations].sort((a, b) => b.data.localeCompare(a.data)).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-white">{formatDate(item.data)}</p>
                    <p className="text-sm text-zinc-400">Peso {item.peso} kg • Gordura {item.gordura}% • Cintura {item.cintura} cm</p>
                  </div>
                  <Badge tone="success">{selectedStudent?.nome || "Aluno"}</Badge>
                </div>
                {item.observacoes ? <p className="mt-3 text-sm text-zinc-400">{item.observacoes}</p> : null}
              </div>
            )) : <EmptyState title="Nada por aqui" text="Ainda não existem avaliações para este aluno." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function WorkoutsView({ students, selectedStudentId, setSelectedStudentId, workouts, setWorkouts, exercises, setExercises }) {
  const [exerciseForm, setExerciseForm] = useState({ nome: "", grupo: "Pernas", dificuldade: "Iniciante", equipamento: "Livre" });
  const [workoutForm, setWorkoutForm] = useState({
    alunoId: String(selectedStudentId || students[0]?.id || ""),
    nome: "Treino Novo",
    foco: "Hipertrofia",
    dias: "Segunda e quinta",
    exercicios: "Agachamento livre 4x10\nSupino reto 4x10",
  });

  useEffect(() => {
    if (selectedStudentId) {
      setWorkoutForm((current) => ({ ...current, alunoId: String(selectedStudentId) }));
    }
  }, [selectedStudentId]);

  const selectedStudent = students.find((student) => student.id === Number(workoutForm.alunoId));
  const selectedWorkouts = workouts.filter((item) => item.alunoId === Number(workoutForm.alunoId));

  function addExercise(event) {
    event.preventDefault();
    if (!exerciseForm.nome.trim()) return;
    setExercises([{ id: Date.now(), ...exerciseForm, video: "Demo" }, ...exercises]);
    setExerciseForm({ nome: "", grupo: "Pernas", dificuldade: "Iniciante", equipamento: "Livre" });
  }

  function addWorkout(event) {
    event.preventDefault();
    if (!workoutForm.alunoId || !workoutForm.nome.trim()) return;
    const newWorkout = {
      id: Date.now(),
      alunoId: Number(workoutForm.alunoId),
      nome: workoutForm.nome,
      foco: workoutForm.foco,
      dias: workoutForm.dias,
      exercicios: workoutForm.exercicios.split("\n").map((item) => item.trim()).filter(Boolean),
      status: "Ativo",
    };
    setWorkouts([newWorkout, ...workouts]);
    setSelectedStudentId(Number(workoutForm.alunoId));
    setWorkoutForm({ ...workoutForm, nome: "Treino Novo", foco: "Hipertrofia", dias: "Segunda e quinta", exercicios: "Agachamento livre 4x10\nSupino reto 4x10" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle title="Biblioteca de exercícios" subtitle="Monte sua base personalizada" />
          <form onSubmit={addExercise} className="space-y-4">
            <Input label="Nome do exercício" value={exerciseForm.nome} onChange={(e) => setExerciseForm({ ...exerciseForm, nome: e.target.value })} placeholder="Ex: Leg press 45" />
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Grupo muscular" value={exerciseForm.grupo} onChange={(e) => setExerciseForm({ ...exerciseForm, grupo: e.target.value })} options={["Pernas", "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Cardio", "Core"]} />
              <Select label="Dificuldade" value={exerciseForm.dificuldade} onChange={(e) => setExerciseForm({ ...exerciseForm, dificuldade: e.target.value })} options={["Iniciante", "Intermediário", "Avançado", "Livre"]} />
            </div>
            <Input label="Equipamento" value={exerciseForm.equipamento} onChange={(e) => setExerciseForm({ ...exerciseForm, equipamento: e.target.value })} placeholder="Ex: barra, halter, bike" />
            <Button type="submit"><Plus className="h-4 w-4" /> Adicionar exercício</Button>
          </form>

          <div className="mt-6 grid gap-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3">
                <div>
                  <p className="font-medium text-white">{exercise.nome}</p>
                  <p className="text-sm text-zinc-400">{exercise.grupo} • {exercise.equipamento}</p>
                </div>
                <Badge tone="info">{exercise.dificuldade}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle title="Montar treino" subtitle="Crie fichas por aluno" />
          <form onSubmit={addWorkout} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
                <select value={workoutForm.alunoId} onChange={(e) => setWorkoutForm({ ...workoutForm, alunoId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.nome}</option>
                  ))}
                </select>
              </div>
              <Input label="Nome do treino" value={workoutForm.nome} onChange={(e) => setWorkoutForm({ ...workoutForm, nome: e.target.value })} />
              <Input label="Foco" value={workoutForm.foco} onChange={(e) => setWorkoutForm({ ...workoutForm, foco: e.target.value })} />
              <Input label="Dias" value={workoutForm.dias} onChange={(e) => setWorkoutForm({ ...workoutForm, dias: e.target.value })} placeholder="Ex: Seg, Qua, Sex" />
            </div>
            <Textarea label="Exercícios" value={workoutForm.exercicios} onChange={(e) => setWorkoutForm({ ...workoutForm, exercicios: e.target.value })} placeholder="Um exercício por linha" />
            <Button type="submit"><Plus className="h-4 w-4" /> Salvar treino</Button>
          </form>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Treinos do aluno" subtitle={selectedStudent ? `${selectedStudent.nome} selecionado` : "Selecione um aluno"} />
          <div className="space-y-3">
            {selectedWorkouts.length ? selectedWorkouts.map((workout) => (
              <div key={workout.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{workout.nome}</p>
                    <p className="text-sm text-zinc-400">{workout.foco} • {workout.dias}</p>
                  </div>
                  <Badge tone="success">{workout.status}</Badge>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {workout.exercicios.map((exercise) => (
                    <div key={exercise} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">{exercise}</div>
                  ))}
                </div>
              </div>
            )) : <EmptyState title="Sem treino ainda" text="Crie a primeira ficha para este aluno." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AgendaView({ students, agenda, setAgenda }) {
  const [form, setForm] = useState({ alunoId: String(students[0]?.id || ""), data: "2026-03-21", hora: "08:00", tipo: "Avaliação física", local: "Studio EVO", status: "Confirmado" });

  function addAgenda(event) {
    event.preventDefault();
    const newItem = { id: Date.now(), alunoId: Number(form.alunoId), data: form.data, hora: form.hora, tipo: form.tipo, local: form.local, status: form.status };
    setAgenda([newItem, ...agenda].sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`)));
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
        <SectionTitle title="Novo compromisso" subtitle="Agenda do personal organizada" />
        <form onSubmit={addAgenda} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
            <select value={form.alunoId} onChange={(e) => setForm({ ...form, alunoId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.nome}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <Input label="Hora" type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            <Input label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
            <Input label="Local" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={["Confirmado", "Pendente", "Concluído"]} />
          <Button type="submit"><Plus className="h-4 w-4" /> Adicionar compromisso</Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Calendário simplificado" subtitle="Visual por dia" />
        <div className="space-y-6">
          {groupedAgenda.length ? groupedAgenda.map(([date, items]) => (
            <div key={date}>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">{formatDate(date)}</p>
              <div className="space-y-3">
                {items.sort((a, b) => a.hora.localeCompare(b.hora)).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{students.find((student) => student.id === item.alunoId)?.nome || "Aluno"}</p>
                        <p className="text-sm text-zinc-400">{item.tipo} • {item.local}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="info">{item.hora}</Badge>
                        <Badge tone={item.status === "Pendente" ? "warn" : "success"}>{item.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : <EmptyState title="Agenda vazia" text="Cadastre o primeiro compromisso do dia." />}
        </div>
      </Card>
    </div>
  );
}

function CheckinsView({ students, checkins, setCheckins }) {
  const [form, setForm] = useState({ alunoId: String(students[0]?.id || ""), data: "2026-03-19", humor: "Boa", energia: "Média", sono: "7h", dieta: "80%", observacoes: "", resposta: "" });

  function addCheckin(event) {
    event.preventDefault();
    const newCheckin = { id: Date.now(), alunoId: Number(form.alunoId), ...form };
    setCheckins([newCheckin, ...checkins]);
    setForm({ ...form, observacoes: "", resposta: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle title="Novo check-in" subtitle="Modelo do acompanhamento online" />
        <form onSubmit={addCheckin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
            <select value={form.alunoId} onChange={(e) => setForm({ ...form, alunoId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.nome}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <Select label="Humor" value={form.humor} onChange={(e) => setForm({ ...form, humor: e.target.value })} options={["Excelente", "Boa", "Média", "Baixa"]} />
            <Select label="Energia" value={form.energia} onChange={(e) => setForm({ ...form, energia: e.target.value })} options={["Alta", "Média", "Baixa"]} />
            <Input label="Sono" value={form.sono} onChange={(e) => setForm({ ...form, sono: e.target.value })} placeholder="Ex: 7h" />
            <Input label="Dieta" value={form.dieta} onChange={(e) => setForm({ ...form, dieta: e.target.value })} placeholder="Ex: 85%" />
          </div>
          <Textarea label="Observações do aluno" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Como foi a semana, dores, treinos, alimentação..." />
          <Textarea label="Resposta do personal" value={form.resposta} onChange={(e) => setForm({ ...form, resposta: e.target.value })} placeholder="Ajustes e feedback do profissional" />
          <Button type="submit"><Plus className="h-4 w-4" /> Salvar check-in</Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Linha do tempo de check-ins" subtitle="Leitura rápida e prática" />
        <div className="space-y-3">
          {checkins.length ? checkins.map((item) => {
            const student = students.find((student) => student.id === item.alunoId);
            return (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{student?.nome || "Aluno"}</p>
                    <p className="text-sm text-zinc-400">{formatDate(item.data)} • Sono {item.sono} • Dieta {item.dieta}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="info">Humor {item.humor}</Badge>
                    <Badge tone="success">Energia {item.energia}</Badge>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Aluno</p>
                    <p className="mt-2 text-sm text-zinc-200">{item.observacoes}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                    <p className="text-xs uppercase tracking-wide text-emerald-300">Personal</p>
                    <p className="mt-2 text-sm text-white">{item.resposta || "Sem resposta ainda."}</p>
                  </div>
                </div>
              </div>
            );
          }) : <EmptyState title="Sem check-ins" text="Cadastre o primeiro acompanhamento semanal." />}
        </div>
      </Card>
    </div>
  );
}

function FinanceView({ students, payments, setPayments }) {
  const [form, setForm] = useState({ alunoId: String(students[0]?.id || ""), descricao: "Mensalidade", valor: "350", vencimento: "2026-03-25", status: "Pendente", forma: "Pix" });

  function addPayment(event) {
    event.preventDefault();
    const newPayment = { id: Date.now(), alunoId: Number(form.alunoId), descricao: form.descricao, valor: Number(form.valor), vencimento: form.vencimento, status: form.status, forma: form.forma };
    setPayments([newPayment, ...payments]);
  }

  const totals = useMemo(() => {
    const total = payments.reduce((sum, item) => sum + Number(item.valor), 0);
    const paid = payments.filter((item) => item.status === "Pago").reduce((sum, item) => sum + Number(item.valor), 0);
    const pending = payments.filter((item) => item.status === "Pendente").reduce((sum, item) => sum + Number(item.valor), 0);
    return { total, paid, pending };
  }, [payments]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Faturamento total" value={formatCurrency(totals.total)} meta="Soma geral cadastrada" icon={TrendingUp} />
        <StatCard title="Recebido" value={formatCurrency(totals.paid)} meta="Entradas confirmadas" icon={Wallet} />
        <StatCard title="A receber" value={formatCurrency(totals.pending)} meta="Pendências do mês" icon={CreditCard} />
        <StatCard title="Mensalidades" value={payments.length} meta="Registros cadastrados" icon={Target} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <SectionTitle title="Novo lançamento" subtitle="Controle financeiro do personal" />
          <form onSubmit={addPayment} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Aluno</label>
              <select value={form.alunoId} onChange={(e) => setForm({ ...form, alunoId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.nome}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <Input label="Valor" type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
              <Input label="Vencimento" type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={["Pendente", "Pago"]} />
            </div>
            <Select label="Forma de pagamento" value={form.forma} onChange={(e) => setForm({ ...form, forma: e.target.value })} options={["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"]} />
            <Button type="submit"><Plus className="h-4 w-4" /> Salvar lançamento</Button>
          </form>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Pagamentos" subtitle="Visual por aluno e status" />
          <div className="space-y-3">
            {payments.map((item) => {
              const student = students.find((student) => student.id === item.alunoId);
              return (
                <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{student?.nome || "Aluno"}</p>
                    <p className="text-sm text-zinc-400">{item.descricao} • Vence em {formatDate(item.vencimento)} • {item.forma}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">{formatCurrency(item.valor)}</p>
                    <Badge tone={item.status === "Pago" ? "success" : "warn"}>{item.status}</Badge>
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

function StudentAreaView({ students, selectedStudentId, setSelectedStudentId, workouts, evaluations, payments, checkins, profile }) {
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const studentWorkouts = workouts.filter((item) => item.alunoId === selectedStudent?.id);
  const latestWorkout = studentWorkouts[0];
  const studentEvaluations = evaluations.filter((item) => item.alunoId === selectedStudent?.id).sort((a, b) => b.data.localeCompare(a.data));
  const latestEvaluation = studentEvaluations[0];
  const studentPayments = payments.filter((item) => item.alunoId === selectedStudent?.id);
  const studentCheckins = checkins.filter((item) => item.alunoId === selectedStudent?.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <Card className="p-5">
        <SectionTitle title="Simular aluno" subtitle="Veja a experiência do cliente no app" />
        <div className="space-y-3">
          {students.map((student) => (
            <button key={student.id} onClick={() => setSelectedStudentId(student.id)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${selectedStudent?.id === student.id ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/20"}`}>
              <div>
                <p className="font-medium text-white">{student.nome}</p>
                <p className="text-sm text-zinc-400">{student.plano} • {student.objetivo}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        {selectedStudent ? (
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 shadow-2xl shadow-black/30">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-400">{profile.mensagemBoasVindas}</p>
                <h3 className="text-3xl font-bold text-white">{selectedStudent.nome}</h3>
                <p className="mt-1 text-sm text-zinc-400">{selectedStudent.objetivo} • {selectedStudent.plano}</p>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-300">
                <HeartPulse className="h-8 w-8" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Treino de hoje</p>
                <p className="mt-2 font-medium text-white">{selectedStudent.treinoHoje}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Adesão</p>
                <p className="mt-2 font-medium text-white">{selectedStudent.adesao}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Última avaliação</p>
                <p className="mt-2 font-medium text-white">{latestEvaluation ? `${latestEvaluation.peso} kg` : "Sem dados"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Mensalidade</p>
                <p className="mt-2 font-medium text-white">{studentPayments[0] ? studentPayments[0].status : "Sem lançamento"}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="mb-3 text-sm font-semibold text-zinc-300">Ficha ativa</p>
                {latestWorkout ? (
                  <div className="space-y-3">
                    {latestWorkout.exercicios.map((exercise, index) => (
                      <div key={`${exercise}-${index}`} className={`flex items-center justify-between rounded-2xl border p-3 ${index < 3 ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-black/30"}`}>
                        <span className="text-sm text-white">{exercise}</span>
                        {index < 3 ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Clock3 className="h-4 w-4 text-zinc-500" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Sem treino ativo" text="O personal ainda não vinculou uma ficha para este aluno." />
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">Resumo físico</p>
                  {latestEvaluation ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Peso</p>
                        <p className="mt-2 text-xl font-bold text-white">{latestEvaluation.peso} kg</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Gordura</p>
                        <p className="mt-2 text-xl font-bold text-white">{latestEvaluation.gordura}%</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-400">Sem avaliação cadastrada.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">Último check-in</p>
                  {studentCheckins[0] ? (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="info">Humor {studentCheckins[0].humor}</Badge>
                        <Badge tone="success">Energia {studentCheckins[0].energia}</Badge>
                        <Badge>{studentCheckins[0].sono} sono</Badge>
                      </div>
                      <p className="mt-3 text-sm text-zinc-400">{studentCheckins[0].resposta || studentCheckins[0].observacoes}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-400">Sem check-ins enviados.</p>
                  )}
                </div>

                <Button className="w-full"><BadgeCheck className="h-4 w-4" /> Marcar treino como concluído</Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="Sem aluno selecionado" text="Selecione um aluno na coluna ao lado." />
        )}
      </Card>
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
        <SectionTitle title="Identidade do negócio" subtitle="Ajustes gerais do sistema" />
        <form onSubmit={saveSettings} className="space-y-4">
          <Input label="Nome do negócio" value={form.nomeNegocio} onChange={(e) => setForm({ ...form, nomeNegocio: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome do personal" value={form.personalNome} onChange={(e) => setForm({ ...form, personalNome: e.target.value })} />
            <Input label="CREF" value={form.cref} onChange={(e) => setForm({ ...form, cref: e.target.value })} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <Input label="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Select label="Plano padrão" value={form.planoPadrao} onChange={(e) => setForm({ ...form, planoPadrao: e.target.value })} options={["Online", "Presencial", "Híbrido"]} />
          <Textarea label="Mensagem de boas-vindas" value={form.mensagemBoasVindas} onChange={(e) => setForm({ ...form, mensagemBoasVindas: e.target.value })} />
          <Button type="submit"><NotebookPen className="h-4 w-4" /> Salvar configurações</Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Resumo do sistema" subtitle="O que esta versão já entrega" />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: Users, title: "Cadastro de alunos", text: "Ficha completa com plano, objetivo, contato e observações." },
            { icon: ClipboardList, title: "Avaliações físicas", text: "Peso, medidas, gordura e gráfico de evolução." },
            { icon: Dumbbell, title: "Treinos por aluno", text: "Biblioteca de exercícios e montagem de fichas." },
            { icon: CalendarDays, title: "Agenda", text: "Compromissos presenciais, online e retornos." },
            { icon: Wallet, title: "Financeiro", text: "Mensalidades, status e controle simples de caixa." },
            { icon: UserRound, title: "Área do aluno", text: "Experiência simulada do cliente já dentro do app." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-400/10 p-2 text-emerald-300"><Icon className="h-5 w-5" /></div>
                  <p className="font-semibold text-white">{item.title}</p>
                </div>
                <p className="mt-3 text-sm text-zinc-400">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm text-emerald-300">Próxima camada</p>
          <p className="mt-2 text-sm leading-6 text-zinc-200">
            Conectar Supabase para login real, banco online, fotos de evolução, notificações e usuários separados por personal.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [students, setStudents] = useLocalStorageState("evofit_students_v2", initialStudents);
  const [evaluations, setEvaluations] = useLocalStorageState("evofit_evaluations_v2", initialEvaluations);
  const [exercises, setExercises] = useLocalStorageState("evofit_exercises_v2", initialExercises);
  const [workouts, setWorkouts] = useLocalStorageState("evofit_workouts_v2", initialWorkouts);
  const [agenda, setAgenda] = useLocalStorageState("evofit_agenda_v2", initialAgenda);
  const [payments, setPayments] = useLocalStorageState("evofit_payments_v2", initialPayments);
  const [checkins, setCheckins] = useLocalStorageState("evofit_checkins_v2", initialCheckins);
  const [profile, setProfile] = useLocalStorageState("evofit_profile_v2", initialProfile);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudents[0].id);

  const activeLabel = navItems.find((item) => item.key === activeTab)?.label || "Dashboard";
  const duePayments = payments.filter((item) => item.status === "Pendente").length;
  const dueAgenda = agenda.filter((item) => item.status !== "Concluído").length;

  function renderContent() {
    if (activeTab === "dashboard") return <DashboardView students={students} evaluations={evaluations} payments={payments} agenda={agenda} checkins={checkins} />;
    if (activeTab === "alunos") return <StudentsView students={students} setStudents={setStudents} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} evaluations={evaluations} workouts={workouts} payments={payments} checkins={checkins} />;
    if (activeTab === "avaliacoes") return <EvaluationsView students={students} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} evaluations={evaluations} setEvaluations={setEvaluations} />;
    if (activeTab === "treinos") return <WorkoutsView students={students} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} workouts={workouts} setWorkouts={setWorkouts} exercises={exercises} setExercises={setExercises} />;
    if (activeTab === "agenda") return <AgendaView students={students} agenda={agenda} setAgenda={setAgenda} />;
    if (activeTab === "checkins") return <CheckinsView students={students} checkins={checkins} setCheckins={setCheckins} />;
    if (activeTab === "financeiro") return <FinanceView students={students} payments={payments} setPayments={setPayments} />;
    if (activeTab === "alunoapp") return <StudentAreaView students={students} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} workouts={workouts} evaluations={evaluations} payments={payments} checkins={checkins} profile={profile} />;
    return <SettingsView profile={profile} setProfile={setProfile} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.14),_transparent_28%),linear-gradient(180deg,#09090b_0%,#111113_100%)] text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-black/30 p-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400 text-lg font-black text-zinc-950 shadow-lg shadow-emerald-900/40">EV</div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">{profile.nomeNegocio}</p>
              <h1 className="text-2xl font-bold text-white">Painel do Personal</h1>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Conta ativa</p>
            <p className="mt-1 font-semibold text-white">{profile.personalNome}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="success">Plano {profile.planoPadrao}</Badge>
              <Badge tone="info">{students.length} alunos</Badge>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active ? "bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-900/30" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-10 space-y-4">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-sm text-emerald-300">Sinal vital do sistema</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">Check-ins ativos</span>
                  <span className="font-semibold text-white">{checkins.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">Agenda pendente</span>
                  <span className="font-semibold text-white">{dueAgenda}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">Cobranças abertas</span>
                  <span className="font-semibold text-white">{duePayments}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-zinc-300">Esta versão salva no navegador.</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Pode testar tudo e jogar no Coolify agora. Na próxima etapa, ligamos banco e login real.</p>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm text-zinc-400">Sistema completo para personal trainer</p>
                  <h2 className="text-2xl font-bold text-white">{activeLabel}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 md:block">Quinta-feira • 19/03/2026</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">{profile.personalNome}</div>
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden">
              <div className="h-full w-80 border-r border-white/10 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">{profile.nomeNegocio}</p>
                    <h3 className="text-xl font-bold text-white">Menu</h3>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-6 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.key;
                    return (
                      <button key={item.key} onClick={() => { setActiveTab(item.key); setMobileOpen(false); }} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active ? "bg-emerald-400 text-zinc-950" : "text-zinc-300 hover:bg-white/5"}`}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <main className="p-4 md:p-8">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

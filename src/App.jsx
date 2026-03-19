import React, { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Dumbbell,
  Home,
  Menu,
  Search,
  UserRound,
  Users,
  Wallet,
  X,
  Plus,
  TrendingUp,
  Bell,
  Target,
  HeartPulse,
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
  { key: "treinos", label: "Treinos", icon: Dumbbell },
  { key: "evolucao", label: "Evolução", icon: BarChart3 },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "financeiro", label: "Financeiro", icon: Wallet },
  { key: "alunoapp", label: "Área do Aluno", icon: UserRound },
];

const initialStudents = [
  {
    id: 1,
    nome: "Lucas Martins",
    plano: "Híbrido",
    objetivo: "Hipertrofia",
    status: "Ativo",
    ultimaAvaliacao: "12/03/2026",
    peso: 84,
    gordura: 17,
    treinoHoje: "Treino A • Peito e tríceps",
    pagamento: "Pago",
  },
  {
    id: 2,
    nome: "Mariana Costa",
    plano: "Online",
    objetivo: "Emagrecimento",
    status: "Ativo",
    ultimaAvaliacao: "15/03/2026",
    peso: 68,
    gordura: 24,
    treinoHoje: "Cardio + inferiores",
    pagamento: "Pendente",
  },
  {
    id: 3,
    nome: "Pedro Henrique",
    plano: "Presencial",
    objetivo: "Condicionamento",
    status: "Ativo",
    ultimaAvaliacao: "09/03/2026",
    peso: 91,
    gordura: 21,
    treinoHoje: "Treino funcional",
    pagamento: "Pago",
  },
  {
    id: 4,
    nome: "Ana Luiza",
    plano: "Híbrido",
    objetivo: "Glúteos e pernas",
    status: "Ativo",
    ultimaAvaliacao: "17/03/2026",
    peso: 62,
    gordura: 20,
    treinoHoje: "Treino C • Inferiores",
    pagamento: "Pago",
  },
];

const evolutionData = [
  { mes: "Out", peso: 87, gordura: 23 },
  { mes: "Nov", peso: 86, gordura: 22 },
  { mes: "Dez", peso: 85, gordura: 21 },
  { mes: "Jan", peso: 84.5, gordura: 20 },
  { mes: "Fev", peso: 84.2, gordura: 18.5 },
  { mes: "Mar", peso: 84, gordura: 17 },
];

const revenueData = [
  { mes: "Jan", valor: 4200 },
  { mes: "Fev", valor: 4800 },
  { mes: "Mar", valor: 5300 },
  { mes: "Abr", valor: 5100 },
  { mes: "Mai", valor: 5900 },
  { mes: "Jun", valor: 6400 },
];

const agendaData = [
  {
    hora: "08:00",
    aluno: "Lucas Martins",
    tipo: "Avaliação física",
    local: "Academia Prime",
  },
  {
    hora: "11:30",
    aluno: "Mariana Costa",
    tipo: "Check-in online",
    local: "Google Meet",
  },
  {
    hora: "17:00",
    aluno: "Pedro Henrique",
    tipo: "Treino presencial",
    local: "Studio EVO",
  },
  {
    hora: "19:00",
    aluno: "Ana Luiza",
    tipo: "Reavaliação",
    local: "Studio EVO",
  },
];

const exerciseLibrary = [
  "Agachamento livre",
  "Supino reto",
  "Levantamento terra romeno",
  "Remada curvada",
  "Cadeira extensora",
  "Elevação lateral",
  "Abdominal infra",
  "Bike HIIT",
];

const checkins = [
  {
    nome: "Mariana Costa",
    humor: "Boa",
    energia: "Média",
    sono: "7h",
    nota: "Treinos feitos, dieta 80% ok.",
  },
  {
    nome: "Lucas Martins",
    humor: "Excelente",
    energia: "Alta",
    sono: "8h",
    nota: "Subiu carga no supino e se sentiu muito bem.",
  },
];

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
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
    default: "bg-white/8 text-zinc-200 border-white/10",
    success: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    warn: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    info: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function DashboardView({ students }) {
  const activeStudents = students.filter((s) => s.status === "Ativo").length;
  const pending = students.filter((s) => s.pagamento === "Pendente").length;
  const hybrid = students.filter((s) => s.plano === "Híbrido").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Alunos ativos" value={activeStudents} meta="+2 este mês" icon={Users} />
        <StatCard title="Consultorias híbridas" value={hybrid} meta="Presencial + online" icon={Activity} />
        <StatCard title="Receita do mês" value="R$ 5.300" meta="12% acima do último mês" icon={Wallet} />
        <StatCard title="Pagamentos pendentes" value={pending} meta="Acompanhe hoje" icon={CreditCard} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="p-5">
          <SectionTitle
            title="Visão geral de evolução"
            subtitle="Exemplo de progresso corporal do aluno selecionado"
            action={<Badge tone="info">Lucas Martins</Badge>}
          />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="mes" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip />
                <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="gordura" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Hoje no app" subtitle="Pontos quentes para você agir agora" />
          <div className="space-y-4">
            {[
              {
                icon: Bell,
                title: "2 check-ins esperando resposta",
                text: "Mariana e Lucas enviaram atualizações da semana.",
              },
              {
                icon: CalendarDays,
                title: "4 compromissos marcados",
                text: "Avaliações e treinos presenciais ao longo do dia.",
              },
              {
                icon: Dumbbell,
                title: "3 treinos vencem amanhã",
                text: "Hora de atualizar as fichas dos alunos online.",
              },
              {
                icon: Wallet,
                title: "1 cobrança pendente",
                text: "Mariana Costa com vencimento em aberto.",
              },
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
          <SectionTitle title="Agenda de hoje" subtitle="Seus atendimentos e retornos" />
          <div className="space-y-3">
            {agendaData.map((item) => (
              <div key={`${item.hora}-${item.aluno}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="font-medium text-white">{item.aluno}</p>
                  <p className="text-sm text-zinc-400">{item.tipo} • {item.local}</p>
                </div>
                <Badge tone="info">{item.hora}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Receita" subtitle="Visão simples do faturamento" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="mes" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip />
                <Bar dataKey="valor" fill="#34d399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Atalhos" subtitle="Ações rápidas" />
          <div className="grid gap-3">
            {[
              "Cadastrar aluno",
              "Criar novo treino",
              "Lançar pagamento",
              "Agendar avaliação",
              "Responder check-in",
            ].map((label) => (
              <button
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm font-medium text-white transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StudentsView({ students, setStudents }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nome: "", plano: "Online", objetivo: "Hipertrofia" });

  const filtered = useMemo(() => {
    return students.filter((student) =>
      student.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  function addStudent(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setStudents([
      {
        id: Date.now(),
        nome: form.nome,
        plano: form.plano,
        objetivo: form.objetivo,
        status: "Ativo",
        ultimaAvaliacao: "Hoje",
        peso: 0,
        gordura: 0,
        treinoHoje: "Ainda não montado",
        pagamento: "Pendente",
      },
      ...students,
    ]);
    setForm({ nome: "", plano: "Online", objetivo: "Hipertrofia" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle title="Novo aluno" subtitle="Cadastro rápido para começar a usar" />
        <form onSubmit={addStudent} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Nome do aluno</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0 placeholder:text-zinc-500"
              placeholder="Ex: João Pedro"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Plano</label>
              <select
                value={form.plano}
                onChange={(e) => setForm({ ...form, plano: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option>Online</option>
                <option>Presencial</option>
                <option>Híbrido</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Objetivo</label>
              <select
                value={form.objetivo}
                onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option>Hipertrofia</option>
                <option>Emagrecimento</option>
                <option>Condicionamento</option>
                <option>Definição</option>
                <option>Reabilitação</option>
              </select>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-zinc-950 transition hover:opacity-90">
            <Plus className="h-4 w-4" />
            Cadastrar aluno
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Campos sugeridos para próxima etapa</p>
          <p className="mt-2 text-sm text-zinc-400">
            Data de nascimento, telefone, lesões, restrições, objetivo detalhado, academia, medidas e foto.
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Alunos cadastrados"
          subtitle="Gerencie seu elenco fitness"
          action={
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white outline-none placeholder:text-zinc-500"
                placeholder="Buscar aluno"
              />
            </div>
          }
        />

        <div className="space-y-3">
          {filtered.map((student) => (
            <div key={student.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{student.nome}</p>
                    <Badge tone="success">{student.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {student.plano} • {student.objetivo} • Última avaliação: {student.ultimaAvaliacao}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="info">{student.treinoHoje}</Badge>
                  <Badge tone={student.pagamento === "Pago" ? "success" : "warn"}>{student.pagamento}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WorkoutsView() {
  const workoutDays = [
    {
      nome: "Treino A",
      foco: "Peito + tríceps",
      exercicios: ["Supino reto 4x10", "Crucifixo 3x12", "Tríceps corda 4x12", "Mergulho 3x falha"],
    },
    {
      nome: "Treino B",
      foco: "Costas + bíceps",
      exercicios: ["Puxada alta 4x10", "Remada baixa 4x12", "Rosca direta 3x12", "Rosca martelo 3x12"],
    },
    {
      nome: "Treino C",
      foco: "Pernas + glúteos",
      exercicios: ["Agachamento 4x10", "Leg press 4x12", "Stiff 3x12", "Cadeira abdutora 3x15"],
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-5">
        <SectionTitle title="Treinos do aluno" subtitle="Exemplo de estrutura para consultoria híbrida" />
        <div className="grid gap-4">
          {workoutDays.map((day) => (
            <div key={day.nome} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{day.nome}</p>
                  <p className="text-sm text-zinc-400">{day.foco}</p>
                </div>
                <Badge tone="success">Ativo</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {day.exercicios.map((exercise) => (
                  <div key={exercise} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
                    {exercise}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-5">
          <SectionTitle title="Biblioteca de exercícios" subtitle="Base do sistema" />
          <div className="grid gap-3">
            {exerciseLibrary.map((exercise) => (
              <div key={exercise} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3">
                <span className="text-sm text-zinc-200">{exercise}</span>
                <Badge tone="info">Vídeo</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Modelos rápidos" subtitle="Crie treinos em menos tempo" />
          <div className="grid gap-3">
            {[
              "Hipertrofia iniciante",
              "Emagrecimento feminino",
              "Treino híbrido premium",
              "Condicionamento 3x semana",
            ].map((item) => (
              <button key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm font-medium text-white hover:border-emerald-400/40 hover:bg-emerald-400/10">
                {item}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EvolutionView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card className="p-5">
        <SectionTitle title="Métricas de evolução" subtitle="Comparativo visual do aluno" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-400">Peso atual</p>
            <p className="mt-2 text-3xl font-bold text-white">84 kg</p>
            <p className="mt-2 text-sm text-emerald-400">-3 kg em 6 meses</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-400">Gordura</p>
            <p className="mt-2 text-3xl font-bold text-white">17%</p>
            <p className="mt-2 text-sm text-emerald-400">-6 pontos</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-400">Adesão</p>
            <p className="mt-2 text-3xl font-bold text-white">92%</p>
            <p className="mt-2 text-sm text-emerald-400">Treinos concluídos</p>
          </div>
        </div>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mes" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={3} />
              <Line type="monotone" dataKey="gordura" stroke="#22d3ee" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Check-ins da semana" subtitle="Leitura rápida do acompanhamento online" />
        <div className="space-y-4">
          {checkins.map((item) => (
            <div key={item.nome} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{item.nome}</p>
                <Badge tone="success">Humor {item.humor}</Badge>
                <Badge tone="info">Energia {item.energia}</Badge>
                <Badge>{item.sono} de sono</Badge>
              </div>
              <p className="mt-3 text-sm text-zinc-400">{item.nota}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-300">Ponto forte</p>
            <p className="mt-2 font-medium text-white">Constância nos treinos e boa resposta na progressão de carga.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="text-sm text-amber-300">Atenção</p>
            <p className="mt-2 font-medium text-white">Melhorar regularidade do sono e hidratação em dias de cardio.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AgendaView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="p-5">
        <SectionTitle title="Compromissos do dia" subtitle="Sua agenda organizada" />
        <div className="space-y-3">
          {agendaData.map((item) => (
            <div key={`${item.hora}-${item.aluno}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{item.aluno}</p>
                  <p className="text-sm text-zinc-400">{item.tipo}</p>
                  <p className="text-sm text-zinc-500">{item.local}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-white">{item.hora}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Próximas ações" subtitle="Para não deixar a roda parar" />
        <div className="space-y-3">
          {[
            "Agendar reavaliação de Lucas para a próxima semana",
            "Confirmar horário com Mariana no Meet",
            "Enviar treino atualizado para Ana Luiza",
            "Cobrança pendente de consultoria online",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
              <p className="text-sm text-zinc-200">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FinanceView() {
  const items = [
    { nome: "Lucas Martins", plano: "Híbrido", valor: "R$ 350", status: "Pago" },
    { nome: "Mariana Costa", plano: "Online", valor: "R$ 250", status: "Pendente" },
    { nome: "Pedro Henrique", plano: "Presencial", valor: "R$ 300", status: "Pago" },
    { nome: "Ana Luiza", plano: "Híbrido", valor: "R$ 380", status: "Pago" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Faturamento" value="R$ 5.300" meta="Março de 2026" icon={TrendingUp} />
        <StatCard title="Recebido" value="R$ 4.920" meta="93% da meta" icon={Wallet} />
        <StatCard title="Em aberto" value="R$ 380" meta="1 aluno pendente" icon={CreditCard} />
        <StatCard title="Ticket médio" value="R$ 320" meta="Por aluno ativo" icon={Target} />
      </div>

      <Card className="p-5">
        <SectionTitle title="Controle de pagamentos" subtitle="Modelo pronto para o financeiro do personal" />
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.nome} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-white">{item.nome}</p>
                <p className="text-sm text-zinc-400">{item.plano}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-medium text-white">{item.valor}</p>
                <Badge tone={item.status === "Pago" ? "success" : "warn"}>{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StudentAppView() {
  const completed = [
    "Supino reto 4x10",
    "Crucifixo inclinado 3x12",
    "Tríceps corda 4x12",
  ];
  const pending = ["Mergulho banco 3x falha", "Abdominal infra 3x20", "Cardio 15 min"];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-5">
        <SectionTitle title="Experiência do aluno" subtitle="Tela simulada do lado do cliente" />
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 shadow-2xl shadow-black/30">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Bom treino, Lucas 👋</p>
              <h3 className="text-2xl font-bold text-white">Treino A de hoje</h3>
            </div>
            <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
              <HeartPulse className="h-6 w-6" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Objetivo</p>
              <p className="mt-2 font-medium text-white">Hipertrofia</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Aderência</p>
              <p className="mt-2 font-medium text-white">92%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Próximo check-in</p>
              <p className="mt-2 font-medium text-white">Domingo</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-zinc-300">Exercícios concluídos</p>
            {completed.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                <span className="text-sm text-white">{item}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-zinc-300">Falta finalizar</p>
            {pending.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">
                {item}
              </div>
            ))}
          </div>

          <button className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-zinc-950">
            Marcar treino como concluído
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Módulos do lado do aluno" subtitle="O que esse app já contempla" />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Treino do dia", text: "Ficha clara, organizada e com vídeos dos exercícios." },
            { title: "Histórico", text: "Lista de treinos realizados e frequência de execução." },
            { title: "Evolução", text: "Peso, fotos, medidas e gráfico de progresso." },
            { title: "Check-in", text: "Formulário semanal para consultoria online." },
            { title: "Mensagens", text: "Recados, observações e ajustes do personal." },
            { title: "Pagamentos", text: "Plano atual, vencimento e status financeiro." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function EvoFitProApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState(initialStudents);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = navItems.find((item) => item.key === activeTab)?.label || "Dashboard";

  function renderContent() {
    if (activeTab === "dashboard") return <DashboardView students={students} />;
    if (activeTab === "alunos") return <StudentsView students={students} setStudents={setStudents} />;
    if (activeTab === "treinos") return <WorkoutsView />;
    if (activeTab === "evolucao") return <EvolutionView />;
    if (activeTab === "agenda") return <AgendaView />;
    if (activeTab === "financeiro") return <FinanceView />;
    return <StudentAppView />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.14),_transparent_30%),linear-gradient(180deg,#09090b_0%,#111113_100%)] text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-black/30 p-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400 text-lg font-black text-zinc-950 shadow-lg shadow-emerald-900/40">
              EV
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">EvoFit Pro</p>
              <h1 className="text-2xl font-bold text-white">Painel do Personal</h1>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Conta ativa</p>
            <p className="mt-1 font-semibold text-white">Jater Personal Studio</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="success">Online + presencial</Badge>
              <Badge tone="info">Plano Pro</Badge>
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
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-900/30"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm text-emerald-300">Resumo do MVP</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">
              Cadastro de alunos, treinos, evolução, agenda, financeiro e experiência do aluno em um só app.
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm text-zinc-400">Aplicativo para personal trainer</p>
                  <h2 className="text-2xl font-bold text-white">{activeLabel}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 md:block">
                  Quinta-feira • 19/03/2026
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">
                  Jater Jr
                </div>
              </div>
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden">
              <div className="h-full w-80 border-r border-white/10 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">EvoFit Pro</p>
                    <h3 className="text-xl font-bold text-white">Menu</h3>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-6 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveTab(item.key);
                          setMobileOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                          active ? "bg-emerald-400 text-zinc-950" : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <main className="p-4 md:p-8">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

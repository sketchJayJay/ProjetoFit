import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Dumbbell,
  ExternalLink,
  Flame,
  Link2,
  LoaderCircle,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Action,
  Avatar,
  Empty,
  Field,
  LinkAction,
  Modal,
  Panel,
  PanelHead,
  Pill,
} from "../components/ui";
import {
  dayOffset,
  money,
  sameId,
  shortDate,
  studentMetrics,
  today,
  weekDays,
  weeklyGoal,
} from "../lib/model";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function NewStudentForm({ profile, onCreate, onBack }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    plano: profile.planoPadrao || "Híbrido",
    objetivo: "Hipertrofia",
    academia: "",
    restricoes: "",
    observacoes: "",
    metaSemanal: 3,
    focoDoCiclo: "",
    mensagemPersonal: "",
  });
  const update = (key) => (e) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));
  function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    onCreate({
      ...form,
      id: Date.now(),
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      metaSemanal: Number(form.metaSemanal),
      status: "Ativo",
      entrada: today(),
      adesao: 0,
      genero: "Não informado",
      nascimento: "",
      treinoHoje: "Aguardando ficha",
      ultimoCheckin: "",
    });
  }
  return (
    <>
      <div className="overview-heading">
        <div>
          <span className="eyebrow">UMA NOVA HISTÓRIA COMEÇA AQUI</span>
          <h1>
            Antes do treino, a pessoa<span className="accent-text">.</span>
          </h1>
          <p>
            Conheça o objetivo e prepare uma experiência com o nome do seu
            aluno.
          </p>
        </div>
        <Action secondary onClick={onBack}>
          Ver alunos
          <ArrowRight size={16} />
        </Action>
      </div>
      <div className="new-student-layout">
        <Panel>
          <PanelHead
            eyebrow="DADOS DO ACOMPANHAMENTO"
            title="Vamos conhecer seu aluno"
          />
          <form className="form-stack" onSubmit={submit}>
            <div className="form-grid">
              <Field
                label="Nome do aluno"
                required
                autoComplete="name"
                placeholder="Como seu aluno se chama?"
                value={form.nome}
                onChange={update("nome")}
              />
              <Field
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="Usado no convite de acesso"
                value={form.email}
                onChange={update("email")}
              />
              <Field
                label="Telefone"
                type="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={update("telefone")}
              />
              <Field
                label="Local de treino"
                placeholder="Academia, studio ou em casa"
                value={form.academia}
                onChange={update("academia")}
              />
              <Field label="Plano">
                <select value={form.plano} onChange={update("plano")}>
                  {["Presencial", "Online", "Híbrido"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Objetivo">
                <select value={form.objetivo} onChange={update("objetivo")}>
                  {[
                    "Hipertrofia",
                    "Emagrecimento",
                    "Condicionamento",
                    "Definição",
                    "Reabilitação",
                    "Glúteos e pernas",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Meta: dias de treino por semana"
                type="number"
                min="1"
                max="7"
                required
                value={form.metaSemanal}
                onChange={update("metaSemanal")}
              />
              <Field
                label="Foco do primeiro ciclo"
                maxLength="160"
                placeholder="O próximo passo que faz sentido"
                value={form.focoDoCiclo}
                onChange={update("focoDoCiclo")}
              />
            </div>
            <Field label="Restrições e cuidados">
              <textarea
                rows="2"
                placeholder="Informações importantes para a prática dos exercícios"
                value={form.restricoes}
                onChange={update("restricoes")}
              />
            </Field>
            <Field label="Seu primeiro recado no painel">
              <textarea
                rows="2"
                maxLength="600"
                placeholder="Uma mensagem para começar essa parceria"
                value={form.mensagemPersonal}
                onChange={update("mensagemPersonal")}
              />
            </Field>
            <Field label="Anotações internas do personal">
              <textarea
                rows="2"
                placeholder="Estas anotações ficam no seu espaço de gestão"
                value={form.observacoes}
                onChange={update("observacoes")}
              />
            </Field>
            <Action type="submit">
              <Plus size={18} />
              Cadastrar aluno
            </Action>
          </form>
        </Panel>
        <Panel className="new-student-guide">
          <span className="section-icon accent">
            <UserRound size={22} />
          </span>
          <span className="eyebrow">UM PAINEL PARA CHAMAR DE SEU</span>
          <h2>O acompanhamento começa na conexão.</h2>
          <p>
            Depois do cadastro, o painel individual já está preparado para
            receber os treinos e a história desse aluno.
          </p>
          <ol>
            <li>
              <strong>01</strong>
              <span>Personalize a meta, o foco e seu recado.</span>
            </li>
            <li>
              <strong>02</strong>
              <span>Monte a primeira ficha de treino.</span>
            </li>
            <li>
              <strong>03</strong>
              <span>Gere um convite para o e-mail do aluno.</span>
            </li>
          </ol>
        </Panel>
      </div>
    </>
  );
}

function attentionFor(student, workouts, events) {
  const metrics = studentMetrics(student, events);
  if (
    !workouts.some(
      (w) => sameId(w.alunoId, student.id) && w.status !== "Inativo",
    )
  )
    return {
      tone: "amber",
      text: "Sem ficha ativa",
      detail: "Prepare o próximo treino.",
    };
  if (
    metrics.lastCheckin &&
    metrics.lastCheckin.created_at >= dayOffset(-7) &&
    (metrics.lastCheckin.payload.energy <= 2 ||
      metrics.lastCheckin.payload.mood === "Com desconforto")
  )
    return {
      tone: "coral",
      text: "Olhar de perto",
      detail: "Check-in recente pede atenção.",
    };
  if (!metrics.sessions.some((s) => s.created_at >= dayOffset(-7)))
    return {
      tone: "amber",
      text: "Retomar contato",
      detail: "Sem treino registrado há 7 dias.",
    };
  return {
    tone: "accent",
    text: "Em movimento",
    detail: "Acompanhamento em dia.",
  };
}

export function CoachDashboard({ state, onNavigate, onStudent, onPreview }) {
  const { students, workouts, events, payments, agenda, profile } = state;
  const active = students.filter((s) => s.status === "Ativo");
  const week = weekDays();
  const sessions = events.filter(
    (e) =>
      e.kind === "workout" &&
      week.includes(e.payload.date || e.created_at?.slice(0, 10)),
  );
  const chart = week.map((day, i) => ({
    day: ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"][i],
    treinos: sessions.filter(
      (s) => (s.payload.date || s.created_at.slice(0, 10)) === day,
    ).length,
  }));
  const pending = payments.filter((p) => p.status === "Pendente");
  const currentMonth = today().slice(0, 7);
  const paid = payments
    .filter(
      (p) =>
        p.status === "Pago" &&
        (p.dataPagamento || p.vencimento).startsWith(currentMonth),
    )
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);
  const needsAttention = active
    .map((s) => ({ student: s, ...attentionFor(s, workouts, events) }))
    .filter((x) => x.tone !== "accent");
  const nextAgenda = [...agenda]
    .filter(
      (a) =>
        a.data >= today() && !["Cancelado", "Concluído"].includes(a.status),
    )
    .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
    .slice(0, 4);
  return (
    <div className="coach-overview">
      <div className="overview-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            SEU IMPACTO EM MOVIMENTO
          </div>
          <h1>
            Bom ter você aqui,
            <br className="mobile-only" />{" "}
            {profile.personalNome?.split(" ")[0] || "personal"}
            <span className="accent-text">.</span>
          </h1>
          <p>Por trás de cada número, uma pessoa evoluindo com você.</p>
        </div>
        <Action onClick={() => onNavigate("cadastro")}>
          <Plus size={18} />
          Novo aluno
        </Action>
      </div>
      <div className="overview-hero">
        <div>
          <Pill tone="dark">ACOMPANHAMENTO QUE VAI ALÉM DA FICHA</Pill>
          <h2>
            Mais perto de cada aluno.
            <br />
            <span>Mais longe em cada evolução.</span>
          </h2>
          <div className="hero-people">
            <div>
              {active.slice(0, 4).map((s, i) => (
                <Avatar key={s.id} name={s.nome} index={i} />
              ))}
            </div>
            <span>
              {active.length} aluno{active.length !== 1 ? "s" : ""} com uma
              jornada própria
            </span>
          </div>
        </div>
        <button
          aria-label="Conhecer cada jornada"
          className="hero-cta"
          onClick={() => onNavigate("alunos")}
        >
          <ArrowUpRight size={35} />
          <span>Conhecer cada jornada</span>
        </button>
        <div className="hero-lines" aria-hidden="true" />
      </div>
      <div className="metric-grid">
        {[
          {
            label: "Alunos ativos",
            value: active.length,
            detail: "Pessoas, objetivos e histórias",
            icon: Users,
            tone: "accent",
          },
          {
            label: "Treinos nesta semana",
            value: sessions.length,
            detail: "Concluídos pelos seus alunos",
            icon: Dumbbell,
            tone: "blue",
          },
          {
            label: "Precisam de atenção",
            value: needsAttention.length,
            detail: "Um contato pode mudar o dia",
            icon: Flame,
            tone: "coral",
          },
          {
            label: "Recebido no mês",
            value: money(paid),
            detail: `${pending.length} mensalidade${pending.length !== 1 ? "s" : ""} em aberto`,
            icon: Wallet,
            tone: "amber",
          },
        ].map((m) => (
          <Panel className="metric-card" key={m.label}>
            <div>
              <span className="metric-label">{m.label}</span>
              <span className={`section-icon ${m.tone}`}>
                <m.icon size={18} />
              </span>
            </div>
            <strong className="metric-value">{m.value}</strong>
            <small className="metric-note">{m.detail}</small>
          </Panel>
        ))}
      </div>
      <div className="coach-main-grid">
        <Panel className="team-panel">
          <PanelHead
            eyebrow="PESSOAS NO CENTRO"
            title="Cada aluno, uma jornada"
            action={
              <LinkAction onClick={() => onNavigate("alunos")}>
                Ver todos
              </LinkAction>
            }
          />
          <div className="team-table-head">
            <span>ALUNO / OBJETIVO</span>
            <span>META DA SEMANA</span>
            <span>ACOMPANHAMENTO</span>
            <span />
          </div>
          {active.length ? (
            active.slice(0, 5).map((student, i) => {
              const m = studentMetrics(student, events),
                attention = attentionFor(student, workouts, events);
              return (
                <div className="team-row" key={student.id}>
                  <button
                    className="team-name"
                    onClick={() => onStudent(student)}
                  >
                    <Avatar name={student.nome} index={i} />
                    <span>
                      <strong>{student.nome}</strong>
                      <small>{student.objetivo}</small>
                    </span>
                  </button>
                  <div className="team-goal">
                    <span>
                      <strong>{m.completed}</strong> / {m.goal} dias
                    </span>
                    <div className="mini-track">
                      <span style={{ width: `${m.percentage}%` }} />
                    </div>
                  </div>
                  <Pill tone={attention.tone}>{attention.text}</Pill>
                  <button
                    className="icon-button"
                    onClick={() => onPreview(student)}
                    aria-label={`Abrir painel de ${student.nome}`}
                  >
                    <ArrowUpRight size={20} />
                  </button>
                </div>
              );
            })
          ) : (
            <Empty
              icon={Users}
              title="Sua próxima história começa aqui"
              text="Cadastre seu primeiro aluno para organizar o acompanhamento."
              action={
                <Action onClick={() => onNavigate("cadastro")}>
                  <Plus size={17} />
                  Cadastrar aluno
                </Action>
              }
            />
          )}
        </Panel>
        <Panel className="attention-panel">
          <PanelHead
            eyebrow="SEU OLHAR FAZ DIFERENÇA"
            title="Vale um contato"
          />
          <div>
            {needsAttention.length ? (
              needsAttention.slice(0, 3).map((item, i) => (
                <button
                  className="attention-item"
                  key={item.student.id}
                  onClick={() => onStudent(item.student, "messages")}
                >
                  <Avatar name={item.student.nome} index={i} />
                  <span>
                    <strong>{item.student.nome}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              ))
            ) : (
              <Empty
                icon={CheckCircle2}
                title="Tudo em movimento"
                text="Nenhum alerta de acompanhamento por aqui."
              />
            )}
          </div>
          <div className="attention-footer">
            <MessageCircle size={18} />
            <p>Uma mensagem no momento certo aproxima e motiva.</p>
          </div>
        </Panel>
      </div>
      <div className="coach-bottom-grid">
        <Panel>
          <PanelHead
            eyebrow="MOVIMENTO DA SEMANA"
            title="Constância em tempo real"
            action={<Pill tone="accent">{sessions.length} treinos</Pill>}
          />
          <ResponsiveContainer width="100%" height={205}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient
                  id="activityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ff6a00" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#ff6a00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff0b" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8d8d8d", fontSize: 10 }}
              />
              <YAxis
                allowDecimals={false}
                width={25}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8d8d8d", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1b1b1b",
                  border: "1px solid #3e2b20",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="treinos"
                name="Treinos concluídos"
                stroke="#ff6a00"
                strokeWidth={3}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <PanelHead
            eyebrow="SEUS PRÓXIMOS ENCONTROS"
            title="Na sua agenda"
            action={
              <LinkAction onClick={() => onNavigate("agenda")}>
                Ver agenda
              </LinkAction>
            }
          />
          {nextAgenda.length ? (
            nextAgenda.map((a) => (
              <button
                className="agenda-preview"
                key={a.id}
                onClick={() => onNavigate("agenda")}
              >
                <span className="agenda-time">
                  {a.hora}
                  <small>{shortDate(a.data)}</small>
                </span>
                <span>
                  <strong>
                    {students.find((s) => sameId(s.id, a.alunoId))?.nome ||
                      "Aluno"}
                  </strong>
                  <small>
                    {a.tipo} · {a.local}
                  </small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))
          ) : (
            <Empty
              icon={CalendarDays}
              title="Espaço para o próximo encontro"
              text="Seus agendamentos futuros vão aparecer aqui."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

export function CoachStudents({ state, onStudent, onPreview, onCreate }) {
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("Todos");
  const list = state.students.filter(
    (s) =>
      (filter === "Todos" || s.plano === filter) &&
      `${s.nome} ${s.objetivo} ${s.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="overview-heading">
        <div>
          <span className="eyebrow">NENHUMA JORNADA É IGUAL</span>
          <h1>
            Seu time. Cada história<span className="accent-text">.</span>
          </h1>
          <p>Um painel e uma estratégia para cada aluno.</p>
        </div>
        <Action onClick={onCreate}>
          <Plus size={18} />
          Novo aluno
        </Action>
      </div>
      <div className="student-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label="Buscar alunos"
            placeholder="Buscar nome, objetivo ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {["Todos", "Presencial", "Online", "Híbrido"].map((f) => (
            <button
              className={filter === f ? "active" : ""}
              key={f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="subtle">
          {list.length} aluno{list.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="student-cards">
        {list.length ? (
          list.map((student, i) => {
            const m = studentMetrics(student, state.events),
              attention = attentionFor(student, state.workouts, state.events);
            const latest = [...state.evaluations]
              .filter((e) => sameId(e.alunoId, student.id))
              .sort((a, b) => b.data.localeCompare(a.data))[0];
            return (
              <Panel className="student-card" key={student.id}>
                <div className="student-card-head">
                  <Avatar name={student.nome} index={i} size="large" />
                  <Pill tone={attention.tone}>
                    {student.status === "Ativo"
                      ? attention.text
                      : student.status}
                  </Pill>
                </div>
                <h2>{student.nome}</h2>
                <p>{student.objetivo}</p>
                <div className="student-card-plan">
                  <span>{student.plano}</span>
                  <span>{student.academia || "Local a definir"}</span>
                </div>
                <div className="student-card-stats">
                  <div>
                    <span>META DA SEMANA</span>
                    <strong>
                      {m.completed}
                      <small> / {m.goal} dias</small>
                    </strong>
                  </div>
                  <div>
                    <span>ÚLTIMO PESO</span>
                    <strong>
                      {latest?.peso ?? "—"}
                      <small>{latest ? " kg" : ""}</small>
                    </strong>
                  </div>
                </div>
                <div className="mini-track">
                  <span style={{ width: `${m.percentage}%` }} />
                </div>
                <p className="student-cycle">
                  <Target size={15} />
                  {student.focoDoCiclo ||
                    "Um passo de cada vez, com constância."}
                </p>
                <Action onClick={() => onPreview(student)}>
                  Abrir painel do aluno
                  <ArrowUpRight size={17} />
                </Action>
                <button
                  className="text-action manage-link"
                  onClick={() => onStudent(student)}
                >
                  <Settings2 size={15} />
                  Personalizar e gerenciar acesso
                </button>
              </Panel>
            );
          })
        ) : (
          <Empty
            icon={Users}
            title="Nenhum aluno por aqui"
            text="Tente outra busca ou cadastre um novo aluno."
            action={
              <Action onClick={onCreate}>
                <Plus size={17} />
                Novo aluno
              </Action>
            }
          />
        )}
      </div>
    </>
  );
}

export function StudentManager({
  student,
  state,
  setStudents,
  onClose,
  onPreview,
  onNavigate,
  onCoachMessage,
  session,
  flush,
  initialTab = "profile",
}) {
  const [tab, setTab] = useState(initialTab),
    [form, setForm] = useState({
      ...student,
      metaSemanal: weeklyGoal(student),
    }),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [link, setLink] = useState(""),
    [access, setAccess] = useState(null),
    [text, setText] = useState("");
  const submitting = useRef(false);
  useEffect(() => {
    if (!session?.user?.id || !isSupabaseConfigured) return;
    let active = true;
    supabase
      .from("student_portal_access")
      .select("id,student_user_id,invited_email,revoked,expires_at")
      .eq("owner_id", session.user.id)
      .eq("student_id", String(student.id))
      .maybeSingle()
      .then(({ data }) => {
        if (active) setAccess(data);
      });
    return () => {
      active = false;
    };
  }, [student.id, session?.user?.id]);
  function save(e) {
    e.preventDefault();
    setStudents((items) =>
      items.map((s) =>
        sameId(s.id, student.id)
          ? { ...s, ...form, metaSemanal: Number(form.metaSemanal) }
          : s,
      ),
    );
    setNotice("Personalização salva. O aluno verá as alterações no painel.");
  }
  async function invite() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setNotice("");
    try {
      if (!student.email?.trim())
        throw new Error(
          "Cadastre e salve o e-mail do aluno na aba Personalização primeiro.",
        );
      await flush();
      const { data, error } = await supabase.rpc("create_student_invite", {
        p_student_id: String(student.id),
        p_email: student.email.trim().toLowerCase(),
      });
      if (error) throw error;
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      url.searchParams.set("portal", "1");
      url.hash = `convite=${data.token}`;
      setLink(url.toString());
      setAccess({ ...data, revoked: false });
      setNotice(
        "Convite criado. Copie o link e envie ao aluno. Ele vence em 7 dias.",
      );
    } catch (err) {
      setNotice(
        err.message ||
          "Não foi possível criar o convite. Confira a configuração do acesso dos alunos.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  async function revoke() {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("revoke_student_access", {
        p_student_id: String(student.id),
      });
      if (error) throw error;
      setAccess((a) => ({ ...a, revoked: true }));
      setLink("");
      setNotice("Acesso revogado. Para liberar novamente, gere outro convite.");
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Link copiado. Pronto para compartilhar com o aluno.");
    } catch {
      setNotice("Selecione e copie o link no campo abaixo.");
    }
  }
  async function message(e) {
    e.preventDefault();
    if (!text.trim() || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setNotice("");
    try {
      await onCoachMessage(student.id, text.trim());
      setText("");
      setNotice("Mensagem enviada ao painel do aluno.");
    } catch (e) {
      setNotice(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  const chats = state.events
    .filter((e) => sameId(e.alunoId, student.id) && e.kind === "message")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const checkins = state.events
    .filter((e) => sameId(e.alunoId, student.id) && e.kind === "checkin")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <Modal title={student.nome} onClose={onClose} wide>
      <div className="manager-tabs">
        {[
          { key: "profile", label: "Personalização" },
          { key: "access", label: "Acesso individual" },
          { key: "messages", label: "Conversa e check-ins" },
        ].map((t) => (
          <button
            className={tab === t.key ? "active" : ""}
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setNotice("");
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "profile" && (
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <Field
              label="Nome"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <Field
              label="E-mail de acesso"
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Field
              label="Telefone"
              value={form.telefone || ""}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
            <Field
              label="Objetivo"
              required
              value={form.objetivo || ""}
              onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
            />
            <Field label="Plano">
              <select
                value={form.plano}
                onChange={(e) => setForm({ ...form, plano: e.target.value })}
              >
                {["Presencial", "Online", "Híbrido"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Meta: dias de treino por semana"
              type="number"
              min="1"
              max="7"
              required
              value={form.metaSemanal}
              onChange={(e) =>
                setForm({ ...form, metaSemanal: e.target.value })
              }
            />
            <Field
              label="Local de treino"
              value={form.academia || ""}
              onChange={(e) => setForm({ ...form, academia: e.target.value })}
            />
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["Ativo", "Pausado", "Inativo"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Foco deste ciclo"
            maxLength="160"
            placeholder="Ex.: Ganhar constância e melhorar a execução"
            value={form.focoDoCiclo || ""}
            onChange={(e) => setForm({ ...form, focoDoCiclo: e.target.value })}
          />
          <Field label="Sua mensagem no painel do aluno">
            <textarea
              rows="3"
              maxLength="600"
              value={form.mensagemPersonal || ""}
              placeholder="Um recado que acompanha o aluno todos os dias."
              onChange={(e) =>
                setForm({ ...form, mensagemPersonal: e.target.value })
              }
            />
          </Field>
          <Field label="Observações internas do personal">
            <textarea
              rows="2"
              value={form.observacoes || ""}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
            />
          </Field>
          <div className="manager-actions">
            <Action type="submit">
              <Check size={17} />
              Salvar personalização
            </Action>
            <Action secondary onClick={() => onNavigate("treinos", student.id)}>
              <Dumbbell size={17} />
              Gerenciar treinos
            </Action>
            <Action secondary onClick={() => onPreview(student)}>
              Ver painel
              <ArrowUpRight size={17} />
            </Action>
          </div>
        </form>
      )}
      {tab === "access" && (
        <div className="access-settings">
          <div className="access-illustration">
            <ShieldCheck size={38} />
          </div>
          <h3>O painel é dele. O acompanhamento é seu.</h3>
          <p>
            O aluno entra com o próprio e-mail e senha e recebe apenas os dados
            do seu acompanhamento.
          </p>
          {!session?.user?.id || !isSupabaseConfigured ? (
            <div className="notice">
              A prévia individual já está disponível. Para gerar um acesso em
              outro celular, conecte o Supabase e execute a atualização do banco
              incluída no projeto.
            </div>
          ) : (
            <>
              <dl className="detail-list">
                <div>
                  <dt>E-mail autorizado</dt>
                  <dd>{student.email || "Não cadastrado"}</dd>
                </div>
                <div>
                  <dt>Acesso</dt>
                  <dd>
                    {access?.revoked
                      ? "Revogado"
                      : access?.student_user_id
                        ? "Vinculado à conta do aluno"
                        : access
                          ? new Date(access.expires_at) < new Date()
                            ? "Convite expirado"
                            : "Aguardando ativação"
                          : "Ainda não criado"}
                  </dd>
                </div>
              </dl>
              <div className="manager-actions">
                <Action disabled={busy} onClick={invite}>
                  {busy ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <Link2 size={17} />
                  )}
                  Gerar novo convite
                </Action>
                {access && !access.revoked && (
                  <Action secondary disabled={busy} onClick={revoke}>
                    Revogar acesso
                  </Action>
                )}
              </div>
              {link && (
                <div className="invite-link">
                  <Field
                    label="Link individual do aluno"
                    readOnly
                    value={link}
                    onFocus={(e) => e.target.select()}
                  />
                  <Action secondary onClick={copy}>
                    <Copy size={17} />
                    Copiar link
                  </Action>
                </div>
              )}
            </>
          )}
          <button className="text-action" onClick={() => onPreview(student)}>
            Abrir prévia deste aluno
            <ArrowUpRight size={16} />
          </button>
        </div>
      )}
      {tab === "messages" && (
        <div className="manager-conversation">
          <div className="chat-messages">
            {chats.length ? (
              chats.map((m) => (
                <div
                  className={`chat-bubble ${m.author === "coach" ? "sent" : "received"}`}
                  key={m.id}
                >
                  <span>{m.author === "coach" ? "Você" : student.nome}</span>
                  <p>{m.payload.text}</p>
                  <small>
                    {new Date(m.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              ))
            ) : (
              <Empty
                icon={MessageCircle}
                title="Comece essa conversa"
                text="Sua mensagem aparece no painel individual do aluno."
              />
            )}
          </div>
          <form className="chat-compose" onSubmit={message}>
            <input
              aria-label="Mensagem para o aluno"
              value={text}
              maxLength="2000"
              onChange={(e) => setText(e.target.value)}
              placeholder="Uma orientação, um incentivo…"
              required
            />
            <Action type="submit" disabled={busy || !text.trim()}>
              <Send size={17} />
              Enviar
            </Action>
          </form>
          <h3 className="checkin-section-title">Check-ins recebidos</h3>
          {checkins.length ? (
            checkins.map((c) => (
              <div className="checkin-report" key={c.id}>
                <strong>
                  {shortDate(c.payload.date)} · {c.payload.mood}
                </strong>
                <span>
                  Energia {c.payload.energy}/5 · Sono {c.payload.sleep}h
                </span>
                <p>{c.payload.note || "Sem observações adicionais."}</p>
              </div>
            ))
          ) : (
            <p className="muted">
              Os check-ins enviados pelo aluno aparecem aqui.
            </p>
          )}
        </div>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
    </Modal>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Action,
  Avatar,
  Brand,
  Empty,
  Field,
  Modal,
  Panel,
  PanelHead,
  Pill,
  Ring,
} from "../components/ui";
import {
  money,
  parseExercise,
  shortDate,
  studentMetrics,
  today,
  uid,
  weekDays,
  workoutForDay,
} from "../lib/model";

const tabs = [
  { key: "today", label: "Meu dia", icon: Home },
  { key: "workouts", label: "Treinos", icon: Dumbbell },
  { key: "progress", label: "Evolução", icon: TrendingUp },
  { key: "messages", label: "Conversa", icon: MessageCircle },
  { key: "account", label: "Meu plano", icon: Wallet },
];

function TrainingSession({ workout, student, scope, onSave, onClose }) {
  const key = `evofit_training_${scope}_${student.id}_${workout.id}`;
  const parsed = useMemo(
    () => (workout.exercicios || []).map(parseExercise),
    [workout],
  );
  const blank = () => ({
    startedAt: Date.now(),
    exerciseSets: parsed.map((e) =>
      Array.from({ length: e.count }, () => ({
        done: false,
        kg: "",
        reps: e.reps || "",
      })),
    ),
    note: "",
    effort: 7,
  });
  const [draft, setDraft] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (
        stored?.signature === JSON.stringify(workout.exercicios) &&
        stored?.date === today()
      )
        return stored;
    } catch {
      /* A malformed draft never blocks a new session. */
    }
    return blank();
  });
  const [restUntil, setRestUntil] = useState(0);
  const [rest, setRest] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const savingRef = useRef(false);
  const total = draft.exerciseSets.reduce((n, sets) => n + sets.length, 0);
  const done = draft.exerciseSets.flat().filter((s) => s.done).length;
  useEffect(() => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          ...draft,
          signature: JSON.stringify(workout.exercicios),
          date: today(),
        }),
      );
    } catch {
      setError(
        "Não foi possível guardar o rascunho neste navegador. Mantenha esta tela aberta até concluir.",
      );
    }
  }, [draft, key, workout.exercicios]);
  useEffect(() => {
    const tick = () =>
      setRest(Math.max(0, Math.ceil((restUntil - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [restUntil]);
  function updateSet(exerciseIndex, setIndex, patch) {
    setDraft((d) => ({
      ...d,
      exerciseSets: d.exerciseSets.map((sets, i) =>
        i !== exerciseIndex
          ? sets
          : sets.map((set, j) => (j === setIndex ? { ...set, ...patch } : set)),
      ),
    }));
  }
  async function finish() {
    if (savingRef.current || !total || done !== total) return;
    if (
      draft.exerciseSets
        .flat()
        .some(
          (set) =>
            set.kg !== "" &&
            (!Number.isFinite(Number(set.kg)) ||
              Number(set.kg) < 0 ||
              Number(set.kg) > 1000),
        )
    ) {
      setError("Revise as cargas: use valores entre 0 e 1000 kg.");
      return;
    }
    savingRef.current = true;
    setBusy(true);
    setError("");
    try {
      await onSave("workout", {
        workoutId: workout.id,
        workoutName: workout.nome,
        focus: workout.foco,
        date: today(),
        duration: Math.max(
          1,
          Math.min(1440, Math.round((Date.now() - draft.startedAt) / 60000)),
        ),
        exercises: parsed.map((e, i) => ({
          name: e.name,
          prescription: e.prescription,
          sets: draft.exerciseSets[i],
        })),
        effort: Number(draft.effort),
        note: draft.note,
      });
      localStorage.removeItem(key);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal title={`${workout.nome} · em movimento`} onClose={onClose} wide>
      <div className="training-intro">
        <div>
          <span className="eyebrow">SEU TEMPO. SEU RITMO.</span>
          <h3>{workout.foco}</h3>
          <p>Registre a carga e marque cada série que terminar.</p>
        </div>
        <Pill tone="accent">
          {done}/{total} séries
        </Pill>
      </div>
      <div className="progress-track">
        <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      <div className="rest-bar">
        <span>
          <Timer size={18} />
          {rest
            ? `Descanso · ${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}`
            : "Seu intervalo de descanso"}
        </span>
        <div>
          {rest > 0 && (
            <button onClick={() => setRestUntil(0)} aria-label="Parar descanso">
              <Pause size={16} />
            </button>
          )}
          {[30, 60, 90].map((seconds) => (
            <button
              key={seconds}
              onClick={() => setRestUntil(Date.now() + seconds * 1000)}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
      <div className="training-exercises">
        {parsed.map((exercise, i) => (
          <div className="training-exercise" key={`${i}-${exercise.name}`}>
            <div className="exercise-heading">
              <span className="step-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4>{exercise.name}</h4>
                <p>{exercise.prescription}</p>
              </div>
              {draft.exerciseSets[i].every((s) => s.done) && (
                <CheckCircle2 className="accent-text" size={21} />
              )}
            </div>
            <div className="set-header">
              <span>SÉRIE</span>
              <span>CARGA (KG)</span>
              <span>REPS / TEMPO</span>
              <span>FEITO</span>
            </div>
            {draft.exerciseSets[i].map((set, j) => (
              <div className={`set-row ${set.done ? "complete" : ""}`} key={j}>
                <span>{j + 1}</span>
                <input
                  aria-label={`${exercise.name}, série ${j + 1}, carga`}
                  type="number"
                  min="0"
                  max="1000"
                  step="0.5"
                  inputMode="decimal"
                  placeholder="—"
                  value={set.kg}
                  onChange={(e) => updateSet(i, j, { kg: e.target.value })}
                />
                <input
                  aria-label={`${exercise.name}, série ${j + 1}, repetições ou tempo`}
                  value={set.reps}
                  onChange={(e) => updateSet(i, j, { reps: e.target.value })}
                />
                <button
                  className={`set-check ${set.done ? "checked" : ""}`}
                  aria-label={`${set.done ? "Desmarcar" : "Concluir"} ${exercise.name}, série ${j + 1}`}
                  aria-pressed={set.done}
                  onClick={() => updateSet(i, j, { done: !set.done })}
                >
                  <Check size={18} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="training-feedback">
        <Field label={`Esforço percebido: ${draft.effort}/10`}>
          <input
            type="range"
            min="1"
            max="10"
            value={draft.effort}
            onChange={(e) =>
              setDraft((d) => ({ ...d, effort: e.target.value }))
            }
          />
        </Field>
        <Field label="Algo que seu personal precisa saber?">
          <textarea
            rows="2"
            maxLength="1000"
            placeholder="Como foi o treino?"
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          />
        </Field>
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-footer">
        <Action secondary onClick={onClose} disabled={busy}>
          Continuar depois
        </Action>
        <Action onClick={finish} disabled={busy || !total || done !== total}>
          <CheckCircle2 size={18} />
          {busy ? "Salvando…" : "Concluir treino"}
        </Action>
      </div>
      <p className="subtle help-text">
        {done < total
          ? "Marque todas as séries para concluir. Seu rascunho fica salvo neste dispositivo."
          : "Tudo pronto. Vamos registrar mais uma conquista."}
      </p>
    </Modal>
  );
}

function CheckinModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    energy: 3,
    sleep: "7",
    mood: "Bem",
    note: "",
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const savingRef = useRef(false);
  async function submit(e) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setBusy(true);
    setError("");
    try {
      await onSave("checkin", {
        ...form,
        energy: Number(form.energy),
        sleep: Number(form.sleep),
        date: today(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal title="Como você está hoje?" onClose={onClose}>
      <p className="muted">
        Seu personal recebe esse resumo para acompanhar sua rotina.
      </p>
      <form onSubmit={submit} className="form-stack">
        <Field label="Minha energia">
          <div className="energy-options">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                type="button"
                key={v}
                aria-label={`Energia ${v} de 5`}
                aria-pressed={form.energy === v}
                className={form.energy === v ? "active" : ""}
                onClick={() => setForm({ ...form, energy: v })}
              >
                <Flame size={20} />
                <span>{v}</span>
              </button>
            ))}
          </div>
        </Field>
        <div className="form-grid">
          <Field
            label="Horas de sono"
            type="number"
            min="0"
            max="24"
            step="0.5"
            required
            value={form.sleep}
            onChange={(e) => setForm({ ...form, sleep: e.target.value })}
          />
          <Field label="Como me sinto">
            <select
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
            >
              {["Muito bem", "Bem", "Cansado(a)", "Com desconforto"].map(
                (m) => (
                  <option key={m}>{m}</option>
                ),
              )}
            </select>
          </Field>
        </div>
        <Field label="Conte um pouco mais (opcional)">
          <textarea
            rows="3"
            maxLength="1000"
            placeholder="Sono, rotina, dificuldades ou algo para comemorar…"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <Action type="submit" disabled={busy}>
          {busy ? "Enviando…" : "Enviar check-in"}
          <ArrowRight size={17} />
        </Action>
      </form>
    </Modal>
  );
}

export default function StudentExperience({
  data,
  onEvent,
  onExit,
  preview = false,
  scope = "demo",
  onRefresh,
}) {
  const {
    student,
    profile = {},
    workouts = [],
    evaluations = [],
    payments = [],
    checkins = [],
    events = [],
    agenda = [],
  } = data;
  const [tab, setTab] = useState("today"),
    [training, setTraining] = useState(null),
    [showCheckin, setShowCheckin] = useState(false);
  const [toast, setToast] = useState(""),
    [message, setMessage] = useState(""),
    [sending, setSending] = useState(false),
    [messageError, setMessageError] = useState("");
  const sendingRef = useRef(false);
  const metrics = studentMetrics(student, events);
  const currentWorkout = workoutForDay(workouts, events);
  const completedToday = (id) =>
    metrics.sessions.some(
      (e) =>
        String(e.payload.workoutId) === String(id) &&
        e.payload.date === today(),
    );
  const currentDone = currentWorkout && completedToday(currentWorkout.id);
  const ordered = [...evaluations].sort((a, b) => a.data.localeCompare(b.data));
  const first = ordered[0],
    latest = ordered.at(-1);
  const latestSession = [...metrics.sessions].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
  const chats = events
    .filter((e) => e.kind === "message")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const nextAppointment = [...agenda]
    .filter(
      (a) =>
        a.data >= today() &&
        a.status !== "Concluído" &&
        a.status !== "Cancelado",
    )
    .sort((a, b) =>
      `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`),
    )[0];
  const todayCheckin = metrics.lastCheckin?.payload?.date === today();
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab, student.id]);
  async function saveEvent(kind, payload) {
    await onEvent(kind, payload);
    setToast(
      kind === "workout"
        ? "Treino concluído. Mais um passo na sua evolução!"
        : kind === "checkin"
          ? "Check-in enviado para seu personal."
          : "Mensagem enviada.",
    );
  }
  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setMessageError("");
    try {
      await saveEvent("message", { text: message.trim() });
      setMessage("");
    } catch (err) {
      setMessageError(err.message);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }
  function navigate(next) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const weekly = (
    <Panel className="weekly-panel">
      <PanelHead
        eyebrow="UMA SEMANA DE CADA VEZ"
        title="Sua constância conta"
      />
      <div className="weekly-main">
        <Ring
          value={metrics.percentage}
          label={`${metrics.completed}/${metrics.goal}`}
          sublabel="dias de treino"
        />
        <div>
          <strong>
            {metrics.completed >= metrics.goal
              ? "Meta da semana alcançada."
              : `${metrics.goal - metrics.completed} dia${metrics.goal - metrics.completed > 1 ? "s" : ""} para sua meta.`}
          </strong>
          <p>Cada treino registrado é um passo a mais.</p>
        </div>
      </div>
      <div className="week-strip">
        {weekDays().map((day, i) => (
          <div
            key={day}
            className={`${metrics.sessionDays.has(day) ? "done" : ""} ${day === today() ? "is-today" : ""}`}
          >
            <small>{["S", "T", "Q", "Q", "S", "S", "D"][i]}</small>
            <span>
              {metrics.sessionDays.has(day) ? (
                <Check size={16} />
              ) : (
                Number(day.slice(-2))
              )}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );

  return (
    <div className="student-world">
      {preview && (
        <div className="preview-banner">
          <ShieldCheck size={15} />
          <span>
            Prévia do painel de {student.nome.split(" ")[0]} · acesso do
            personal · registros feitos aqui entram no histórico
          </span>
          <button onClick={onExit}>
            Voltar ao painel <ArrowUpRight size={14} />
          </button>
        </div>
      )}
      <header className="student-header">
        <Brand />
        <div className="student-desktop-nav">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? "active" : ""}
              onClick={() => navigate(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="student-header-actions">
          <Avatar name={student.nome} index={student.id} />
          {onExit && (
            <button
              className="icon-button"
              onClick={onExit}
              aria-label={preview ? "Voltar ao personal" : "Sair da conta"}
            >
              {preview ? <ArrowLeft size={18} /> : <LogOut size={18} />}
            </button>
          )}
        </div>
      </header>
      <main className="student-main">
        {tab === "today" && (
          <>
            <div className="student-greeting">
              <div>
                <span className="eyebrow">SEU PRÓXIMO PASSO COMEÇA AQUI</span>
                <h1>
                  Vamos nessa,
                  <br />
                  <span>{student.nome.split(" ")[0]}.</span>
                  <span className="greeting-dot">✦</span>
                </h1>
                <p>
                  {student.objetivo} <span>•</span> {student.plano}
                </p>
              </div>
              <div className="member-tag">
                <ShieldCheck size={19} />
                <span>
                  ACOMPANHAMENTO INDIVIDUAL
                  <strong>{profile.personalNome || "Seu personal"}</strong>
                </span>
              </div>
            </div>
            <div className="student-top-grid">
              <section className="workout-hero">
                <div className="workout-hero-content">
                  <Pill tone="dark">
                    <span className="live-dot" />
                    SEU MOVIMENTO DE HOJE
                  </Pill>
                  <h2>{currentWorkout?.foco || "O próximo capítulo é seu."}</h2>
                  <p>
                    {currentWorkout
                      ? `${currentWorkout.nome} · ${currentWorkout.exercicios?.length || 0} exercícios · ${currentWorkout.dias}`
                      : "Seu personal ainda está preparando seu treino. Enquanto isso, envie seu check-in."}
                  </p>
                  <Action
                    onClick={() =>
                      currentDone
                        ? navigate("progress")
                        : currentWorkout
                          ? setTraining(currentWorkout)
                          : setShowCheckin(true)
                    }
                  >
                    {currentWorkout ? (
                      <Play size={18} fill="currentColor" />
                    ) : (
                      <Plus size={18} />
                    )}{" "}
                    {currentDone
                      ? "Ver treino concluído"
                      : currentWorkout
                        ? "Começar meu treino"
                        : "Fazer meu check-in"}
                    <ArrowUpRight size={18} />
                  </Action>
                </div>
                <div className="kinetic-art" aria-hidden="true">
                  <div className="orbit o1" />
                  <div className="orbit o2" />
                  <div className="orbit o3" />
                  <Dumbbell size={110} strokeWidth={1.2} />
                  <span>
                    MOVE
                    <br />
                    YOUR
                    <br />
                    LIMITS.
                  </span>
                </div>
                <div className="hero-bottom">
                  <span>
                    <Target size={15} />
                    {student.focoDoCiclo || "Consistência antes de intensidade"}
                  </span>
                  <span>01 / SUA JORNADA</span>
                </div>
              </section>
              {weekly}
            </div>
            <div className="student-three-grid">
              <Panel className="checkin-prompt">
                <div className="section-icon coral">
                  <Heart size={22} />
                </div>
                <span className="eyebrow">SEU CORPO TAMBÉM FALA</span>
                <h3>
                  {todayCheckin ? "Check-in em dia." : "Como você chegou hoje?"}
                </h3>
                <p>
                  {todayCheckin
                    ? `${metrics.lastCheckin.payload.mood} · Energia ${metrics.lastCheckin.payload.energy}/5. Seu personal já pode acompanhar.`
                    : "Energia, sono e rotina. Um minuto que faz diferença no acompanhamento."}
                </p>
                <Action secondary onClick={() => setShowCheckin(true)}>
                  {todayCheckin ? "Atualizar check-in" : "Fazer check-in"}
                  <ArrowRight size={16} />
                </Action>
              </Panel>
              <Panel className="coach-note">
                <span className="eyebrow">DO SEU PERSONAL, PARA VOCÊ</span>
                <div className="quote-mark">“</div>
                <p>
                  {student.mensagemPersonal ||
                    profile.mensagemBoasVindas ||
                    "A melhor evolução é aquela que cabe na sua rotina. Conte comigo em cada etapa."}
                </p>
                <div className="coach-sign">
                  <Avatar name={profile.personalNome || "Personal"} index={2} />
                  <div>
                    <strong>{profile.personalNome || "Seu personal"}</strong>
                    <small>Juntos na sua evolução</small>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => navigate("messages")}
                    aria-label="Conversar com personal"
                  >
                    <MessageCircle size={19} />
                  </button>
                </div>
              </Panel>
              <Panel className="next-step">
                <span className="eyebrow">NO SEU RADAR</span>
                <h3>
                  {nextAppointment
                    ? shortDate(nextAppointment.data)
                    : "Sua próxima conquista"}
                </h3>
                <p>
                  {nextAppointment
                    ? `${nextAppointment.tipo} · ${nextAppointment.hora}`
                    : metrics.sessions.length
                      ? `${metrics.sessions.length} treino${metrics.sessions.length > 1 ? "s" : ""} registrado${metrics.sessions.length > 1 ? "s" : ""} na sua jornada.`
                      : "Seu primeiro treino registrado começa com um passo."}
                </p>
                <div className="appointment-place">
                  {nextAppointment?.local ||
                    "Vamos construir essa história juntos."}
                </div>
                <button
                  className="text-action"
                  onClick={() =>
                    navigate(nextAppointment ? "account" : "progress")
                  }
                >
                  {nextAppointment ? "Ver meu plano" : "Ver minha evolução"}
                  <ArrowUpRight size={16} />
                </button>
              </Panel>
            </div>
          </>
        )}

        {tab === "workouts" && (
          <>
            <div className="page-title">
              <span className="eyebrow">UM TREINO. UM PASSO À FRENTE.</span>
              <h1>
                Seu espaço de treino<span className="accent-text">.</span>
              </h1>
              <p>
                Fichas preparadas pelo seu personal, com seu objetivo em cada
                detalhe.
              </p>
            </div>
            <div className="workout-library">
              {workouts.length ? (
                workouts.map((w, i) => (
                  <Panel className="workout-card" key={w.id}>
                    <div className="workout-card-top">
                      <span className="large-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Pill tone="accent">
                        {completedToday(w.id)
                          ? "Concluído hoje"
                          : w.status || "Ativo"}
                      </Pill>
                    </div>
                    <h2>{w.nome}</h2>
                    <p>{w.foco}</p>
                    <div className="workout-meta">
                      <span>
                        <Dumbbell size={15} />
                        {w.exercicios?.length || 0} exercícios
                      </span>
                      <span>{w.dias}</span>
                    </div>
                    <ol className="exercise-preview">
                      {(w.exercicios || []).map((e, j) => {
                        const parsed = parseExercise(e);
                        return (
                          <li key={j}>
                            <span>{parsed.name}</span>
                            <small>{parsed.prescription}</small>
                          </li>
                        );
                      })}
                    </ol>
                    <Action
                      onClick={() => setTraining(w)}
                      disabled={!w.exercicios?.length || completedToday(w.id)}
                    >
                      <Play size={17} />
                      {completedToday(w.id)
                        ? "Treino de hoje concluído"
                        : "Iniciar treino"}
                      <ArrowUpRight size={17} />
                    </Action>
                  </Panel>
                ))
              ) : (
                <Empty
                  icon={Dumbbell}
                  title="Seu treino está a caminho"
                  text="Assim que seu personal montar a ficha, ela aparece aqui."
                />
              )}
            </div>
            {latestSession && (
              <Panel className="last-session">
                <PanelHead
                  eyebrow="ÚLTIMO TREINO REGISTRADO"
                  title={latestSession.payload.workoutName}
                />
                <p>
                  {shortDate(latestSession.payload.date)} ·{" "}
                  {latestSession.payload.duration} min · Esforço{" "}
                  {latestSession.payload.effort}/10
                </p>
                <div className="exercise-preview">
                  {latestSession.payload.exercises?.map((e, i) => (
                    <div key={i}>
                      <strong>{e.name}</strong>
                      <span>
                        {e.sets?.filter((s) => s.done).length} séries ·{" "}
                        {e.sets
                          ?.map((s) => (s.kg ? `${s.kg} kg` : "sem carga"))
                          .join(" / ")}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </>
        )}

        {tab === "progress" && (
          <>
            <div className="page-title">
              <span className="eyebrow">PROGRESSO QUE VOCÊ PODE VER</span>
              <h1>
                Cada passo deixa marca<span className="accent-text">.</span>
              </h1>
              <p>Sua jornada é maior que um número na balança.</p>
            </div>
            <div className="student-top-grid">
              {weekly}
              <Panel>
                <PanelHead
                  eyebrow="SEUS MARCOS"
                  title="Conquistas de verdade"
                />
                <div className="milestones">
                  {[
                    {
                      n: 1,
                      t: "Primeiro movimento",
                      d: "Primeiro treino concluído",
                    },
                    { n: 5, t: "Pegando o ritmo", d: "5 treinos registrados" },
                    {
                      n: 10,
                      t: "Construindo constância",
                      d: "10 treinos registrados",
                    },
                  ].map((m) => (
                    <div
                      key={m.n}
                      className={metrics.sessions.length >= m.n ? "earned" : ""}
                    >
                      <span>
                        <Trophy size={23} />
                      </span>
                      <div>
                        <strong>{m.t}</strong>
                        <small>{m.d}</small>
                      </div>
                      {metrics.sessions.length >= m.n && (
                        <CheckCircle2 size={18} />
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <div className="metric-grid student-metrics">
              {[
                {
                  label: "Peso atual",
                  value: latest?.peso != null ? `${latest.peso} kg` : "—",
                  note:
                    ordered.length > 1
                      ? `${(latest.peso - first.peso).toFixed(1)} kg desde o início`
                      : "Aguardando avaliação",
                },
                {
                  label: "Gordura corporal",
                  value: latest?.gordura != null ? `${latest.gordura}%` : "—",
                  note:
                    ordered.length > 1
                      ? `${(latest.gordura - first.gordura).toFixed(1)} pontos percentuais`
                      : "Seu ponto de partida",
                },
                {
                  label: "Cintura",
                  value: latest?.cintura != null ? `${latest.cintura} cm` : "—",
                  note:
                    ordered.length > 1
                      ? `${(latest.cintura - first.cintura).toFixed(1)} cm desde o início`
                      : "Seu ponto de partida",
                },
                {
                  label: "Treinos concluídos",
                  value: metrics.sessions.length,
                  note: "Seu movimento registrado",
                },
              ].map((m) => (
                <Panel key={m.label}>
                  <span className="metric-label">{m.label}</span>
                  <strong className="metric-value">{m.value}</strong>
                  <small className="metric-note">{m.note}</small>
                </Panel>
              ))}
            </div>
            <Panel>
              <PanelHead
                eyebrow="SUA LINHA DO TEMPO"
                title="Evolução das avaliações"
              />
              {ordered.length ? (
                <div className="evolution-chart">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={ordered}>
                      <CartesianGrid stroke="#ffffff0d" vertical={false} />
                      <XAxis
                        dataKey="data"
                        tickFormatter={shortDate}
                        tick={{ fill: "#969696", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fill: "#969696", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <Tooltip
                        labelFormatter={shortDate}
                        contentStyle={{
                          background: "#1b1b1b",
                          border: "1px solid #3e2b20",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        name="Peso (kg)"
                        stroke="#ff6a00"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#ff6a00" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="evaluation-records">
                    {[...ordered].reverse().map((e) => (
                      <div key={e.id}>
                        <span>{shortDate(e.data)}</span>
                        <strong>{e.peso} kg</strong>
                        <span>{e.gordura}% gordura</span>
                        <span>{e.cintura} cm cintura</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty
                  icon={TrendingUp}
                  title="Seu ponto de partida vem aí"
                  text="As avaliações cadastradas pelo seu personal vão formar sua linha de evolução."
                />
              )}
            </Panel>
            <Panel className="history-panel">
              <PanelHead eyebrow="PASSO A PASSO" title="Diário de movimento" />
              {metrics.sessions.length ? (
                [...metrics.sessions]
                  .sort((a, b) => b.created_at.localeCompare(a.created_at))
                  .map((e) => (
                    <div className="activity-line" key={e.id}>
                      <span className="section-icon">
                        <Dumbbell size={18} />
                      </span>
                      <div>
                        <strong>{e.payload.workoutName}</strong>
                        <small>
                          {shortDate(e.payload.date)} · {e.payload.duration} min
                          · Esforço {e.payload.effort}/10
                        </small>
                        {e.payload.note && <p>{e.payload.note}</p>}
                      </div>
                      <Pill tone="accent">Concluído</Pill>
                    </div>
                  ))
              ) : (
                <p className="muted">
                  Seu primeiro treino concluído vai aparecer aqui.
                </p>
              )}
            </Panel>
          </>
        )}

        {tab === "messages" && (
          <>
            <div className="page-title">
              <span className="eyebrow">ACOMPANHAMENTO DE PERTO</span>
              <h1>
                Uma conversa faz diferença<span className="accent-text">.</span>
              </h1>
              <p>
                Seu canal direto com {profile.personalNome || "seu personal"}.
              </p>
            </div>
            <Panel className="conversation">
              <div className="chat-person">
                <Avatar name={profile.personalNome || "Personal"} index={2} />
                <div>
                  <strong>{profile.personalNome || "Seu personal"}</strong>
                  <small>Mensagens do seu acompanhamento</small>
                </div>
                {onRefresh && (
                  <button className="text-action" onClick={onRefresh}>
                    Atualizar
                  </button>
                )}
              </div>
              <div className="chat-messages" aria-live="polite">
                {chats.length ? (
                  chats.map((m) => (
                    <div
                      className={`chat-bubble ${m.author === "coach" ? "received" : "sent"}`}
                      key={m.id}
                    >
                      <span>
                        {m.author === "coach"
                          ? profile.personalNome || "Personal"
                          : "Você"}
                      </span>
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
                    title="Pode chegar mais perto"
                    text="Tire dúvidas sobre a ficha, conte como foi o treino ou compartilhe uma conquista."
                  />
                )}
              </div>
              <form className="chat-compose" onSubmit={sendMessage}>
                <input
                  required
                  maxLength="2000"
                  aria-label="Mensagem para seu personal"
                  placeholder="Escreva para seu personal…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Action
                  type="submit"
                  disabled={sending || !message.trim()}
                  aria-label="Enviar mensagem"
                >
                  <Send size={18} />
                  <span>{sending ? "Enviando…" : "Enviar"}</span>
                </Action>
              </form>
              {messageError && (
                <p className="notice error" role="alert">
                  {messageError}
                </p>
              )}
            </Panel>
          </>
        )}

        {tab === "account" && (
          <>
            <div className="page-title">
              <span className="eyebrow">TUDO SOBRE SEU ACOMPANHAMENTO</span>
              <h1>
                Seu plano, do seu jeito<span className="accent-text">.</span>
              </h1>
            </div>
            <div className="student-top-grid">
              <Panel>
                <PanelHead
                  eyebrow="SEU OBJETIVO NO CENTRO"
                  title={student.objetivo}
                />
                <div className="plan-detail">
                  <Avatar name={student.nome} index={student.id} size="large" />
                  <div>
                    <h3>{student.nome}</h3>
                    <p>
                      {student.plano} · {student.academia || "Local a combinar"}
                    </p>
                  </div>
                </div>
                <dl className="detail-list">
                  <div>
                    <dt>Meta semanal</dt>
                    <dd>{metrics.goal} dias de treino</dd>
                  </div>
                  <div>
                    <dt>Foco do ciclo</dt>
                    <dd>
                      {student.focoDoCiclo || "Definido no seu acompanhamento"}
                    </dd>
                  </div>
                  <div>
                    <dt>Personal</dt>
                    <dd>{profile.personalNome}</dd>
                  </div>
                  <div>
                    <dt>Início da jornada</dt>
                    <dd>{shortDate(student.entrada)}</dd>
                  </div>
                </dl>
                <Action secondary onClick={() => navigate("messages")}>
                  <MessageCircle size={17} />
                  Falar com meu personal
                </Action>
              </Panel>
              <Panel>
                <PanelHead
                  eyebrow="SEUS COMPROMISSOS"
                  title="Próximos encontros"
                />
                {agenda.filter(
                  (a) => a.data >= today() && a.status !== "Cancelado",
                ).length ? (
                  [...agenda]
                    .filter(
                      (a) => a.data >= today() && a.status !== "Cancelado",
                    )
                    .sort((a, b) => a.data.localeCompare(b.data))
                    .map((a) => (
                      <div className="activity-line" key={a.id}>
                        <span className="date-block">
                          {a.data.slice(-2)}
                          <small>{shortDate(a.data).split(" ").at(-1)}</small>
                        </span>
                        <div>
                          <strong>{a.tipo}</strong>
                          <small>
                            {a.hora} · {a.local}
                          </small>
                        </div>
                        <Pill>{a.status}</Pill>
                      </div>
                    ))
                ) : (
                  <p className="muted">
                    Nenhum encontro futuro por aqui. Combine o próximo com seu
                    personal.
                  </p>
                )}
              </Panel>
            </div>
            <Panel>
              <PanelHead
                eyebrow="ORGANIZAÇÃO SEM SURPRESAS"
                title="Minhas mensalidades"
              />
              {payments.length ? (
                payments.map((p) => (
                  <div className="payment-line" key={p.id}>
                    <span className="section-icon">
                      <Wallet size={19} />
                    </span>
                    <div>
                      <strong>{p.descricao}</strong>
                      <small>
                        Vencimento {shortDate(p.vencimento)} · {p.forma}
                      </small>
                    </div>
                    <strong>{money(p.valor)}</strong>
                    <Pill tone={p.status === "Pago" ? "accent" : "amber"}>
                      {p.status}
                    </Pill>
                  </div>
                ))
              ) : (
                <p className="muted">Nenhuma mensalidade registrada.</p>
              )}
            </Panel>
            <Panel>
              <PanelHead
                eyebrow="SEU BEM-ESTAR AO LONGO DO TEMPO"
                title="Meus check-ins"
              />
              {events.filter((e) => e.kind === "checkin").length ||
              checkins.length ? (
                <div className="checkin-history">
                  {events
                    .filter((e) => e.kind === "checkin")
                    .sort((a, b) => b.created_at.localeCompare(a.created_at))
                    .map((e) => (
                      <div key={e.id}>
                        <strong>
                          {shortDate(e.payload.date)} · {e.payload.mood}
                        </strong>
                        <p>
                          Energia {e.payload.energy}/5 · Sono {e.payload.sleep}h
                        </p>
                        {e.payload.note && <p>{e.payload.note}</p>}
                      </div>
                    ))}
                  {[...checkins]
                    .sort((a, b) => b.data.localeCompare(a.data))
                    .map((c) => (
                      <div key={c.id}>
                        <strong>
                          {shortDate(c.data)} · {c.humor}
                        </strong>
                        <p>{c.observacoes}</p>
                        {c.resposta && <blockquote>{c.resposta}</blockquote>}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="muted">
                  Faça seu primeiro check-in para começar esse histórico.
                </p>
              )}
            </Panel>
          </>
        )}
      </main>
      <footer className="student-footer">
        <Brand small />
        <span>Seu objetivo tem nome. Seu acompanhamento também.</span>
      </footer>
      <nav className="student-bottom-nav" aria-label="Menu do aluno">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => navigate(t.key)}
          >
            <t.icon size={20} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      {training && (
        <TrainingSession
          workout={training}
          student={student}
          scope={scope}
          onSave={saveEvent}
          onClose={() => setTraining(null)}
        />
      )}
      {showCheckin && (
        <CheckinModal
          onSave={saveEvent}
          onClose={() => setShowCheckin(false)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={20} />
          {toast}
          <button onClick={() => setToast("")} aria-label="Fechar aviso">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

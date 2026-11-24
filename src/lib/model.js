export const sameId = (a, b) =>
  a != null && b != null && String(a) === String(b);
export const uid = () => crypto.randomUUID();
export function today(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dayOffset(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return today(date);
}
export function weekDays(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    return today(day);
  });
}
export function shortDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
export const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const initials = (name) =>
  (name || "Aluno")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
export const weeklyGoal = (student) =>
  Math.max(1, Math.min(7, Number(student?.metaSemanal) || 3));

// This projection is also enforced in SQL. Coach notes and other students never enter the portal.
export function studentProjection(student, state) {
  const pick = (source, keys) =>
    Object.fromEntries(
      keys.filter((k) => source?.[k] !== undefined).map((k) => [k, source[k]]),
    );
  const own = (key) =>
    (state[key] || []).filter((item) => sameId(item.alunoId, student.id));
  return {
    student: pick(student, [
      "id",
      "nome",
      "email",
      "plano",
      "objetivo",
      "status",
      "academia",
      "restricoes",
      "entrada",
      "metaSemanal",
      "focoDoCiclo",
      "mensagemPersonal",
    ]),
    profile: pick(state.profile, [
      "personalNome",
      "nomeNegocio",
      "whatsapp",
      "mensagemBoasVindas",
    ]),
    workouts: own("workouts").filter((w) => w.status !== "Inativo"),
    evaluations: own("evaluations").map((e) =>
      pick(e, [
        "id",
        "alunoId",
        "data",
        "peso",
        "gordura",
        "cintura",
        "peito",
        "quadril",
      ]),
    ),
    payments: own("payments"),
    agenda: own("agenda"),
    checkins: own("checkins"),
    events: own("events"),
  };
}

export function studentMetrics(student, events = [], date = new Date()) {
  const own = events.filter((e) => sameId(e.alunoId, student?.id));
  const sessions = own.filter((e) => e.kind === "workout");
  const week = weekDays(date);
  const sessionDays = new Set(
    sessions.map((e) => e.payload?.date || String(e.created_at).slice(0, 10)),
  );
  const completed = week.filter((day) => sessionDays.has(day)).length;
  const goal = weeklyGoal(student);
  const lastCheckin = own
    .filter((e) => e.kind === "checkin")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  return {
    sessions,
    completed,
    goal,
    percentage: Math.min(100, Math.round((completed / goal) * 100)),
    sessionDays,
    lastCheckin,
  };
}

export function parseExercise(exercise) {
  if (typeof exercise === "object")
    return {
      name: exercise.nome || exercise.name || "Exercício",
      prescription:
        exercise.prescricao || exercise.prescription || "Conforme orientação",
      count: Math.max(1, Math.min(12, Number(exercise.series) || 3)),
    };
  const match = String(exercise).match(/\s+(\d+)\s*x\s*(.+)$/i);
  return match
    ? {
        name: String(exercise).slice(0, match.index),
        prescription: `${match[1]} × ${match[2]}`,
        count: Math.max(1, Math.min(12, Number(match[1]))),
        reps: match[2],
      }
    : {
        name: String(exercise),
        prescription: "Conforme orientação",
        count: 1,
        reps: "",
      };
}
export function workoutForDay(workouts, events = [], date = new Date()) {
  const labels = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  const normalize = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const active = workouts.filter((w) => w.status !== "Inativo");
  const scheduled = active.filter((w) =>
    normalize(w.dias).includes(labels[date.getDay()]),
  );
  const candidates = scheduled.length ? scheduled : active;
  const completedToday = new Set(
    events
      .filter(
        (e) =>
          e.kind === "workout" &&
          (e.payload?.date || e.created_at?.slice(0, 10)) === today(date),
      )
      .map((e) => String(e.payload.workoutId)),
  );
  return (
    candidates.find((w) => !completedToday.has(String(w.id))) || candidates[0]
  );
}

export function normalizeEvent(event) {
  return {
    ...event,
    alunoId: event.alunoId ?? event.student_id,
    author:
      event.author || (event.author_role === "coach" ? "coach" : "student"),
  };
}

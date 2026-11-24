import test from "node:test";
import assert from "node:assert/strict";
import {
  parseExercise,
  studentMetrics,
  studentProjection,
  weekDays,
  workoutForDay,
} from "../src/lib/model.js";

test("individual portal excludes coach notes, other pupils and private assessment notes", () => {
  const projected = studentProjection(
    { id: 101, nome: "Lucas", observacoes: "INTERNAL", metaSemanal: 4 },
    {
      profile: {
        personalNome: "Coach",
        email: "private@example.com",
        cref: "PRIVATE",
      },
      workouts: [
        { id: 1, alunoId: 101, status: "Ativo" },
        { id: 2, alunoId: 102 },
        { id: 3, alunoId: 101, status: "Inativo" },
      ],
      evaluations: [
        { id: 1, alunoId: 101, peso: 80, observacoes: "INTERNAL" },
        { id: 2, alunoId: 102, peso: 65 },
      ],
      payments: [{ id: 1, alunoId: 102, valor: 999 }],
      events: [
        { id: 1, alunoId: "101" },
        { id: 2, alunoId: 102 },
      ],
    },
  );
  assert.equal(projected.student.observacoes, undefined);
  assert.equal(projected.profile.email, undefined);
  assert.equal(projected.evaluations[0].observacoes, undefined);
  assert.deepEqual(
    projected.workouts.map((w) => w.id),
    [1],
  );
  assert.equal(projected.payments.length, 0);
  assert.deepEqual(
    projected.events.map((e) => e.id),
    [1],
  );
});
test("weekly consistency counts distinct days, uses Monday and crosses month boundaries", () => {
  const date = new Date(2026, 10, 1, 12);
  assert.deepEqual(weekDays(date), [
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
  ]);
  const session = (id, day) => ({
    alunoId: id,
    kind: "workout",
    created_at: day + "T12:00:00Z",
    payload: { date: day },
  });
  const m = studentMetrics(
    { id: 101, metaSemanal: 2 },
    [
      session(101, "2026-10-26"),
      session(101, "2026-10-26"),
      session("101", "2026-11-01"),
      session(102, "2026-10-27"),
      session(101, "2026-10-25"),
    ],
    date,
  );
  assert.equal(m.completed, 2);
  assert.equal(m.percentage, 100);
});
test("legacy prescriptions stay readable and the suggested workout respects the day and logs", () => {
  assert.deepEqual(parseExercise("Supino reto 4x10"), {
    name: "Supino reto",
    prescription: "4 × 10",
    count: 4,
    reps: "10",
  });
  assert.equal(parseExercise("Prancha 3x40s").reps, "40s");
  assert.equal(parseExercise("Bike HIIT 12 min").count, 1);
  const workouts = [
    { id: 1, dias: "Segunda e quinta", status: "Ativo" },
    { id: 2, dias: "Terça e sexta", status: "Ativo" },
    { id: 3, dias: "Terça", status: "Inativo" },
  ];
  assert.equal(workoutForDay(workouts, [], new Date(2026, 10, 24, 12)).id, 2);
  assert.equal(workoutForDay([], []), undefined);
});

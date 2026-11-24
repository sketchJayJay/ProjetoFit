import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("migration preserves records and enforces invitations, isolation, revocation and write conflicts", async () => {
  const db = new PGlite();
  const owner = "10000000-0000-4000-8000-000000000001",
    otherCoach = "10000000-0000-4000-8000-000000000002",
    pupil = "20000000-0000-4000-8000-000000000001",
    stranger = "20000000-0000-4000-8000-000000000002";
  try {
    await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('email',current_setting('request.jwt.claim.email',true))$$;
      grant usage on schema auth to authenticated;
      insert into auth.users values ('${owner}','coach@example.com'),('${otherCoach}','other@example.com'),('${pupil}','lucas@example.com'),('${stranger}','stranger@example.com');`);
    const base = (
      await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8")
    )
      .replace("create extension if not exists pgcrypto;", "")
      .split("-- Opcional")[0];
    await db.exec(base);
    await db.exec(
      "grant select,insert,update on public.app_snapshots to authenticated",
    );
    const snapshot = {
      evofit_students_v2: [
        {
          id: 101,
          nome: "Lucas",
          email: "lucas@example.com",
          observacoes: "COACH_SECRET",
          status: "Ativo",
        },
        {
          id: 102,
          nome: "Mariana",
          email: "mari@example.com",
          status: "Ativo",
        },
      ],
      evofit_profile_v2: { personalNome: "Coach", email: "COACH_EMAIL_SECRET" },
      evofit_workouts_v2: [
        {
          id: 1,
          alunoId: 101,
          nome: "A",
          exercicios: ["Supino 3x10"],
          status: "Ativo",
        },
        { id: 2, alunoId: 102, nome: "B", status: "Ativo" },
      ],
      evofit_evaluations_v2: [
        { id: 1, alunoId: 101, peso: 80, observacoes: "ASSESSMENT_SECRET" },
        { id: 2, alunoId: 102, peso: 60 },
      ],
      evofit_payments_v2: [
        { id: 1, alunoId: 101, valor: 100 },
        { id: 2, alunoId: 102, valor: 900 },
      ],
      evofit_checkins_v2: [],
      evofit_agenda_v2: [],
    };
    await db.query(
      "insert into app_snapshots(user_id,payload) values($1,$2),($3,$2)",
      [owner, JSON.stringify(snapshot), otherCoach],
    );
    const migration = await readFile(
      new URL("../supabase/upgrade-v2.sql", import.meta.url),
      "utf8",
    );
    await db.exec(migration);
    await db.exec(migration);
    assert.equal(
      (await db.query("select count(*)::int n from app_snapshots")).rows[0].n,
      2,
      "migration retains existing rows",
    );
    async function as(id, email) {
      await db.exec("reset role");
      await db.query(
        "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.email',$2,false)",
        [id, email],
      );
      await db.exec("set role authenticated");
    }
    const rpc = async (sql, args = []) => db.query(sql, args);
    await as(owner, "coach@example.com");
    assert.equal(
      (await rpc("select * from app_snapshots")).rows.length,
      1,
      "coach only reads own snapshot",
    );
    const invite = (
      await rpc("select create_student_invite($1,$2) as v", [
        "101",
        "lucas@example.com",
      ])
    ).rows[0].v;
    assert.equal(invite.token.length, 72);
    await assert.rejects(
      rpc("select create_student_invite($1,$2)", [
        "101",
        "intruder@example.com",
      ]),
      /e-mail salvo/,
    );
    await as(stranger, "stranger@example.com");
    await assert.rejects(
      rpc("select accept_student_invite($1)", [invite.token]),
      /e-mail autorizado/,
    );
    await assert.rejects(
      rpc("select get_student_portal($1)", [invite.id]),
      /não está disponível/,
    );
    await as(pupil, "lucas@example.com");
    await rpc("select accept_student_invite($1)", [invite.token]);
    const result = (
      await rpc("select get_student_portal($1) as v", [invite.id])
    ).rows[0].v;
    const encoded = JSON.stringify(result);
    for (const secret of [
      "Mariana",
      "COACH_SECRET",
      "COACH_EMAIL_SECRET",
      "ASSESSMENT_SECRET",
    ])
      assert.ok(!encoded.includes(secret), "portal omits " + secret);
    assert.equal(result.workouts.length, 1);
    assert.equal(result.payments[0].valor, 100);
    assert.equal(
      (await rpc("select * from app_snapshots")).rows.length,
      0,
      "student cannot read owner snapshot directly",
    );
    await assert.rejects(
      rpc(
        "insert into student_portal_events(id,owner_id,student_id,author_id,author_role,kind,payload) values(gen_random_uuid(),$1,'101',$2,'coach','message','{}')",
        [owner, pupil],
      ),
      /permission denied/,
    );
    await rpc("select submit_student_event($1,gen_random_uuid(),$2,$3)", [
      invite.id,
      "message",
      JSON.stringify({ text: "Olá, personal" }),
    ]);
    const day = (await rpc("select current_date::text as d")).rows[0].d;
    await assert.rejects(
      rpc("select submit_student_event($1,gen_random_uuid(),$2,$3)", [
        invite.id,
        "checkin",
        JSON.stringify({ date: day, energy: 9, sleep: 7, mood: "Bem" }),
      ]),
      /Energia inválida/,
    );
    const workout = {
      workoutId: 1,
      workoutName: "A",
      date: day,
      duration: 35,
      effort: 7,
      exercises: [
        { name: "Supino", sets: [{ done: true, kg: "20", reps: "10" }] },
      ],
    };
    await assert.rejects(
      rpc("select submit_student_event($1,gen_random_uuid(),$2,$3)", [
        invite.id,
        "workout",
        JSON.stringify({ ...workout, workoutId: 2 }),
      ]),
      /não pertence/,
    );
    await rpc("select submit_student_event($1,gen_random_uuid(),$2,$3)", [
      invite.id,
      "workout",
      JSON.stringify(workout),
    ]);
    await rpc("select submit_student_event($1,gen_random_uuid(),$2,$3)", [
      invite.id,
      "workout",
      JSON.stringify(workout),
    ]);
    assert.equal(
      (
        await rpc("select get_student_portal($1) as v", [invite.id])
      ).rows[0].v.events.filter((e) => e.kind === "workout").length,
      1,
      "daily duplicate completions are idempotent",
    );
    await as(owner, "coach@example.com");
    assert.equal(
      (await rpc("select * from student_portal_events")).rows.length,
      2,
    );
    assert.equal(
      (
        await rpc("select save_coach_snapshot($1,0) as v", [
          JSON.stringify(snapshot),
        ])
      ).rows[0].v,
      1,
    );
    await assert.rejects(
      rpc("select save_coach_snapshot($1,0)", [JSON.stringify(snapshot)]),
      /outro dispositivo/,
    );
    await rpc("select revoke_student_access($1)", ["101"]);
    await as(pupil, "lucas@example.com");
    assert.deepEqual(
      (await rpc("select my_student_portals() as v")).rows[0].v,
      [],
    );
    await assert.rejects(
      rpc("select get_student_portal($1)", [invite.id]),
      /não está disponível/,
    );
    await assert.rejects(
      rpc("select submit_student_event($1,gen_random_uuid(),$2,$3)", [
        invite.id,
        "message",
        JSON.stringify({ text: "Não permitido" }),
      ]),
      /revogado/,
    );
    await db.exec("reset role");
    await db.exec("set role anon");
    await assert.rejects(
      rpc("select get_student_portal($1)", [invite.id]),
      /permission denied/,
    );
    await assert.rejects(
      rpc("select create_student_invite($1,$2)", ["101", "lucas@example.com"]),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});

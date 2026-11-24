import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Action, Brand, Empty, Field, Panel } from "../components/ui";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { normalizeEvent, uid } from "../lib/model";
import StudentExperience from "./StudentExperience";

const errorMessage = (error) =>
  /Could not find|does not exist|schema cache/.test(error?.message || "")
    ? "A atualização do banco precisa ser aplicada. Execute supabase/upgrade-v2.sql no SQL Editor do Supabase e tente novamente."
    : error?.message || "Não foi possível conectar. Tente novamente.";

function AuthScreen({ portal, invite }) {
  const [mode, setMode] = useState("signin"),
    [form, setForm] = useState({ email: "", password: "", name: "" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [info, setInfo] = useState("");
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
      } else {
        if (portal && !invite)
          throw new Error(
            "Para criar sua conta de aluno, abra o convite enviado pelo seu personal.",
          );
        const redirect = new URL(window.location.href);
        redirect.hash = "";
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { name: form.name },
            emailRedirectTo: redirect.toString(),
          },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo(
            "Conta criada. Confirme o e-mail e depois entre com sua senha. Se necessário, abra novamente o convite do seu personal.",
          );
          setMode("signin");
        }
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-world">
      <div className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">
            {portal ? "ESSA JORNADA É SUA" : "PARA QUEM TRANSFORMA VIDAS"}
          </span>
          <h1>
            {portal ? (
              <>
                Seu próximo
                <br />
                capítulo começa
                <br />
                <em>em movimento.</em>
              </>
            ) : (
              <>
                Seu impacto.
                <br />
                Cada aluno.
                <br />
                <em>Uma evolução.</em>
              </>
            )}
          </h1>
          <p>
            {portal
              ? "Treinos, conquistas e um acompanhamento com seu nome. Tudo no mesmo lugar."
              : "Mais proximidade, mais constância e uma experiência que acompanha cada objetivo."}
          </p>
        </div>
        <span className="auth-footnote">
          EVOFIT PRO · ACOMPANHAMENTO INDIVIDUAL
        </span>
      </div>
      <Panel className="auth-card">
        <PillLabel portal={portal} />
        <h2>
          {mode === "signin"
            ? "Que bom ter você aqui."
            : "Vamos começar sua jornada."}
        </h2>
        <p>
          {portal
            ? "Entre com o e-mail autorizado pelo seu personal."
            : "Acesse seu espaço de acompanhamento."}
        </p>
        <div className="manager-tabs">
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => {
              setMode("signin");
              setError("");
            }}
          >
            Entrar
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Criar conta
          </button>
        </div>
        <form className="form-stack" onSubmit={submit}>
          {mode === "signup" && (
            <Field
              label="Seu nome"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <Field
            label="Seu e-mail"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Field
            label="Sua senha"
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            minLength={6}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Action type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle size={18} className="spin" />
            ) : (
              <ArrowRight size={18} />
            )}{" "}
            {mode === "signin" ? "Entrar no meu painel" : "Criar minha conta"}
          </Action>
        </form>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="notice" role="status">
            {info}
          </p>
        )}
        <div className="auth-switch">
          <a href={portal ? "?" : "?portal=1"}>
            {portal ? "Sou personal trainer" : "Sou aluno"}
          </a>
        </div>
      </Panel>
    </div>
  );
}
function PillLabel({ portal }) {
  return (
    <span className="pill lime">
      <ShieldCheck size={14} />
      {portal ? "ESPAÇO DO ALUNO" : "PAINEL DO PERSONAL"}
    </span>
  );
}
function Loading({ text = "Preparando seu espaço…" }) {
  return (
    <div className="gateway-state">
      <Brand />
      <LoaderCircle className="spin lime-text" size={28} />
      <p>{text}</p>
    </div>
  );
}

function RemoteStudent({ session, invite, onExit }) {
  const [accesses, setAccesses] = useState(null),
    [selected, setSelected] = useState(null),
    [data, setData] = useState(null),
    [error, setError] = useState("");
  const mounted = useRef(true),
    activeId = useRef(null);
  const refresh = useCallback(async (id = activeId.current) => {
    if (!id) return;
    const { data: result, error } = await supabase.rpc("get_student_portal", {
      p_access_id: id,
    });
    if (!mounted.current || activeId.current !== id) return;
    if (error) {
      setData(null);
      setError(errorMessage(error));
      return;
    }
    setData({ ...result, events: (result.events || []).map(normalizeEvent) });
    setError("");
  }, []);
  const load = useCallback(async () => {
    setError("");
    try {
      if (invite) {
        const { error } = await supabase.rpc("accept_student_invite", {
          p_token: invite,
        });
        if (error) throw error;
        sessionStorage.removeItem("evofit_pending_invite");
        history.replaceState(null, "", `${location.pathname}?portal=1`);
      }
      const { data: rows, error } = await supabase.rpc("my_student_portals");
      if (error) throw error;
      if (!mounted.current) return;
      setAccesses(rows || []);
      const id = rows?.[0]?.id || null;
      activeId.current = id;
      setSelected(id);
      await refresh(id);
    } catch (err) {
      if (mounted.current) setError(errorMessage(err));
    }
  }, [invite, refresh]);
  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  useEffect(() => {
    const onFocus = () => refresh();
    const id = setInterval(() => {
      if (!document.hidden) refresh();
    }, 20000);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);
  async function event(kind, payload) {
    const { error } = await supabase.rpc("submit_student_event", {
      p_access_id: selected,
      p_id: uid(),
      p_kind: kind,
      p_payload: payload,
    });
    if (error) throw new Error(errorMessage(error));
    await refresh(selected);
  }
  if (error)
    return (
      <div className="gateway-state">
        <Brand />
        <Panel>
          <Empty
            icon={ShieldCheck}
            title="Não conseguimos abrir este acompanhamento"
            text={error}
            action={
              <div className="manager-actions">
                <Action onClick={load}>Tentar novamente</Action>
                <Action secondary onClick={onExit}>
                  Trocar de conta
                </Action>
              </div>
            }
          />
        </Panel>
      </div>
    );
  if (accesses?.length === 0)
    return (
      <div className="gateway-state">
        <Brand />
        <Panel>
          <Empty
            icon={ShieldCheck}
            title="Seu espaço espera um convite"
            text="Abra o link enviado pelo seu personal e entre com o e-mail autorizado. Seu painel aparece depois da ativação."
            action={
              <Action secondary onClick={onExit}>
                Sair da conta
              </Action>
            }
          />
        </Panel>
      </div>
    );
  if (!data) return <Loading text="Abrindo seu acompanhamento individual…" />;
  return (
    <>
      {accesses?.length > 1 && (
        <div className="portal-switch">
          <label>
            Meu acompanhamento
            <select
              value={selected}
              onChange={(e) => {
                activeId.current = e.target.value;
                setSelected(e.target.value);
                setData(null);
                refresh(e.target.value);
              }}
            >
              {accesses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.coach_name || "Personal"} · {a.student_name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <StudentExperience
        data={data}
        onEvent={event}
        onExit={onExit}
        scope={selected}
        onRefresh={() => refresh()}
      />
    </>
  );
}

function CoachCloud({ session, storage, render }) {
  const [ready, setReady] = useState(false),
    [status, setStatus] = useState("syncing"),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const revision = useRef(null),
    baseline = useRef(""),
    blocked = useRef(false),
    inFlight = useRef(Promise.resolve()),
    timer = useRef(null),
    alive = useRef(true);
  const pendingKey = `evofit_pending_snapshot_${session.user.id}`;
  const flush = useCallback(() => {
    const job = async () => {
      if (blocked.current)
        throw new Error(
          "Há uma versão mais recente na nuvem. Exporte uma cópia antes de recarregar os dados.",
        );
      const payload = storage.read();
      const serialized = JSON.stringify(payload);
      if (serialized === baseline.current) return;
      setStatus("syncing");
      const { data, error } = await supabase.rpc("save_coach_snapshot", {
        p_payload: payload,
        p_expected_revision: revision.current,
      });
      if (error) {
        if (error.code === "40001") blocked.current = true;
        if (alive.current) {
          setStatus("error");
          setError(errorMessage(error));
        }
        throw new Error(errorMessage(error));
      }
      revision.current = data;
      baseline.current = serialized;
      if (JSON.stringify(storage.read()) === serialized)
        localStorage.removeItem(pendingKey);
      else
        localStorage.setItem(
          pendingKey,
          JSON.stringify({ revision: data, payload: storage.read() }),
        );
      if (alive.current) {
        setStatus("online");
        setError("");
      }
    };
    const next = inFlight.current.catch(() => {}).then(job);
    inFlight.current = next;
    return next;
  }, [storage, pendingKey]);
  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    setReady(false);
    setError("");
    blocked.current = false;
    storage.owner(session.user.id);
    async function hydrate() {
      try {
        const { data, error } = await supabase
          .from("app_snapshots")
          .select("payload,revision")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        const payload = data?.payload || storage.empty(session.user);
        let pending = null;
        try {
          pending = JSON.parse(localStorage.getItem(pendingKey));
        } catch {}
        storage.write(payload, storage.empty(session.user));
        revision.current = data?.revision ?? null;
        baseline.current = JSON.stringify(storage.read());
        if (pending?.payload) {
          storage.write(pending.payload, storage.empty(session.user));
          if (pending.revision !== revision.current) {
            blocked.current = true;
            setError(
              "Há alterações locais pendentes e uma versão diferente na nuvem. Exporte uma cópia antes de recarregar.",
            );
            setStatus("error");
          } else setStatus("syncing");
        } else setStatus("online");
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
          setStatus("error");
        }
      }
    }
    hydrate();
    return () => {
      cancelled = true;
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, [session.user.id, retry, storage, pendingKey]);
  useEffect(() => {
    if (!ready) return;
    function schedule() {
      clearTimeout(timer.current);
      if (JSON.stringify(storage.read()) !== baseline.current) {
        try {
          localStorage.setItem(
            pendingKey,
            JSON.stringify({
              revision: revision.current,
              payload: storage.read(),
            }),
          );
        } catch {}
      }
      timer.current = setTimeout(() => {
        flush().catch(() => {});
      }, 650);
    }
    if (localStorage.getItem(pendingKey)) schedule();
    function leaving(e) {
      if (JSON.stringify(storage.read()) !== baseline.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    function hidden() {
      if (document.hidden) flush().catch(() => {});
    }
    window.addEventListener("evofit-storage-update", schedule);
    window.addEventListener("beforeunload", leaving);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("evofit-storage-update", schedule);
      window.removeEventListener("beforeunload", leaving);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [ready, flush, storage, pendingKey]);
  function backup() {
    const blob = new Blob([JSON.stringify(storage.read(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "EvoFit-copia-local.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (!ready)
    return error ? (
      <div className="gateway-state">
        <Brand />
        <Panel>
          <Empty
            icon={ShieldCheck}
            title="Vamos reconectar seu painel"
            text={error}
            action={
              <Action onClick={() => setRetry((r) => r + 1)}>
                Tentar novamente
              </Action>
            }
          />
        </Panel>
      </div>
    ) : (
      <Loading />
    );
  return (
    <>
      {error && (
        <div className="cloud-error" role="alert">
          <span>
            {blocked.current
              ? "Outro dispositivo alterou estes dados. Exporte uma cópia local antes de recarregar para revisar suas alterações."
              : error}
          </span>
          <button onClick={backup}>Exportar cópia</button>
          <button
            onClick={() => {
              if (blocked.current) {
                const pending = localStorage.getItem(pendingKey);
                if (pending)
                  localStorage.setItem(`${pendingKey}_recovery`, pending);
                localStorage.removeItem(pendingKey);
                setRetry((r) => r + 1);
              } else flush().catch(() => {});
            }}
          >
            {blocked.current ? "Recarregar da nuvem" : "Tentar salvar"}
          </button>
        </div>
      )}
      {render({ session, cloudStatus: status, flush })}
    </>
  );
}

export function useCoachEvents(session) {
  const [events, setEvents] = useState([]),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!session?.user?.id) return;
    const all = [];
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from("student_portal_events")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false })
        .order("id")
        .range(offset, offset + 999);
      if (error) {
        setError(errorMessage(error));
        return;
      }
      all.push(...(data || []));
      if (!data || data.length < 1000) break;
      offset += 1000;
    }
    setEvents(all.map(normalizeEvent));
    setError("");
  }, [session?.user?.id]);
  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, 20000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);
  async function send(studentId, text) {
    const { error } = await supabase.rpc("send_coach_message", {
      p_student_id: String(studentId),
      p_id: uid(),
      p_text: text,
    });
    if (error) throw new Error(errorMessage(error));
    await refresh();
  }
  return { events, error, refresh, send };
}

export default function CloudGateway({ storage, render }) {
  const [session, setSession] = useState(null),
    [ready, setReady] = useState(!isSupabaseConfigured),
    [portal, setPortal] = useState(
      new URLSearchParams(location.search).has("portal"),
    ),
    [roleReady, setRoleReady] = useState(false),
    [authError, setAuthError] = useState("");
  const [invite] = useState(() => {
    const token = new URLSearchParams(location.hash.slice(1)).get("convite");
    if (token) sessionStorage.setItem("evofit_pending_invite", token);
    return (
      token ||
      (new URLSearchParams(location.search).has("portal")
        ? sessionStorage.getItem("evofit_pending_invite")
        : null)
    );
  });
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (alive) {
          if (error) setAuthError(error.message);
          setSession(data.session);
          setReady(true);
        }
      })
      .catch((e) => {
        if (alive) {
          setAuthError(e.message);
          setReady(true);
        }
      });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (alive) {
        setSession(next);
        setReady(true);
      }
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    let alive = true;
    setRoleReady(false);
    async function resolve() {
      if (portal || invite) {
        setRoleReady(true);
        return;
      }
      const [{ data: memberships }, { data: own }] = await Promise.all([
        supabase.rpc("my_student_portals"),
        supabase
          .from("app_snapshots")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle(),
      ]);
      if (alive) {
        if (memberships?.length && !own) setPortal(true);
        setRoleReady(true);
      }
    }
    resolve().catch((e) => {
      if (alive) {
        setAuthError(e.message);
        setRoleReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [session?.user?.id, portal, invite]);
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setRoleReady(false);
    storage.owner("demo");
  }
  if (!isSupabaseConfigured) {
    storage.owner("demo");
    if (portal)
      return (
        <div className="gateway-state">
          <Brand />
          <Panel>
            <Empty
              icon={ShieldCheck}
              title="O acesso online ainda não está configurado"
              text="O personal pode apresentar a prévia de cada aluno no painel. Para entrar de outro dispositivo, é preciso conectar o banco e ativar seu convite."
              action={
                <a className="action" href="?">
                  Voltar ao painel de demonstração
                </a>
              }
            />
          </Panel>
        </div>
      );
    return render({
      session: null,
      cloudStatus: "demo",
      flush: async () => {},
    });
  }
  if (!ready) return <Loading text="Verificando seu acesso…" />;
  if (!session)
    return (
      <>
        {authError && <p className="cloud-error">{authError}</p>}
        <AuthScreen portal={portal || Boolean(invite)} invite={invite} />
      </>
    );
  if (!roleReady) return <Loading />;
  if (portal || invite)
    return (
      <RemoteStudent
        key={session.user.id}
        session={session}
        invite={invite}
        onExit={signOut}
      />
    );
  return (
    <CoachCloud
      key={session.user.id}
      session={session}
      storage={storage}
      render={(props) => render({ ...props, onSignOut: signOut })}
    />
  );
}

export type PulseAgent = {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  endpoint?: string;
  bearer: string;
  createdAt: number;
  trades: number;
};

type Draft = {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  endpoint?: string;
  code: string;
};

type AgentState = {
  drafts: Map<string, Draft>;
  agents: Map<string, PulseAgent>;
  byBearer: Map<string, string>;
};

declare global {
  // eslint-disable-next-line no-var
  var __PULSE_AGENTS__: AgentState | undefined;
}

function state(): AgentState {
  if (!globalThis.__PULSE_AGENTS__) {
    globalThis.__PULSE_AGENTS__ = {
      drafts: new Map(),
      agents: new Map(),
      byBearer: new Map(),
    };
  }
  return globalThis.__PULSE_AGENTS__;
}

function token(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function preRegister(input: {
  name: string;
  description: string;
  capabilities?: string[];
  endpoint?: string;
}) {
  const name = input.name.trim();
  const description = input.description.trim();
  if (name.length < 3 || name.length > 64) throw new Error("name 3-64 chars");
  if (description.length < 10 || description.length > 500) throw new Error("description 10-500 chars");
  const id = token("draft");
  const code = `PULSE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  state().drafts.set(id, {
    id,
    name,
    description,
    capabilities: input.capabilities ?? ["odds"],
    endpoint: input.endpoint,
    code,
  });
  return { agent_id: id, verification_code: code };
}

export function confirm(agentId: string, code: string) {
  const draft = state().drafts.get(agentId);
  if (!draft || draft.code !== code) throw new Error("invalid code");
  state().drafts.delete(agentId);
  const id = token("agent");
  const bearer = token("pb_live");
  const agent: PulseAgent = {
    id,
    name: draft.name,
    description: draft.description,
    capabilities: draft.capabilities,
    endpoint: draft.endpoint,
    bearer,
    createdAt: Date.now(),
    trades: 0,
  };
  state().agents.set(id, agent);
  state().byBearer.set(bearer, id);
  return { agent_id: id, bearer, message: "Save bearer now. Shown once." };
}

export function listAgents(): Omit<PulseAgent, "bearer">[] {
  return [...state().agents.values()].map(({ bearer: _b, ...rest }) => rest);
}

export function byBearer(bearer: string): PulseAgent | undefined {
  const id = state().byBearer.get(bearer);
  if (!id) return undefined;
  return state().agents.get(id);
}

export function bumpTrades(id: string) {
  const a = state().agents.get(id);
  if (a) a.trades += 1;
}

export function authHeader(req: Request): PulseAgent | undefined {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(\S+)/i.exec(h);
  if (!m) return undefined;
  return byBearer(m[1]);
}

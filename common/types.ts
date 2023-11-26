export enum HealthState {
  Active,
  Retrying,
  Disabled,
}

export type SlackConnectorConfig = {
  token: string;
  enabled: boolean;
};

export type ApiConnectorConfig = {
  readUrl: string;
  writeUrl: string;
  data: any;
  enabled: boolean;
};

export type PulseConfig = {
  connectors: {
    slack?: SlackConnectorConfig;
    api?: ApiConnectorConfig;
  };
};

export interface Connector {
  fetchStatus: () => Promise<void>;
  setStatus: (active: boolean) => Promise<void>;
}

export type Connectors = Partial<Record<"slack" | "api", Connector>>;
export type Connections = Partial<Record<"slack" | "api", boolean>>;

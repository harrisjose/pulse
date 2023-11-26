import { EventEmitter } from "events";
import { ApiConnectorConfig, HealthState } from "../../common/types";

export default class ApiConnector {
  private info = { name: "api" } as const;
  private config: ApiConnectorConfig;
  private isActive: boolean;
  private healthState: HealthState;
  private emitter: EventEmitter;

  constructor(config: ApiConnectorConfig, emitter: EventEmitter) {
    this.config = config;
    this.isActive = false;
    this.healthState = HealthState.Active;
    this.emitter = emitter;
  }

  private sync() {
    this.emitter.emit("onStatusChange", {
      ...this.info,
      status: this.isActive,
    });
  }

  async fetchStatus(): Promise<void> {
    if (!this.config.enabled || this.healthState === HealthState.Disabled)
      return;
    try {
      const response = await fetch(this.config.readUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      this.isActive = data.status;
      this.healthState = HealthState.Active;
      this.sync();
    } catch (error) {
      console.error("Error getting API status:", error);
      this.healthState = HealthState.Retrying;
    }
  }

  async setStatus(active: boolean): Promise<void> {
    if (!this.config.enabled || this.healthState === HealthState.Disabled)
      return;
    try {
      const payload = { ...this.config.data, status: active };
      await fetch(this.config.writeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      this.isActive = active;
      this.healthState = HealthState.Active;
      this.sync();
    } catch (error) {
      console.error("Error setting API status:", error);
      this.healthState = HealthState.Retrying;
    }
  }

  isActiveStatus(): boolean {
    return this.isActive;
  }

  getHealthState(): HealthState {
    return this.healthState;
  }
}

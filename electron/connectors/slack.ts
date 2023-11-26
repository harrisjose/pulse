import { EventEmitter } from "stream";
import { HealthState, SlackConnectorConfig } from "../../common/types";

export default class SlackConnector {
  private info = { name: "slack" } as const;
  private config: SlackConnectorConfig;
  private isActive: boolean;
  private healthState: HealthState;
  private emitter: EventEmitter;

  constructor(config: SlackConnectorConfig, emitter: EventEmitter) {
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
      const response = await fetch("https://slack.com/api/users.getPresence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      this.isActive = data.presence === "active";
      this.healthState = HealthState.Active;
      this.sync();
    } catch (error) {
      console.error("Error getting Slack presence:", error);
      this.healthState = HealthState.Retrying;
    }
  }

  async setStatus(active: boolean): Promise<void> {
    if (!this.config.enabled || this.healthState === HealthState.Disabled)
      return;

    try {
      const presence = active ? "auto" : "away";
      const result = await fetch("https://slack.com/api/users.setPresence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presence }),
      });
      console.log(await result.json());
      this.isActive = active;
      this.healthState = HealthState.Active;
      this.sync();
    } catch (error) {
      console.error("Error setting Slack presence:", error);
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

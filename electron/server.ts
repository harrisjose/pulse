import { app, BrowserWindow } from "electron";
import { createIPCHandler } from "electron-trpc/main";
import { EventEmitter } from "events";
import path from "path";
import { ApiConnectorConfig, Connectors, PulseConfig } from "../common/types";
import { createRouter } from "./api";
import { loadConfig } from "./config";
import ApiConnector from "./connectors/api";
import SlackConnector from "./connectors/slack";
import createWindow from "./window";

process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

const emitter = new EventEmitter();

app.on("ready", () => {
  const config: PulseConfig = loadConfig();
  if (
    !Object.values(config.connectors).some((value) => {
      return (value as ApiConnectorConfig).enabled;
    })
  ) {
    throw new Error("Atleast one connector needs to be enabled");
  }

  const enabled = Object.keys(config.connectors).filter(
    (k) => config.connectors[k].enabled
  );

  const connectors = {} as Connectors;
  enabled.forEach((c) => {
    switch (c) {
      case "slack":
        connectors["slack"] = new SlackConnector(
          config.connectors.slack!,
          emitter
        );
        break;
      case "api":
        connectors["api"] = new ApiConnector(config.connectors.api!, emitter);
      default:
        break;
    }
  });

  const win = createWindow();
  createIPCHandler({
    router: createRouter(connectors, emitter),
    windows: [win],
  });
  app.dock.hide();

  setInterval(() => {
    Object.values(connectors).forEach((c) => c.fetchStatus());
  }, 7000);
});

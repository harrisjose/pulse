import { BrowserWindow, Menu, Tray } from "electron";
import { is } from "electron-util";
import path from "path";

const preload = path.join(__dirname, "./preload.js");
const url = process.env["VITE_DEV_SERVER_URL"];

export default function createWindow() {
  const win = new BrowserWindow({
    width: 200,
    height: 200,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      preload,
      devTools: true,
    },
  });

  if (is.development) {
    win.loadURL(url!);
    // win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(process.env.DIST!, "index.html"));
  }

  const icon = path.join(process.env.PUBLIC!, "./icons/pulseTemplate.png");
  const getWindowPosition = () => {
    const windowBounds = win.getBounds();
    const trayBounds = tray.getBounds();
    const x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
    );
    const y = Math.round(trayBounds.y + trayBounds.height);
    return { x, y };
  };

  const tray = new Tray(icon);
  tray.setIgnoreDoubleClickEvents(true);

  tray.on("click", () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      const position = getWindowPosition();
      win.setPosition(position.x, position.y, false);
      win.show();
      win.setVisibleOnAllWorkspaces(true);
      win.focus();
      win.setVisibleOnAllWorkspaces(false);
    }
  });

  tray.on("right-click", () => {
    tray.popUpContextMenu(
      Menu.buildFromTemplate([
        {
          label: "Launch at startup",
          type: "checkbox",
          checked: true,
          click: (event) => () => {},
        },
        { type: "separator" },
        {
          label: "Quit",
          role: "quit",
        },
      ])
    );
  });

  return win;
}

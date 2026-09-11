import { BrowserWindow as e, Menu as t, app as n, ipcMain as r } from "electron";
import i from "node:path";
import { fileURLToPath as a } from "node:url";
//#region electron/main.ts
var o = i.dirname(a(import.meta.url));
async function s() {
	let n = new e({
		width: 1680,
		height: 1080,
		minWidth: 960,
		minHeight: 640,
		backgroundColor: "#1f1d1f",
		frame: !1,
		webPreferences: {
			nodeIntegration: !1,
			contextIsolation: !0,
			preload: i.join(o, "preload.mjs")
		}
	}), r = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL;
	r ? await n.loadURL(r) : await n.loadFile(i.join(o, "../dist/index.html")), t.setApplicationMenu(null), process.env.VITE_DEV_SERVER_URL && n.webContents.openDevTools({ mode: "detach" });
}
n.whenReady().then(() => {
	s().catch((e) => {
		console.error("Failed to start Electron window:", e), n.quit();
	});
}), n.on("window-all-closed", () => {
	process.platform !== "darwin" && n.quit();
}), n.on("activate", () => {
	e.getAllWindows().length === 0 && s().catch((e) => {
		console.error("Failed to activate Electron window:", e), n.quit();
	});
}), r.on("window-control", (t, n) => {
	let r = e.getFocusedWindow();
	if (r) switch (n) {
		case "minimize":
			r.minimize();
			break;
		case "maximize":
			r.isMaximized() ? r.unmaximize() : r.maximize();
			break;
		case "close": r.close();
	}
}), r.on("plugin-data", (e, t) => {
	console.log("Received message from renderer:", t);
});
//#endregion
export {};

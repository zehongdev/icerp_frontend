import { BrowserWindow, Menu, app, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
async function createWindow() {
	const win = new BrowserWindow({
		width: 1680,
		height: 1080,
		minWidth: 960,
		minHeight: 640,
		backgroundColor: "#1f1d1f",
		frame: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.mjs")
		}
	});
	const url = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL;
	if (url) await win.loadURL(url);
	else await win.loadFile(path.join(__dirname, "../dist/index.html"));
	Menu.setApplicationMenu(null);
	if (process.env.VITE_DEV_SERVER_URL) win.webContents.openDevTools({ mode: "detach" });
}
app.whenReady().then(() => {
	createWindow().catch((error) => {
		console.error("Failed to start Electron window:", error);
		app.quit();
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow().catch((error) => {
		console.error("Failed to activate Electron window:", error);
		app.quit();
	});
});
ipcMain.on("window-control", (_event, action) => {
	const win = BrowserWindow.getFocusedWindow();
	if (!win) return;
	switch (action) {
		case "minimize":
			win.minimize();
			break;
		case "maximize":
			if (win.isMaximized()) win.unmaximize();
			else win.maximize();
			break;
		case "close": win.close();
	}
});
ipcMain.on("plugin-data", (_, data) => {
	console.log("Received message from renderer:", data);
});
//#endregion
export {};

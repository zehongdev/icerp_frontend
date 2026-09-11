let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", { onServerEvent(callback) {
	electron.ipcRenderer.on("server-event", (_, data) => {
		callback(data);
	});
} });
//#endregion

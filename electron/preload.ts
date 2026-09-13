// import { contextBridge, ipcRenderer } from 'electron'

// contextBridge.exposeInMainWorld('electron', {
//     onPluginMessage: (channel: string, callback: (event: unknown, ...args: unknown[]) => void) => {
//         ipcRenderer.on(channel, (_event, ...args) => callback(_event, ...args))
//     },
//     send: (channel: string, data?: unknown) => {
//         ipcRenderer.send(channel, data)
//     },
// })

import { contextBridge, ipcRenderer } from 'electron'

type UpdateStatus =
    | { type: 'available' | 'downloaded' | 'error' | 'not-available' }
    | { type: 'download-progress'; percent: number }

contextBridge.exposeInMainWorld('electronAPI', {
    windowControl: (action: 'minimize' | 'maximize' | 'close') => ipcRenderer.send('window-control', action),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
        const listener = (_event: Electron.IpcRendererEvent, status: UpdateStatus) => callback(status)
        ipcRenderer.on('update-status', listener)

        return () => ipcRenderer.removeListener('update-status', listener)
    },
    onServerEvent(callback: (data: unknown) => void) {
        ipcRenderer.on('server-event', (_event, data) => callback(data))
    },
})
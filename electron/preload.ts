// import { contextBridge, ipcRenderer } from 'electron'

// contextBridge.exposeInMainWorld('electron', {
//     onPluginMessage: (channel: string, callback: (event: unknown, ...args: unknown[]) => void) => {
//         ipcRenderer.on(channel, (_event, ...args) => callback(_event, ...args))
//     },
//     send: (channel: string, data?: unknown) => {
//         ipcRenderer.send(channel, data)
//     },
// })

import {
    contextBridge,
    ipcRenderer
} from "electron";


contextBridge.exposeInMainWorld(
    "electronAPI",
    {


        onServerEvent(
            callback: any
        ) {

            ipcRenderer.on(
                "server-event",
                (_, data) => {

                    callback(data);

                }
            );

        }


    });
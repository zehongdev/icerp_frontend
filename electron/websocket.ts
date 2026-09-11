// import { WebSocket, WebSocketServer } from 'ws';


// let mainWindow: Electron.BrowserWindow | null = null
// const clients: WebSocket[] = [];

// export function setMainWindow(win: Electron.BrowserWindow): void {
//     mainWindow = win;
// }
// export function startWebSocketServer(port: number): void {
//     const wss = new WebSocketServer({ port });
//     console.log(`WebSocket server started on ws://localhost:${port}`);

//     wss.on('connection', (ws: WebSocket) => {
//         console.log('WS Client connected');
//         clients.push(ws);

//         ws.on('message', (message: string) => {
//             console.log(`Received message: ${JSON.parse(message.toString())}`);
//             mainWindow?.webContents.send('ws-message', JSON.parse(message.toString()));
//         });
//     })
// }
// import WebSocket from 'ws';

import WebSocket from "ws";
import {
    BrowserWindow
} from "electron";


class SocketManager {


    private ws?: WebSocket;


    connect() {

        if (this.ws) {
            return;
        }


        this.ws = new WebSocket(
            "ws://localhost:9001/ws"
        );


        this.ws.on("open", () => {

            console.log(
                "server websocket connected"
            );

        });



        this.ws.on("message", (data) => {


            const message =
                JSON.parse(
                    data.toString()
                );


            this.handleMessage(message);


        });



        this.ws.on("close", () => {

            console.log(
                "socket closed"
            );


            this.ws = undefined;


            setTimeout(() => {

                this.connect();

            }, 3000);


        });


        this.ws.on("error", (err) => {

            console.log(
                err.message
            );

        });


    }



    handleMessage(message: any) {


        BrowserWindow
            .getAllWindows()
            .forEach(win => {


                win.webContents.send(
                    "server-event",
                    message
                );
            })


        // 后面发送给React

    }


}


export const socketManager =
    new SocketManager();
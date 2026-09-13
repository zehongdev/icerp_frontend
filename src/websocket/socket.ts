// import WebSocket from 'ws';

// const ws = new WebSocket('ws://localhost:9001/ws');
// ws.on('open', () => {
//     console.log('WebSocket connection opened');
// });
// ws.on('message', (data) => {
//     console.log('Received message:', data.toString());
// });
import { toast } from 'sonner';
import queryClient from '../lib/query/queryClient';

const webSocketUrl = import.meta.env.VITE_WS_URL;

if (!webSocketUrl) {
    throw new Error('VITE_WS_URL must be set.');
}

class SocketClient {
    private ws?: WebSocket;
    private retryCount: number;
    // private maxRetries: number;
    private retryDelay: number; // 3 seconds

    constructor() {
        this.retryCount = 0;
        // this.maxRetries = Infinity;
        this.retryDelay = 3000; // 3 seconds
    }

    private handleMessage(message: any) {
        switch (message.type) {
            case 'SCRAPE_ITEM_CREATED':
                queryClient.invalidateQueries({
                    queryKey: ['scrapeItems'],
                });
                toast.info('接收到来自服务器的 询价事件 ');
                break;
        }
    }
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        this.ws = new WebSocket(webSocketUrl);
        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
            this.retryCount = 0;
        };
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data.toString());
            this.handleMessage(message);
        };
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.ws = undefined;
            this.reconnect();
        };
        this.ws.onerror = (error) => {
            console.log('WebSocket error:', error);
            this.ws?.close();
        }
    }
    reconnect() {
        const delay = Math.min(this.retryDelay * (this.retryCount + 1), 60000);
        this.retryCount++;
        console.log(
            `${delay / 1000}秒后第${this.retryCount}次重连`
        );
        setTimeout(() => { this.connect(); }, delay);
    }
}

export const socketClient = new SocketClient();
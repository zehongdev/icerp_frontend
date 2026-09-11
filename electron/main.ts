import { app, BrowserWindow, Menu, ipcMain } from 'electron'
// import { socketManager } from './websocket.ts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createWindow() {
    const win = new BrowserWindow({
        width: 1680,
        height: 1080,
        minWidth: 960,
        minHeight: 640,
        backgroundColor: '#1f1d1f',
        // transparent: true,
        // titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //     color: '#1f1d1f',
        //     symbolColor: '#727072'
        // },
        frame: false,

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.mjs'),
        },
    })
    // win.loadFile('index.html')
    // 插件会在开发时注入 VITE_DEV_SERVER_URL，生产时注入 ELECTRON_RENDERER_URL（指向 dist/index.html）
    const url = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL
    if (url) {
        await win.loadURL(url)
    } else {
        // 兜底：直接加载打包后的文件
        await win.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    Menu.setApplicationMenu(null)

    // 开发模式自动打开 DevTools
    if (process.env.VITE_DEV_SERVER_URL) {
        win.webContents.openDevTools({ mode: 'detach' })
    }
}

app.whenReady().then(() => {
    // socketManager.connect()
    createWindow().catch((error) => {
        console.error('Failed to start Electron window:', error)
        app.quit()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow().catch((error) => {
            console.error('Failed to activate Electron window:', error)
            app.quit()
        })
    }
})

ipcMain.on('window-control', (_event, action: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) {
        return
    }

    switch (action) {
        case 'minimize':
            win.minimize()
            break
        case 'maximize':
            if (win.isMaximized()) {
                win.unmaximize()
            } else {
                win.maximize()
            }
            break
        case 'close':
            win.close()
            break
        default:
            break
    }
})

ipcMain.on('plugin-data', (_, data) => {
    console.log('Received message from renderer:', data)
}) 
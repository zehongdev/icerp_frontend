import { app, BrowserWindow, dialog, Menu, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
// import { socketManager } from './websocket.ts'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
type UpdateStatus =
    | { type: 'available' | 'downloaded' | 'error' | 'not-available' }
    | { type: 'download-progress'; percent: number }

let isUpdateCheckInProgress = false
let isManualUpdateCheck = false

type PendingUpdateReleaseNotes = {
    version: string
    releaseNotes: string
}

const pendingUpdateReleaseNotesPath = () => path.join(app.getPath('userData'), 'pending-update-release-notes.json')

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
    configureAutoUpdater()
    createWindow()
        .then(async () => {
            await showInstalledUpdateReleaseNotes()
            await checkForUpdates()
        })
        .catch((error) => {
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

ipcMain.handle('get-app-version', () => app.getVersion())

ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
        return { started: false, reason: 'development' }
    }

    if (isUpdateCheckInProgress) {
        return { started: false, reason: 'in-progress' }
    }

    const latestVersion = await checkForUpdates(true)
    if (!latestVersion) {
        return { started: false, reason: 'failed' }
    }

    return {
        started: true,
        currentVersion: app.getVersion(),
        latestVersion,
    }
})

function sendUpdateStatus(status: UpdateStatus) {
    for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('update-status', status)
    }
}

function configureAutoUpdater() {
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', (info) => {
        console.info(`Downloading update ${info.version}.`)
        if (isManualUpdateCheck) {
            sendUpdateStatus({ type: 'available' })
        }
    })

    autoUpdater.on('update-not-available', () => {
        if (isManualUpdateCheck) {
            sendUpdateStatus({ type: 'not-available' })
        }
    })

    autoUpdater.on('update-downloaded', async (info) => {
        await savePendingUpdateReleaseNotes({
            version: info.version,
            releaseNotes: formatReleaseNotes(info.releaseNotes),
        })
        sendUpdateStatus({ type: 'downloaded' })
        const result = await dialog.showMessageBox({
            type: 'info',
            buttons: ['立即重启', '稍后'],
            defaultId: 0,
            cancelId: 1,
            title: '发现新版本',
            message: `版本 ${info.version} 已下载完成。`,
            detail: '重启应用后将自动完成更新。',
        })

        if (result.response === 0) {
            autoUpdater.quitAndInstall()
        }
    })

    autoUpdater.on('error', (error) => {
        console.error('Failed to update application:', error)
        if (isManualUpdateCheck) {
            sendUpdateStatus({ type: 'error' })
        }
    })

    autoUpdater.on('download-progress', (progress) => {
        sendUpdateStatus({
            type: 'download-progress',
            percent: Math.min(100, Math.max(0, Math.round(progress.percent))),
        })
    })
}

function formatReleaseNotes(
    releaseNotes: string | Array<{ version: string; note?: string | null }> | null | undefined,
) {
    if (typeof releaseNotes === 'string') {
        return releaseNotes.trim()
    }

    if (!releaseNotes?.length) {
        return '本次更新包含功能优化与问题修复。'
    }

    return releaseNotes
        .map(({ version, note }) => `v${version}\n${note ?? ''}`)
        .join('\n\n')
        .trim()
}

async function savePendingUpdateReleaseNotes(releaseNotes: PendingUpdateReleaseNotes) {
    try {
        await writeFile(pendingUpdateReleaseNotesPath(), JSON.stringify(releaseNotes), 'utf8')
    } catch (error) {
        console.error('Failed to save update release notes:', error)
    }
}

async function showInstalledUpdateReleaseNotes() {
    let pendingReleaseNotes: PendingUpdateReleaseNotes

    try {
        const content = await readFile(pendingUpdateReleaseNotesPath(), 'utf8')
        pendingReleaseNotes = JSON.parse(content) as PendingUpdateReleaseNotes
    } catch (error) {
        const code = error instanceof Error && 'code' in error ? error.code : undefined
        if (code !== 'ENOENT') {
            console.error('Failed to read update release notes:', error)
        }
        return
    }

    if (pendingReleaseNotes.version !== app.getVersion()) {
        return
    }

    const result = await dialog.showMessageBox({
        type: 'info',
        title: 'ICERP 已更新',
        message: `已成功更新至版本 ${pendingReleaseNotes.version}`,
        detail: pendingReleaseNotes.releaseNotes,
        buttons: ['知道了'],
        defaultId: 0,
    })

    if (result.response === 0) {
        try {
            await unlink(pendingUpdateReleaseNotesPath())
        } catch (error) {
            console.error('Failed to clear displayed update release notes:', error)
        }
    }
}

async function checkForUpdates(isManual = false): Promise<string | null> {
    if (!app.isPackaged) {
        return null
    }

    isUpdateCheckInProgress = true
    isManualUpdateCheck = isManual

    try {
        const result = await autoUpdater.checkForUpdates()
        return result?.updateInfo.version ?? null
    } catch (error) {
        console.error('Failed to check for updates:', error)
        if (isManual) {
            sendUpdateStatus({ type: 'error' })
        }
        return null
    } finally {
        isUpdateCheckInProgress = false
        isManualUpdateCheck = false
    }
}
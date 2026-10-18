import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import { closeDb, createDb, setDb } from './db/connection';
import { createHandlers, registerIpc } from './ipc';

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'ToKnow',
    backgroundColor: '#F7F3EA',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    try {
      const userData = app.getPath('userData');
      const dbPath = path.join(userData, 'toknow.db');
      const backupDir = path.join(userData, 'backups');
      const db = createDb(dbPath);
      setDb(db);

      registerIpc(
        ipcMain,
        createHandlers({ db, dbPath, backupDir, version: app.getVersion() })
      );

      createWindow();
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    } catch (error) {
      dialog.showErrorBox('ToKnow 启动失败', String(error));
      app.quit();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => {
    closeDb();
  });
}

import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type AppApi } from '../shared/ipc';

const api: AppApi = {
  bootstrap: () => ipcRenderer.invoke(IPC.bootstrap),
  submitOnboarding: (input) => ipcRenderer.invoke(IPC.onboarding, input),
  getToday: () => ipcRenderer.invoke(IPC.today),
  completeTask: (input) => ipcRenderer.invoke(IPC.completeTask, input),
  checkIn: (input) => ipcRenderer.invoke(IPC.checkIn, input),
  getTree: () => ipcRenderer.invoke(IPC.tree),
  exportBackup: () => ipcRenderer.invoke(IPC.exportBackup),
  getSettings: () => ipcRenderer.invoke(IPC.settings),
  getCalendarMonth: (year, month) =>
    ipcRenderer.invoke(IPC.calendarMonth, year, month),
  getCalendarDay: (date) => ipcRenderer.invoke(IPC.calendarDay, date),
  createTask: (input) => ipcRenderer.invoke(IPC.createTask, input),
  moveTask: (input) => ipcRenderer.invoke(IPC.moveTask, input)
};

contextBridge.exposeInMainWorld('api', api);

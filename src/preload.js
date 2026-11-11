const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('slidepar', {
  saveProject: (payload) => ipcRenderer.invoke('project:save', payload),
  openProject: () => ipcRenderer.invoke('project:open'),
  pickImage: () => ipcRenderer.invoke('image:pick'),
  exportPdf: (payload) => ipcRenderer.invoke('export:pdf', payload),
  onMenu: (channel, handler) => {
    const allowed = [
      'menu:new', 'menu:open', 'menu:save', 'menu:export-pdf',
      'menu:present', 'menu:delete-slide'
    ];
    if (allowed.includes(channel)) ipcRenderer.on(channel, handler);
  }
});

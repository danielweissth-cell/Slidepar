const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 640,
    backgroundColor: '#201712',
    title: 'Slidepar',
    icon: path.join(__dirname, '..', 'assets', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });

  // Проброс ошибок рендерера в stdout (для отладки)
  mainWindow.webContents.on('console-message', (e, level, message, line, src) => {
    console.log(`[renderer:${level}] ${message} (${src}:${line})`);
  });
  mainWindow.webContents.on('render-process-gone', (e, d) => {
    console.log('[render-process-gone]', JSON.stringify(d));
  });

  if (process.env.SLIDEPAR_CAPTURE) {
    mainWindow.webContents.on('did-finish-load', () => {
      setTimeout(async () => {
        try {
          if (process.env.SLIDEPAR_EVAL) {
            await mainWindow.webContents.executeJavaScript(process.env.SLIDEPAR_EVAL);
            await new Promise(r => setTimeout(r, 300));
          }
          const img = await mainWindow.webContents.capturePage();
          fs.writeFileSync(process.env.SLIDEPAR_CAPTURE, img.toPNG());
          console.log('[capture] saved', process.env.SLIDEPAR_CAPTURE);
          if (process.env.SLIDEPAR_CAPTURE2) {
            await mainWindow.webContents.executeJavaScript('startPresent()');
            await new Promise(r => setTimeout(r, 1200));
            const img2 = await mainWindow.webContents.capturePage();
            fs.writeFileSync(process.env.SLIDEPAR_CAPTURE2, img2.toPNG());
            console.log('[capture] saved', process.env.SLIDEPAR_CAPTURE2);
          }
        } catch (err) { console.log('[capture] error', String(err)); }
      }, 1500);
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  buildMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const send = (channel) => () => mainWindow && mainWindow.webContents.send(channel);
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'Файл',
      submenu: [
        { label: 'Новая презентация', accelerator: 'CmdOrCtrl+N', click: send('menu:new') },
        { label: 'Открыть…', accelerator: 'CmdOrCtrl+O', click: send('menu:open') },
        { label: 'Сохранить', accelerator: 'CmdOrCtrl+S', click: send('menu:save') },
        { type: 'separator' },
        { label: 'Экспорт в PDF…', accelerator: 'CmdOrCtrl+E', click: send('menu:export-pdf') },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'Закрыть' } : { role: 'quit', label: 'Выход' }
      ]
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { label: 'Удалить слайд', accelerator: 'CmdOrCtrl+Backspace', click: send('menu:delete-slide') }
      ]
    },
    {
      label: 'Показ',
      submenu: [
        { label: 'Начать показ', accelerator: 'F5', click: send('menu:present') },
        { role: 'togglefullscreen', label: 'Полный экран' }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'reload', label: 'Обновить' },
        { role: 'toggledevtools', label: 'Инструменты разработчика' },
        { type: 'separator' },
        { role: 'resetzoom', label: 'Масштаб 100%' },
        { role: 'zoomin', label: 'Увеличить' },
        { role: 'zoomout', label: 'Уменьшить' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---- Save project (JSON) ----
ipcMain.handle('project:save', async (event, { data, currentPath }) => {
  let filePath = currentPath;
  if (!filePath) {
    const res = await dialog.showSaveDialog(mainWindow, {
      title: 'Сохранить презентацию',
      defaultPath: 'Без названия.slidepar',
      filters: [{ name: 'Slidepar', extensions: ['slidepar'] }]
    });
    if (res.canceled) return { canceled: true };
    filePath = res.filePath;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return { canceled: false, filePath };
});

// ---- Open project (JSON) ----
ipcMain.handle('project:open', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Открыть презентацию',
    properties: ['openFile'],
    filters: [{ name: 'Slidepar', extensions: ['slidepar'] }, { name: 'Все файлы', extensions: ['*'] }]
  });
  if (res.canceled || !res.filePaths.length) return { canceled: true };
  const filePath = res.filePaths[0];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return { canceled: false, filePath, data: JSON.parse(raw) };
});

// ---- Import image as data URL ----
ipcMain.handle('image:pick', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Выбрать изображение',
    properties: ['openFile'],
    filters: [{ name: 'Изображения', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
  });
  if (res.canceled || !res.filePaths.length) return { canceled: true };
  const filePath = res.filePaths[0];
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'svg' ? 'image/svg+xml' : (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`);
  return { canceled: false, dataUrl: `data:${mime};base64,${buf.toString('base64')}` };
});

// ---- Export to PDF ----
ipcMain.handle('export:pdf', async (event, { html, defaultName }) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Экспорт в PDF',
    defaultPath: (defaultName || 'Презентация') + '.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (res.canceled) return { canceled: true };

  const tmpHtml = path.join(os.tmpdir(), `slidepar-export-${Date.now()}.html`);
  fs.writeFileSync(tmpHtml, html, 'utf-8');

  const pdfWin = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: false }
  });
  try {
    await pdfWin.loadFile(tmpHtml);
    // give web fonts/images a moment to settle
    await new Promise(r => setTimeout(r, 350));
    const pdfData = await pdfWin.webContents.printToPDF({
      landscape: true,
      printBackground: true,
      pageSize: { width: 13.333, height: 7.5 }, // inches, 16:9
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    fs.writeFileSync(res.filePath, pdfData);
    return { canceled: false, filePath: res.filePath };
  } catch (err) {
    return { canceled: false, error: String(err) };
  } finally {
    pdfWin.destroy();
    try { fs.unlinkSync(tmpHtml); } catch (_) {}
  }
});

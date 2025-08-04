import { BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

export function update(win: BrowserWindow) {
  // The Squirrel application will start the app right away, so we need to
  // prevent that and let our app handle the desktop icon creation.
  if (require('electron').app.isPackaged) {
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus

        // Install desktop and start menu shortcuts
        require('electron').app.setLoginItemSettings({
          openAtLogin: true,
          path: require('electron').app.getPath('exe'),
        });

        // Quit and install
        require('electron').app.quit();
        break;
      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated case

        // Remove desktop and start menu shortcuts
        require('electron').app.setLoginItemSettings({
          openAtLogin: false,
        });

        // Quit and uninstall
        require('electron').app.quit();
        break;
      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        require('electron').app.quit();
        break;
    }
  }

  // Configure auto updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates
  autoUpdater.checkForUpdates();

  // Update events
  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update-status', 'Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update-status', 'Update available');
    win.webContents.send('update-info', info);
    
    // Ask user if they want to download the update
    win.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  });

  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-status', 'No updates available');
  });

  autoUpdater.on('error', (err) => {
    win.webContents.send('update-error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('update-progress', {
      speed: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
  });

  // IPC handlers for update control
  require('electron').ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate();
  });

  require('electron').ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  require('electron').ipcMain.handle('check-for-updates', () => {
    autoUpdater.checkForUpdates();
  });
} 
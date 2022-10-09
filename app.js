const Electron = require('electron');
const { autoUpdater } = require('electron-updater');
const { app } = Electron;
let mainWindow, contents;
const menuItems = [
	{
		label: 'Edit',
		submenu: [
			{
				label: 'Undo',
				accelerator: 'CmdOrCtrl+Z',
				role: 'undo'
			},
			{
				label: 'Redo',
				accelerator: 'Shift+CmdOrCtrl+Z',
				role: 'redo'
			},
			{
				type: 'separator'
			},
			{
				label: 'Cut',
				accelerator: 'CmdOrCtrl+X',
				role: 'cut'
			},
			{
				label: 'Copy',
				accelerator: 'CmdOrCtrl+C',
				role: 'copy'
			},
			{
				label: 'Paste',
				accelerator: 'CmdOrCtrl+V',
				role: 'paste'
			},
			{
				label: 'Select All',
				accelerator: 'CmdOrCtrl+A',
				role: 'selectall'
			},
		]
	},
	{
		label: 'Tools',
		submenu: [{
			label: 'Go back to previous web page',
			click: async () => {
				if (contents.canGoBack()) {
					contents.goBack();
				} else {
					new Electron.Notification({ title: 'No previous page', body: 'Could not find last page to go back to' }).show()
				}
			}
		},
			{
				label: 'Go ahead to previous web page',
				click: async () => {
					if (contents.canGoForward()) {
						contents.goForward();
					} else {
						new Electron.Notification({ title: 'No previous page', body: 'Could not find last page to go backnpm to' }).show()
					}
				}
			},
			{
				label: 'Clear history',
				click: async () => {
					await contents.clearHistory();
					new Electron.Notification({ title: 'Process done', body: 'Cleared search history' }).show()
				}
			},
			{
				label: 'Reload page',
				click: async () => { contents.reload() }
			}]
	},
	{
		label: 'Edit',
		submenu: [{
			label: 'Undo',
			click: async () => { contents.undo() }
		}]
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: function (item, content) {
					if (content)
						content.reload();
				}
			},
			{
				label: 'Toggle Full Screen',
				accelerator: (function () {
					if (process.platform === 'darwin')
						return 'Ctrl+Command+F';
					else
						return 'F11';
				})(),
				click: function (item, content) {
					if (content)
						content.setFullScreen(!content.isFullScreen());
				}
			},
			{
				label: 'Toggle Developer Tools',
				accelerator: (function () {
					if (process.platform === 'darwin')
						return 'Alt+Command+I';
					else
						return 'Ctrl+Shift+I';
				})(),
				click: function (item, content) {
					if (content)
						content.toggleDevTools();
				}
			},
		]
	},
	{
		label: 'Window',
		role: 'window',
		submenu: [
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
		]
	}
];

if (process.platform === 'darwin') {
	const { name } = app;
	menuItems.unshift({
		label: name,
		submenu: [
			{
				label: 'About ' + name,
				role: 'about'
			},
			{
				type: 'separator'
			},
			{
				label: 'Services',
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				label: 'Hide ' + name,
				accelerator: 'Command+H',
				role: 'hide'
			},
			{
				label: 'Hide Others',
				accelerator: 'Command+Shift+H',
				role: 'hideothers'
			},
			{
				label: 'Show All',
				role: 'unhide'
			},
			{
				type: 'separator'
			},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				click: function () { app.quit(); }
			},
		]
	});
}

async function createWindow() {
	mainWindow = new Electron.BrowserWindow({ autoHideMenuBar: true, show: false });
	if (mainWindow.maximizable) mainWindow.maximize();
	mainWindow.setResizable(false);
	mainWindow.setTitle('AniTron');
	await mainWindow.loadURL('https://anitron.vercel.app');
	mainWindow.show();
	contents = mainWindow.webContents;
	const windowMenu = menuItems.find(function (m) { return m.role === 'window' })
	if (windowMenu) {
		windowMenu.submenu.push(
			{
				type: 'separator'
			},
			{
				label: 'Bring All to Front',
				role: 'front'
			}
		);
	}
	mainWindow.on('closed', async() => {
		mainWindow = null;
		contents = null;
	});

	return mainWindow;
}

app.on('ready', async () => {
	const menu = Electron.Menu.buildFromTemplate(menuItems);
	Electron.Menu.setApplicationMenu(menu);
	await createWindow();
	await autoUpdater.checkForUpdatesAndNotify();
});

Electron.app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
		mainWindow = null;
		contents = null;
	}
});

Electron.app.on('activate', async () => {
	if (mainWindow === null) {
		await createWindow();
	}
})

Electron.app.on('web-contents-created', (event, contents) => {
	contents.on('will-navigate', (event, navigationUrl) => {
		const parsedUrl = new URL(navigationUrl);
		if (parsedUrl.origin !== 'https://anitron.vercel.app') {
			event.preventDefault();
		}
	});
});

autoUpdater.on('update-available', () => {
	const dialogOpts = {
		type: 'info',
		buttons: ['Update', 'Later'],
		title: 'Application Update',
		message: 'A new version of AniTron is available. Download now?',
		detail: 'A new version of AniTron is available. Download now?'
	}
	Electron.dialog.showMessageBox(dialogOpts).then((returnValue) => {
		if (returnValue.response === 0) autoUpdater.downloadUpdate();
	});
});

autoUpdater.on('update-downloaded', () => {
	const dialogOpts = {
		type: 'info',
		buttons: ['Restart', 'Later'],
		title: 'Application Update',
		message: 'A new version of AniTron has been downloaded. Restart the application to apply the updates.',
		detail:
			'A new version has been downloaded. Restart the application to apply the updates.',
	}
	
	Electron.dialog.showMessageBox(dialogOpts).then((returnValue) => {
		if (returnValue.response === 0) autoUpdater.quitAndInstall()
	});
});
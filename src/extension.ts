import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const got = require('got');
const api = require('@gateway.architects/meister.usermanagement.authentication');
const jsonfile = require('jsonfile');
import { TreeDataProvider } from './treeview';

function editWebview(name:any, panel:any) {
  const filePath = path.join(__dirname, './connections.json');
  let connection;
  let connections;
  let arr: any[];
  if (fs.existsSync(filePath)) {
    connections = jsonfile.readFileSync(filePath);
    arr = [...connections];
    connection = arr.find(connection =>
      connection.connectionName === name.label || connection.connectionName === name
    )
    console.log(connection);

  }
  panel.webview.postMessage({ command: 'open webview', details: connection })
}

async function connect(url: string, authorization: string, context: vscode.ExtensionContext, panel: any, body: any, again:boolean) {
  try {
    const response = await got(url, {
      method: 'post',
      headers: {
        'Authorization': authorization,
        "Content-Type": "application/json",
      },
      body: body
    });
    console.log(response.body);
    if (response.statusCode == 200) {
      vscode.commands.executeCommand('connections.success');
      if (again) {
        panel.webview.postMessage({ command: 'connectedAgain' });
      }
      else {
        panel.webview.postMessage({ command: 'connected' });
      }
      
    }
    else {
      panel.webview.postMessage({ command: 'fail' });
      vscode.commands.executeCommand('connections.fail');
    }
  } catch (error) {
    console.log(error);
    vscode.commands.executeCommand('connections.fail');
  }
}

function save(data: any, panel:any) {
  const filePath = path.join(__dirname, './connections.json');
  let connections;
  let arr: any[];
  if (fs.existsSync(filePath)) {
    connections = jsonfile.readFileSync(filePath);
    arr = [...connections];
    let found = arr.find(connection => {
      return connection.connectionName === data.connectionName;
    });
    if (found) {
     panel.webview.postMessage({ command: 'exists' });
      vscode.commands.executeCommand('connections.exists');
      return;
    }
  }
  else {
    arr = [];
  }
  arr.push(data);
  jsonfile.writeFileSync(filePath, arr, function (err: any) {
    if (err) console.error(err)
  });
  vscode.window.registerTreeDataProvider('connections', new TreeDataProvider());
  panel.webview.postMessage({ command: 'saved' });
  vscode.window.showInformationMessage('connection saved!');
}

function edit(data: any, panel: any) {
  const filePath = path.join(__dirname, './connections.json');
  let connections;
  let arr: any[];
    connections = jsonfile.readFileSync(filePath);
    arr = [...connections];
    let filtered = arr.filter(connection => connection.connectionId !== data.connectionId);
        filtered.push(data);
        jsonfile.writeFileSync(filePath, filtered, function (err: any) {
          if (err) console.error(err)
        });
  panel.webview.postMessage({ command: 'edited' });
  vscode.window.showInformationMessage(`The changes have been saved successfully`);
      }


function openPanel(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'connection',
    'New Meister Connection',
    vscode.ViewColumn.One,
    {
      enableScripts: true
    }
  );
  panel.webview.html = getWebviewContent(panel.webview, context);
  panel.webview.onDidReceiveMessage(
    async (message: any) => {
      switch (message.command) {
        case 'connect':
          connect(message.url, message.authorization, context, panel, message.body, message.again);
          return;
        case 'emptyFields':
          vscode.commands.executeCommand('connections.fillData');
          return;
        case 'save':
          vscode.commands.executeCommand('connections.save', message.data, panel);
          return;
        case 'edit':
          vscode.commands.executeCommand('connections.edit', panel, message.data);
          return;
      }
    },
    undefined,
    context.subscriptions
  );
  return panel;
}

function deleteConnection(id:any) {
  const filePath = path.join(__dirname, './connections.json');
  let connections;
  let arr: any[];
  connections = jsonfile.readFileSync(filePath);
  arr = [...connections];
  let filtered = arr.filter(connection => connection.connectionId !== id);
  jsonfile.writeFileSync(filePath, filtered, function (err: any) {
    if (err) console.error(err)
  });
  vscode.window.registerTreeDataProvider('connections', new TreeDataProvider());
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
  try {
    const reactApplicationHtmlFilename = 'index.html';
    const htmlPath = path.join(__dirname, reactApplicationHtmlFilename);
    const html = fs.readFileSync(htmlPath).toString();

    return html;
  }
  catch (e) {
    return `Error getting HTML for web view: ${e}`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  api.startApi();
  vscode.window.registerTreeDataProvider('connections', new TreeDataProvider());
  vscode.commands.registerCommand('connections.exists', () => {
    vscode.window.showErrorMessage('connection already exists');
  })
  vscode.commands.registerCommand('connections.edit', (panel: any, data: any) => {
    edit(data, panel);
  });
  vscode.commands.registerCommand('connections.save', (data: any, panel: any) => {
    save(data, panel);
    
  })
  vscode.commands.registerCommand('connections.success', () => {
    vscode.window.showInformationMessage('connected successfully!');
  });

  
  vscode.commands.registerCommand('connections.fail', () =>
    vscode.window.showInformationMessage('Failed to connect'));
  vscode.commands.registerCommand('connections.fillData', () => {
    vscode.window.showInformationMessage(`Please fill all fields`);
  });
  vscode.commands.registerCommand('connections.addEntry', () => {
    openPanel(context);
  });

  vscode.commands.registerCommand('connections.editEntry', (name: any) => {
    const panel = openPanel(context);
    editWebview(name,panel)
  });
  vscode.commands.registerCommand('connections.deleteEntry', (connection: any) => {
    deleteConnection(connection.id);
  })
  
  
  }



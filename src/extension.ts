import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const got = require('got');
const api = require('@nechamaa/meister.usermanagement.autnentication');
const jsonfile = require('jsonfile');

async function connect(url: string, authorization: string, context: vscode.ExtensionContext, panel: any, data: any) {
  try {
    const response = await got(url, {
      https: {
        rejectUnauthorized: false
      },
      method: 'post',
      headers: {
        'Authorization': authorization,
        "Content-Type": "application/json",
      },
    });
    console.log(response.body);
    if (response.statusCode == 200) {
      vscode.commands.executeCommand('connections.success');
      panel.webview.postMessage({ command: 'connected' });
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
    if (arr.find(connection => {
      connection.connectionName === data.connectionName
    })) {
      panel.webview.postMessage({ command: 'exists' });
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
  panel.webview.postMessage({command: 'saved'})
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
  vscode.commands.registerCommand('connections.edit',panel=> {
    panel.webview.postMessage({ command: 'edit' });
  });
  vscode.commands.registerCommand('connections.save', (data: any, panel:any) => {
    save(data, panel);
    vscode.window.showInformationMessage('connection saved!');
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
    vscode.window.showInformationMessage(`Successfully called add entry.`);

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
            connect(message.url, message.authorization, context, panel, message.connection);
            return;
          case 'emptyFields':
            vscode.commands.executeCommand('connections.fillData');
            return;
          case 'save':
            vscode.commands.executeCommand('connections.save', message.data, panel);
            return;
          case 'edit':
            vscode.commands.executeCommand('connections.edit', panel);
            return;
        }
      },
      undefined,
      context.subscriptions
    );

  });
  
}



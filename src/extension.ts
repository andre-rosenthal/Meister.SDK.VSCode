import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const got = require('got');
const api = require('@nechamaa/meister.usermanagement.autnentication');


async function connect(url: string, authorization: string, context: vscode.ExtensionContext) {
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
    }
    else {
      vscode.commands.executeCommand('connections.fail');
    }
  } catch (error) {
    console.log(error);
    vscode.commands.executeCommand('connections.fail');
  }
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
  vscode.commands.registerCommand('connections.success', () =>
    vscode.window.showInformationMessage('connected successfully!'));
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
            connect(message.url, message.authorization, context);
            return;
          case 'emptyFields':
            vscode.commands.executeCommand('connections.fillData');
            return;
          case 'hello':
            vscode.commands.executeCommand('connections.success');
            return;
        }
      },
      undefined,
      context.subscriptions
    );

  });
  
}
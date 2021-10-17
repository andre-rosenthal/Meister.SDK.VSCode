import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const got = require('got');
// const api = require('@gateway.architects/meister.usermanagement.authentication');
const api = require('@gateway.architects/api.sdk.meister');
const jsonfile = require('jsonfile');
import { TreeDataProvider } from './treeview';

const filePath = path.join(__dirname, './connections.json');

function editWebview(name: any, panel: any) {
  let connection;
  let connections;
  let arr: any[];
  if (fs.existsSync(filePath)) {
    connections = jsonfile.readFileSync(filePath);
    arr = [...connections];
    connection = arr.find(connection =>
      connection.connectionId === name.id || connection.connectionName === name
    )
    console.log(connection);

  }
  panel.webview.postMessage({ command: 'open webview', details: connection })
}

async function connect(url: string, authorization: string, context: vscode.ExtensionContext, panel: any, body: any, again: boolean) {
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
      console.log(response.body);

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
    panel.webview.postMessage({ command: 'fail' });

  }
}

function save(data: any, panel: any) {
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
  vscode.window.registerTreeDataProvider('connections', new TreeDataProvider('connections', null));
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

function deleteConnection(id: any) {
  vscode.window
    .showInformationMessage(
      "Are you sure you want to delete the connection?",
      ...["Yes", "No"]
    )
    .then((answer) => {
      if (answer === "Yes") {
        const filePath = path.join(__dirname, './connections.json');
        let connections;
        let arr: any[];
        connections = jsonfile.readFileSync(filePath);
        arr = [...connections];
        let filtered = arr.filter(connection => connection.connectionId !== id);
        jsonfile.writeFileSync(filePath, filtered, function (err: any) {
          if (err) console.error(err)
        });
        vscode.window.registerTreeDataProvider('connections', new TreeDataProvider('connections', null));
      }
    });

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

async function getSDK() {
  let vscodeUrl = 'https://api.media.atlassian.com/file/dea2fe0e-ff9c-4608-95b8-1f65b4ae00cf/binary?token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkNjZmODU4MC05ZDY4LTRiNjctYTI0NC1jMDAxOTE0NzY4ZGEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOmRlYTJmZTBlLWZmOWMtNDYwOC05NWI4LTFmNjViNGFlMDBjZiI6WyJyZWFkIl19LCJleHAiOjE2MzQyNzYwMjUsIm5iZiI6MTYzNDE5MzA0NX0.JxAfSzJuX9AUPjgEMhkpT-206kPRC1Iq_TyDl9ikBFE&client=d66f8580-9d68-4b67-a244-c001914768da&name=New%20sdk%20response%20from%20lookup.json'
  let url = 'https://api.media.atlassian.com/file/5d05b1c9-4d0b-44d8-a125-4affdb00a492/binary?token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkNjZmODU4MC05ZDY4LTRiNjctYTI0NC1jMDAxOTE0NzY4ZGEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjVkMDViMWM5LTRkMGItNDRkOC1hMTI1LTRhZmZkYjAwYTQ5MiI6WyJyZWFkIl19LCJleHAiOjE2MzQ1MzE2NDMsIm5iZiI6MTYzNDQ0ODY2M30.0yakHaeyQcfo7krSDpjmzX5W5LQoNbIopKuWaAlMhTY&client=d66f8580-9d68-4b67-a244-c001914768da&name=Legacy%20sdk%20response%20from%20lookup.json'
  try {

    const response = await got(url);
    if (response.statusCode == 200) {
      let jsonRespons = JSON.parse(response.body);
      var result: any[] = [];
      jsonRespons[0].details.forEach((element: any) => {
        // let modules:any[]=[];
        // let endPoints: any[] = [];
        let modules = element.modules.map((element: any) => {
          let endPoints = element.endpoints.map((endPoints: any) => {
            let styles = endPoints.styles.map((style: any) =>
              style.name
            )
            return {namespace:endPoints.namespace ,styles}
          })
          return { name: element.name, endPoints }
        });
        // let endPoints = element.modules.map((element: any) => element.name);

        result.push({ project: element.project, modules: modules })
      });
      return result;

    }
    else {
      console.log("eror");

    }

  } catch (err) {
    const ex: any = err;
    console.log(ex);
  }

}

export function activate(context: vscode.ExtensionContext) {
  api.startApi();
  vscode.window.registerTreeDataProvider('connections', new TreeDataProvider('connections', null));
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
  vscode.commands.registerCommand('connections.refreshEntry', () => {
    vscode.window.registerTreeDataProvider('connections', new TreeDataProvider('connections'));

  });

  vscode.commands.registerCommand('connections.editEntry', (name: any) => {
    const panel = openPanel(context);
    editWebview(name, panel)
  });

  vscode.commands.registerCommand('connections.connect', async (connection: any) => {
    const panel = openPanel(context);
    let connectionDtails;
    let connections;
    let arr: any[];
    if (fs.existsSync(filePath)) {
      connections = jsonfile.readFileSync(filePath);
      arr = [...connections];
      connectionDtails = arr.find(item =>
        item.connectionId === connection.id
      )
      let projects = await getSDK();
      connectionDtails.projects = projects;
      console.log(connectionDtails);


    }
    panel.webview.postMessage({ command: 'mode', mode: 'header', connection: connectionDtails });
    vscode.window.registerTreeDataProvider('endPoints', new TreeDataProvider('endPoints', connectionDtails));

  });
  vscode.commands.registerCommand('connections.deleteEntry', (connection: any) => {
    deleteConnection(connection.id);
  })


}



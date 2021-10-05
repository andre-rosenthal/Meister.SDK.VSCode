'use strict';

import * as vscode from 'vscode';
// import  "form.html";
import { DepNodeProvider, Dependency } from './nodeDependencies';
import { JsonOutlineProvider } from './jsonOutline';
import { FtpExplorer } from './ftpExplorer';
import { FileExplorer } from './fileExplorer';
import { TestViewDragAndDrop } from './testViewDragAndDrop';
import { TestView } from './testView';
import { workspace } from 'vscode';
import { TreeDataProvider } from './treeDataProvider';
function testConnection() {
	// e.preventDefault();
	console.log("test");
	// console.log(document);

	// const element = document.getElementById("test");
	// const inputValue = (<HTMLInputElement>document.getElementById("getway")).value;
	// console.log(inputValue);

	return true;
}
// await webView.CoreWebView2.ExecuteScriptAsync("window.addEventListener('contextmenu', window => {window.preventDefault();});");
function connect(gateway, clientNumber, sapUserId, password) {
	console.log(clientNumber);
	console.log("kkk");


}

function getWebviewContent() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
  </head>
  <body>
    <form >
    <label for="fname"><b> enter the Protocol (as Http or Https)</b></label><br>
    <input type="text" id="protocol" style="margin-top:1%; margin-bottom: 1%; width: 50%;"  name="fname" ><br>
	<label for="fname"><b> enter the URL for the SAP Gateway System (as server.com:port or server.com:port )</b></label><br>
    <input type="text" id="gateway" style="margin-top:1%; margin-bottom: 1%; width: 50%;"  name="fname" ><br>
    <label for="lname" ><b>Please enter the client number</b></label><br>
    <input type="text" id="clientNumber" name="clientNumber"  style="margin-top:1%; margin-bottom: 1%; width:20%;"><br>
    <label for="lname" ><b>Please enter the SAP UserId </b></label><br>
    <input type="text" id="sapUserId" name="sapUserId"  style="margin-top:1%; margin-bottom: 1%; width: 20%;"><br>
    <label for="lname" ><b>Lastly Please enter the SAP  UserId Password</b></label><br>
    <input type="password" id="password" name="password"  style="margin-top:1%; margin-bottom: 1%; width: 20%;"><br>
    <input type="button" id="test" value="Test connection" onclick="testConnection();" style="margin-top: 2%;">
  </form> 
  	  <h1 id="lines-of-code-counter"></h1>
  
	  <script>
	  function testConnection() {
		const gateway = document.getElementById("gateway").value;
	    const protocol = document.getElementById("protocol").value;
		const clientNumber = document.getElementById("clientNumber").value;
		const sapUserId = document.getElementById("sapUserId").value;
		const password = document.getElementById("password").value;
		const value = document.getElementById('lines-of-code-counter');
		value.textContent = btoa(sapUserId+':'+password);
		const url="https://localhost:3005/api/Meister/Login/"+protocol+"/"+gateway+"/"+clientNumber;
		value.textContent=url;
		fetch(url, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': Basic+' '+btoa(sapUserId+':'+password)
			}
		  }).then(res => {
			console.log('xcstr');
		  });
	  }
		
	  </script>
  </body>
  </html>`;
}
// function getWebviewContent() {
// 	return `<!DOCTYPE html>
//   <html lang="en">
//   <head>
// 	  <meta charset="UTF-8">
// 	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
// 	  <title>Cat Coding</title>
//   </head>
//   <body>
//   <form action="/action_page.php">
//   <label for="fname"><b> enter the URL for the SAP Gateway System (as Http://server.com:port or Https://server.com:port )</b></label><br>
//   <input type="text" id="getway" style="margin-top:1%; margin-bottom: 1%; width: 50%;"  name="fname" ><br>
//   <label for="lname" ><b>Please enter the client number</b></label><br>
//   <input type="text" id="lname" name="lname"  style="margin-top:1%; margin-bottom: 1%; width:20%;"><br>
//   <label for="lname" ><b>Please enter the SAP UserId </b></label><br>
//   <input type="text" id="lname" name="lname"  style="margin-top:1%; margin-bottom: 1%; width: 20%;"><br>
//   <label for="lname" ><b>Lastly Please enter the SAP  UserId Password</b></label><br>
//   <input type="password" id="lname" name="lname"  style="margin-top:1%; margin-bottom: 1%; width: 20%;"><br>
//   <input type="submit" id="test" value="Test connection" onclick="testConnection();" style="margin-top: 2%;">
// </form> 
// <script>
// console.log("lllll);

//   function testConnection() {
// console.log("kkkk);

//   } 

// </script>
//   </body>

//   </html>`;
// }

export function activate(context: vscode.ExtensionContext) {

	console.log(vscode.workspace.workspaceFolders);

	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	const nodeDependenciesProvider = new DepNodeProvider(rootPath);
	vscode.commands.registerCommand('connections.refreshEntry', () => nodeDependenciesProvider.refresh());

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
		panel.webview.html = getWebviewContent();
	});



	vscode.commands.registerCommand('nodeDependencies.editEntry', (node: Dependency) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
	vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node: Dependency) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));


	const jsonOutlineProvider = new JsonOutlineProvider(context);
	vscode.window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
	vscode.commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
	vscode.commands.registerCommand('jsonOutline.refreshNode', offset => jsonOutlineProvider.refresh(offset));
	vscode.commands.registerCommand('jsonOutline.renameNode', offset => jsonOutlineProvider.rename(offset));
	vscode.commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));

	new FtpExplorer(context);
	new FileExplorer(context);

	new TestView(context);

	new TestViewDragAndDrop(context);
}
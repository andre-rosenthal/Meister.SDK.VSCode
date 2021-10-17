import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
const jsonfile = require('jsonfile');



export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;

    data: TreeItem[];

    constructor(connectionOrendPionts?: string, connectionDtails?: any) {
        if (connectionOrendPionts === 'connections') {
            const filePath = path.join(__dirname, './connections.json');
            let connections;
            let arr: any[];
            let connectionNames: any[] = [];
            if (fs.existsSync(filePath)) {
                connections = jsonfile.readFileSync(filePath);
                arr = [...connections];
                arr.forEach(connection => {
                    connectionNames.push(new TreeItem(connection.connectionName, connection.connectionId, {
                        command: 'connections.editEntry',
                        title: 'open',
                        arguments: [connection.connectionName]
                    }));

                }
                )
            }
            this.data = connectionNames;
        }
        else {
            this.data = [new TreeItem('Getway ' + connectionDtails.connectionName + '@' + connectionDtails.cNumber, connectionDtails.connectionId, null,
                [new TreeItem('Wrapper Manager ', '', null, [new TreeItem('wrappers', '', null)]), new TreeItem('Meister Project', '', null,
                    connectionDtails.projects.map((element: any) => new TreeItem(element.project, '', '', element.modules.map((module: any) =>
                        new TreeItem(module.name, '', '', module.endPoints.map((endPoint: any) =>
                            new TreeItem(endPoint.namespace,'','',[new TreeItem(endPoint.styles[0]),new TreeItem(endPoint.styles[1])]))))))), new TreeItem('Json Library')])]
        }

    }

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}

class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;

    constructor(label: string,  id?: string, command?: any, children?: TreeItem[],iconPath?:any
    ) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                vscode.TreeItemCollapsibleState.Collapsed);
        this.command = command;
        this.children = children;
        this.id = id;
        this.iconPath= iconPath;
    }
    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}
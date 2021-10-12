import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
const jsonfile = require('jsonfile');



export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;

    data: TreeItem[];

    constructor() {
        const filePath = path.join(__dirname, './connections.json');
        let connections;
        let arr: any[];
        let connectionNames: any[] = [];
        if (fs.existsSync(filePath)) {
            connections = jsonfile.readFileSync(filePath);
            arr = [...connections];
            arr.forEach(connection => {
                connectionNames.push(new TreeItem(connection.connectionName,connection.connectionId, {
                    command: 'connections.editEntry',
                    title: 'open',
                    arguments: [connection.connectionName]
                }));

            }
            )
        }
        this.data = connectionNames;
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

    constructor(label: string, id:string, command?: vscode.Command, children?: TreeItem[],
    ) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                vscode.TreeItemCollapsibleState.Expanded);
        this.command = command;
        this.children = children;
        this.id = id;
    }
}
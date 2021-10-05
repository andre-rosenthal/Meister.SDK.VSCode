"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeDataProvider = void 0;
const vscode = require("vscode");
// export function activate(context: vscode.ExtensionContext) {
//   vscode.window.registerTreeDataProvider('connections', new TreeDataProvider());
// }
class TreeDataProvider {
    constructor() {
        this.data = [new TreeItem('CONNECTIONS', []), new TreeItem('ENDPOINTS', [])];
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
exports.TreeDataProvider = TreeDataProvider;
class TreeItem extends vscode.TreeItem {
    constructor(label, children) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}

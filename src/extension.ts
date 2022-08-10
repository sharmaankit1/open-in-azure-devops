import * as vscode from 'vscode';
import * as fs from 'fs';

function getDevOpsUrl() : string {
	let repoUrl: string = vscode.workspace.getConfiguration().get('openInAzureDevOps.repoUrl') || '';
	if (!repoUrl || !vscode.window.activeTextEditor) {
		return '';
	}
	let rootFolder: string = vscode.workspace.getConfiguration().get('openInAzureDevOps.rootFolder') || '';

	let relativePath = '/' + vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName);
	if (rootFolder != '' && fs.existsSync(rootFolder)) {
		relativePath = vscode.window.activeTextEditor.document.fileName.replace(rootFolder, '');
	}
	
	let lineStart: number = 0;
	let columnStart: number = 0;
	let lineEnd: number = 0;
	let columnEnd: number = 0;
	if (vscode.window.activeTextEditor.selection) {
		lineStart = vscode.window.activeTextEditor.selection.start.line + 1;
		columnStart = vscode.window.activeTextEditor.selection.start.character + 1;
		lineEnd = vscode.window.activeTextEditor.selection.end.line + 1;
		columnEnd = vscode.window.activeTextEditor.selection.end.character + 1;
	}
	repoUrl += '?path=' + encodeURIComponent(relativePath) + `&line=${lineStart}&lineEnd=${lineEnd}&lineStartColumn=${columnStart}&lineEndColumn=${columnEnd}&lineStyle=plain`;
	return repoUrl;
}

export function activate(context: vscode.ExtensionContext) {
	let openInAzureDevOpsDisposable = vscode.commands.registerCommand('extension.openInAzureDevOps', () => {
		const repoUrl = getDevOpsUrl();
		if (repoUrl == '') {
			return;
		}
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(repoUrl));
	});

	let copyAzureDevOpsUrlDisposable = vscode.commands.registerCommand('extension.copyAzureDevOpsUrl', () => {
		const repoUrl = getDevOpsUrl();
		if (repoUrl == '') {
			return;
		}
		vscode.env.clipboard.writeText(repoUrl);
	});

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
	statusBarItem.text = 'Open in Azure DevOps';
	statusBarItem.command = 'extension.openInAzureDevOps';
	statusBarItem.show();

	context.subscriptions.push(openInAzureDevOpsDisposable);
	context.subscriptions.push(copyAzureDevOpsUrlDisposable);
}

export function deactivate() {}

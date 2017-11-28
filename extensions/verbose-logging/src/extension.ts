/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	if (vscode.env.loggingDirectory) {
		context.subscriptions.push(new LoggingStatus());

		context.subscriptions.push(vscode.commands.registerCommand('verbose-logging.stopLogging', async () => {
			const selection = await vscode.window.showInformationMessage('Upload or preview???', 'Preview', 'Upload', 'Learn More');
			if (!selection) {
				return;
			}

			if (selection === 'Preview') {
				await vscode.commands.executeCommand('_workbench.action.files.revealInOS', vscode.Uri.parse(vscode.env.loggingDirectory!));
			}

			if (selection === 'Upload') {
				// Something
			}

			if (selection === 'Learn More') {
				const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content: 'Info about logging!' });
				vscode.window.showTextDocument(doc);
			}
		}));
	}
}

export default class LoggingStatus {
	private logStatusBarEntry: vscode.StatusBarItem;

	constructor() {
		this.logStatusBarEntry = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MIN_VALUE);
		this.logStatusBarEntry.text = 'LOGGING MODE';
		this.logStatusBarEntry.tooltip = vscode.env.loggingDirectory;
		this.logStatusBarEntry.command = 'verbose-logging.stopLogging';

		this.logStatusBarEntry.show();
	}

	dispose() {
		this.logStatusBarEntry.dispose();
	}
}

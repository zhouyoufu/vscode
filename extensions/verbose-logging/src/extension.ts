/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import fs = require('fs');
import os = require('os');
import path = require('path');
import crypto = require('crypto');

var archiver = require('archiver');

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
				upload();
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

async function upload() {
	const zip = await createLogZip();
	return await vscode.commands.executeCommand('_workbench.action.files.revealInOS', vscode.Uri.parse(zip));
}

function createLogZip(): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const outFile = path.join(os.tmpdir(), 'vscode-log-out-' + crypto.randomBytes(4).readUInt32LE(0) + '.zip');
		var output = fs.createWriteStream(outFile);
		var archive = archiver('zip');

		output.on('close', function () {
			console.log(archive.pointer() + ' total bytes');
			console.log('archiver has been finalized and the output file descriptor has closed.');
			resolve(outFile);
		});

		archive.on('error', function (err: any) {
			reject(err);
		});

		archive.pipe(output);
		archive.directory(vscode.env.loggingDirectory, '');
		archive.finalize();
	});
}
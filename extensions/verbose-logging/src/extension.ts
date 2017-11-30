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
import * as azure from 'azure-storage';

var archiver = require('archiver');

export function activate(context: vscode.ExtensionContext) {
	if (context.isLoggingEnabled()) {
		context.subscriptions.push(new LoggingStatus(vscode.env.globalLoggingDirectory!));
	}

	context.subscriptions.push(vscode.commands.registerCommand('verbose-logging.stopLogging', uploadOrPreview));
}

const UPLOAD = 'Secure Upload';
const REVIEW = 'Review';

async function uploadOrPreview(): Promise<string | undefined> {
	const selection = await vscode.window.showInformationMessage('Please review the log files, then upload them to our secure server', REVIEW, UPLOAD, 'Learn More');
	if (!selection) {
		return;
	}

	const loggingDir = vscode.env.globalLoggingDirectory!;
	if (!fs.existsSync(loggingDir)) {
		return;
	}

	if (selection === REVIEW) {
		await vscode.commands.executeCommand('_workbench.action.files.revealInOS', vscode.Uri.parse(loggingDir));
	}

	if (selection === UPLOAD) {
		try {
			const blobName = await upload(loggingDir!);
			const message = `Upload successful! Your log ID: ${blobName}`;
			vscode.window.showInformationMessage(message);
			console.log(message);

			return blobName;
		} catch (e) {
			vscode.window.showErrorMessage(`Upload failed: ${e.message}`);
			console.error(e);
		}
	}

	if (selection === 'Learn More') {
		const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content: 'Info about logging!' });
		vscode.window.showTextDocument(doc);
	}

	return;
}

export default class LoggingStatus {
	private logStatusBarEntry: vscode.StatusBarItem;

	constructor(logPath: string) {
		this.logStatusBarEntry = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MIN_VALUE);
		this.logStatusBarEntry.text = 'LOGGING MODE';
		this.logStatusBarEntry.tooltip = logPath;
		this.logStatusBarEntry.command = 'verbose-logging.stopLogging';

		this.logStatusBarEntry.show();
	}

	dispose() {
		this.logStatusBarEntry.dispose();
	}
}

const CONTAINER_NAME = 'logs';

async function upload(logPath: string): Promise<string> {
	const zipPath = await createLogZip(logPath);
	return new Promise<string>((resolve, reject) => {
		const conString = fs.readFileSync(path.join(__dirname, '../keys')).toString();
		const blobService = azure.createBlobService(conString);

		const blobName = crypto.randomBytes(4).readUInt32LE(0) + '';
		const metadata = {
			machineID: vscode.env.machineId
		};

		blobService.createBlockBlobFromLocalFile(CONTAINER_NAME, blobName, zipPath, { metadata }, (error: Error) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(blobName);
		});
	});

}

function createLogZip(logPath: string): Promise<string> {
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
		archive.directory(logPath, '');
		archive.finalize();
	});
}
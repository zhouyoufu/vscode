/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as os from 'os';
import * as cp from 'child_process';

import { ILaunchChannel } from 'vs/code/electron-main/launch';

export async function uploadLogs(
	channel: ILaunchChannel
): Promise<any> {
	const logsPath = await channel.call('get-logs-path', null);
	const outZip = await zipLogs(logsPath);
	return postLogs(logsPath, outZip);
}

async function postLogs(
	logsPath: string,
	outZip: string
) {
	const fs = await import('fs');
	const http = await import('https');
	return new Promise((resolve, reject) => {
		const req = http.request({
			host: 'vscode-log-uploader.azure-api.net',
			path: '/v1/upload',
			method: 'POST',
			headers: {
				'Content-Type': 'application/zip',
				'Content-Length': fs.statSync(logsPath).size
			}
		}, res => {
			res.on('data', (chunk) => {
				console.log(`BODY: ${chunk}`);
			});
			res.on('end', () => {
				console.log('No more data in response.');
				resolve();
			});
			res.on('error', (e) => {
				console.log('Error posting logs');
				reject(e);
			});
		});
		fs.createReadStream(outZip).pipe(req);
	});
}

async function zipLogs(
	logsPath: string
): Promise<string> {
	const fs = await import('fs');
	const path = await import('path');

	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-log-upload'));
	const outZip = path.join(tempDir, 'logs.zip');
	return new Promise<string>((resolve, reject) => {
		doZip(logsPath, outZip, (err, stdout, stderr) => {
			if (err) {
				console.error('Error zipping logs', err);
				reject(err);
				return;
			}
			console.log('Log zip: ' + outZip);
			resolve(outZip);
		});
	});
}

function doZip(
	logsPath: string,
	outZip: string,
	callback: (error: Error, stdout: string, stderr: string) => void
) {
	switch (os.platform()) {
		case 'win32':
			return cp.execFile('powershell', ['-Command', `Compress-Archive -Path "${logsPath}" -DestinationPath ${outZip}`], { cwd: logsPath }, callback);

		default:
			return cp.execFile('zip', ['-r', outZip, '.'], { cwd: logsPath }, callback);
	}
}
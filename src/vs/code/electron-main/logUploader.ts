/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import { ILaunchChannel } from 'vs/code/electron-main/launch';
import { TPromise } from 'vs/base/common/winjs.base';

interface PostResult {
	blob_id: string;
}

export async function uploadLogs(
	channel: ILaunchChannel
): TPromise<any> {
	const logsPath = await channel.call('get-logs-path', null);
	const outZip = await zipLogs(logsPath);
	const result = await postLogs(logsPath, outZip);
	console.log('Blob: ' + result.blob_id);
	return result;
}

function postLogs(
	logsPath: string,
	outZip: string
): TPromise<PostResult> {
	return new TPromise((resolve, reject) => {
		const req = https.request({
			host: 'vscode-log-uploader.azure-api.net',
			path: '/v1/upload',
			method: 'POST',
			headers: {
				'Content-Type': 'application/zip',
				'Content-Length': fs.statSync(logsPath).size
			}
		}, res => {
			const chunks: (Buffer)[] = [];
			res.on('data', (chunk: Buffer) => {
				chunks.push(chunk);
			});
			res.on('end', () => {
				const body = Buffer.concat(chunks);
				try {
					const data = JSON.parse(body.toString());
					if (data.error) {
						reject(data.error);
						return
					}
					resolve(data);
					return;
				} catch (e) {
					console.log('Error parsing response');
					reject(e);
				}
			});
			res.on('error', (e) => {
				console.log('Error posting logs');
				reject(e);
			});
		});
		fs.createReadStream(outZip).pipe(req);
	});
}

function zipLogs(
	logsPath: string
): TPromise<string> {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-log-upload'));
	const outZip = path.join(tempDir, 'logs.zip');
	return new TPromise<string>((resolve, reject) => {
		doZip(logsPath, outZip, tempDir, (err, stdout, stderr) => {
			console.log(stderr);
			if (err || stderr) {
				console.error('Error zipping logs', err, stderr);
				reject(stderr);
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
	tempDir: string,
	callback: (error: Error, stdout: string, stderr: string) => void
) {
	switch (os.platform()) {
		case 'win32':
			// Copy directory first to avoid file locking issues
			const sub = tempDir + '\\sub\\';
			return cp.execFile('powershell', ['-Command',
				`[System.IO.Directory]::CreateDirectory("${sub}"); Copy-Item -recurse "${logsPath}" "${sub}"; Compress-Archive -Path "${sub}" -DestinationPath "${outZip}"`],
				{ cwd: logsPath },
				callback);

		default:
			return cp.execFile('zip', ['-r', outZip, '.'], { cwd: logsPath }, callback);
	}
}
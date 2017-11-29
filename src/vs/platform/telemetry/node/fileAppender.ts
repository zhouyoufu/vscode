/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { TPromise } from 'vs/base/common/winjs.base';
import { ITelemetryAppender } from 'vs/platform/telemetry/common/telemetryUtils';
import { deepClone } from 'vs/base/common/objects';
import { startsWith } from 'vs/base/common/strings';

export class FileAppender implements ITelemetryAppender {

	private streams = new Map<string, fs.WriteStream>();

	log(eventName: string, data?: any): void {
		if (data && data['loggingDirectory']) {
			data = deepClone(data);
			const stream = this._getStream(data['loggingDirectory']);

			// Clean up data
			delete data['loggingDirectory'];
			delete data['sessionID'];
			delete data['timestamp'];
			delete data['version'];
			Object.keys(data).forEach(k => {
				if (startsWith(k, 'common.')) {
					delete data[k];
				}
			});

			const d = new Date();
			stream.write(`[${d.toJSON()}] ${eventName}: ${JSON.stringify(data)}\n`);
		}
	}

	private _getStream(logFolderPath: string): fs.WriteStream {
		const logFilePath = path.join(logFolderPath, 'telemetry.log');
		if (!this.streams.has(logFilePath)) {
			if (!fs.existsSync(logFolderPath)) {
				fs.mkdirSync(logFolderPath);
			}

			this.streams.set(logFilePath, fs.createWriteStream(logFilePath));
		}

		return this.streams.get(logFilePath);
	}

	dispose(): TPromise<any> {
		this.streams.forEach(s => s.close());

		return TPromise.wrap(null);
	}
}

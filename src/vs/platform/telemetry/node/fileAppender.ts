/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { TPromise } from 'vs/base/common/winjs.base';
import { ITelemetryAppender } from 'vs/platform/telemetry/common/telemetryUtils';

export class FileAppender implements ITelemetryAppender {

	private streams = new Map<string, fs.WriteStream>();

	log(eventName: string, data?: any): void {
		if (data && data['loggingDirectory']) {
			const stream = this._getStream(data['loggingDirectory']);
			delete data['loggingDirectory'];
			stream.write(eventName + ': ' + JSON.stringify(data));
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

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

	private logFileStream: fs.WriteStream;

	constructor(loggingDirectory: string | undefined) {
		const logFilePath = path.join(loggingDirectory, 'telemetry.log');
		console.log('log file path: ' + logFilePath);
		this.logFileStream = fs.createWriteStream(logFilePath);
	}

	log(eventName: string, data?: any): void {
		console.log(`logging ` + eventName);
		this.logFileStream.write(eventName + ': ' + JSON.stringify(data));
	}

	dispose(): TPromise<any> {
		this.logFileStream.close();
		return TPromise.wrap(null);
	}
}

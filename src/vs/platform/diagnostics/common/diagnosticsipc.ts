/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IChannel} from 'vs/base/parts/ipc/common/ipc';
import { IDiagnosticsService } from 'vs/platform/diagnostics/common/diagnostics';

export interface IDiagnosticsChannel extends IChannel {
	call(command: 'getMainProcessInfo'): TPromise<any>;
}

export class DiagnosticsChannel implements IDiagnosticsChannel {

	constructor(private service: IDiagnosticsService) { }

	call(command: string, arg?: any): TPromise<any> {
		switch (command) {
			case 'getMainProcessInfo':
				return this.service.getDiagnosticsInfo();
			default:
				return undefined;
		}
	}
}

export class DiagnosticsChannelClient implements IDiagnosticsService {
	_serviceBrand;

	constructor(private channel: IDiagnosticsChannel) { }

	getDiagnosticsInfo(): TPromise<any> {
		return this.channel.call('getMainProcessInfo');
	}
}

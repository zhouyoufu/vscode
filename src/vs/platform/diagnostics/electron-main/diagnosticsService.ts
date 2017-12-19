/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IDiagnosticsService } from '../common/diagnostics';
import { ILaunchService } from 'vs/code/electron-main/launch';

export class DiagnosticsService implements IDiagnosticsService {
	_serviceBrand;

	constructor(
		@ILaunchService private launchService: ILaunchService) { }

	getDiagnosticsInfo(): TPromise<any> {
		return this.launchService.getMainProcessInfo();
	}
}
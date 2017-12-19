/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const IDiagnosticsService = createDecorator<IDiagnosticsService>('diagnosticsService');

export interface IDiagnosticsService {
	_serviceBrand: any;
	getDiagnosticsInfo(): TPromise<any>;
}

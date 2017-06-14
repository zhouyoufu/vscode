/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Event, { Emitter } from 'vs/base/common/event';
import { Dimension } from 'vs/base/browser/builder';

export interface ITerminalPart {
	layout(dimension: Dimension): void;
}
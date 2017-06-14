/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Dimension } from 'vs/base/browser/builder';
import { ITerminalPart } from 'vs/workbench/parts/terminal/browser/terminal';
import { ITerminalInstance, TerminalSplitDirection, ITerminalService } from "vs/workbench/parts/terminal/common/terminal";

export class TerminalPane implements ITerminalPart {

	private _primaryPane: TerminalPane;
	private _secondaryPane: TerminalPane;

	private _primaryTerminal: ITerminalInstance;
	private _secondaryTerminal: ITerminalInstance;

	private _container: HTMLElement;
	private _mainContainer: HTMLElement;
	private _secondaryContainer: HTMLElement;

	private _splitDirection: TerminalSplitDirection;
	private _lastKnownDimension: Dimension;

	constructor(
		mainTerminal: ITerminalInstance,
		@ITerminalService private _terminalService: ITerminalService
	) {
		this._primaryTerminal = mainTerminal;
		this._primaryTerminal.onSplitRequest(direction => this._split(direction, true));
	}

	public layout(dimension: Dimension): void {
		this._primaryTerminal.layout(dimension);
		this._lastKnownDimension = dimension;
	}

	private _split(direction: TerminalSplitDirection, mainTerminalRequest: boolean): void {
		this._splitDirection = direction;
		if (mainTerminalRequest) {
			if (this._secondaryTerminal) {
				// Move the main terminal into a new pane

				// TODO: Need to be able to move TerminalInstances from one parent to another
			} else {
				this._secondaryTerminal = this._terminalService.createInstance();
				this.layout(this._lastKnownDimension);
			}
		}
	}
}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nls from 'vs/nls';
import { registerEditorAction, ServicesAccessor, EditorAction } from 'vs/editor/browser/editorExtensions';
import { sendData, readJSON } from 'vs/base/node/simpleIpc';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { onUnexpectedError } from 'vs/base/common/errors';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

export class ToggleRenderWhitespaceAction extends EditorAction {

	constructor() {
		super({
			id: 'editor.action.toggleRenderWhitespace',
			label: nls.localize('toggleRenderWhitespace', "View: Toggle Render Whitespace"),
			alias: 'View: Toggle Render Whitespace',
			precondition: null
		});
	}

	public run(accessor: ServicesAccessor, editor: ICodeEditor): void {
		const environmentService = accessor.get(IEnvironmentService);
		const socketPath = environmentService.args['inspect-all-ipc'];
		if (socketPath) {
			sendData(socketPath, JSON.stringify({
				type: 'getProcesses',
			})).then(res => readJSON<any>(res))
				.then(data => {
					console.log(JSON.stringify(data, null, '  '));
				}, onUnexpectedError);
		}

	}
}

registerEditorAction(ToggleRenderWhitespaceAction);

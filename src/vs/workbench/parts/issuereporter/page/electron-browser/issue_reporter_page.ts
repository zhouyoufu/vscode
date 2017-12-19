/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { escape } from 'vs/base/common/strings';
import { localize } from 'vs/nls';
import * as os from 'os';
import product from 'vs/platform/node/product';

export function used() {
}

export default () => `
<div class="welcomePageContainer">
	<div class="welcomePage">
		<div class="title">
			<h1 class="caption">${escape(localize('welcomePage.vscode', "Issue Reporter"))}</h1>
		</div>
		<div class="row">
			<div class="splash">
				<div class="section start">
					<h2 class="caption">${escape(localize('welcomePage.start', "System Info"))}</h2>
					<table>
						<tbody>
							<tr>
								<td>VS Code Version</td>
								<td>${product.nameLong}</td>
							</tr>
							<tr>
								<td>OS Version</td>
								<td>${os.type()} ${os.arch()} ${os.release()}</td>
							</tr>
						<tbody/>
					</table>
				</div>
				<div id="process"></div>
				<div id="workspace"></div>
			</div>
			<div class="splash">
				<div class="section">
					<div>
						<label for="issuetype">
							What kind of issue are you experiencing?
						</label>
					</div>
					<select id="issuetype">
						<option value="bug">Bug</option>
						<option value="performance">Performance issue</option>
						<option value="startup">Startup performance issue</option>
					</select>
				</div>
				<div class="section">
					<label for="isextensions">
						Is this issue reproducible without extensions?
						<div class="performance startup">
						If the extension host is using a high amount of CPU, the problem could be with a specific extension. Please try disabling all extensions and check if the problem persists. If this does fix the problem,
						you can disable</div>
					</label>
					<input id="isextensions" type="checkbox"/> <br/>
					<a href="command:workbench.action.showRuntimeExtensions">${escape(localize('issueReporter.showRunningExtensions', "Show Running Extensions"))}</a><br/>
					<a href="command:workbench.extensions.action.disableAll">${escape(localize('issueReporter.disableExtensions', "Disable All Installed Extensions"))}</a><br/>
				</div>
				<div class="section">
					Action to upload logs here
				</div>
				<div class="section">
					Repro steps<br/>
					<textarea></textarea>
				</div>
				<a id="reportissue">${escape(localize('welcomePage.openFolder', "Report Issue"))}</a>
			</div>
	</div>
</div>
`;

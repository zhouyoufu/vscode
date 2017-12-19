/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { localize } from 'vs/nls';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { Schemas } from 'vs/base/common/network';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { Position } from 'vs/platform/editor/common/editor';
import { IssueReporterInput } from 'vs/workbench/parts/issuereporter/page/node/issueReporterInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { used } from 'vs/workbench/parts/issueReporter/page/electron-browser/issue_reporter_page';
import { ITimerService, IStartupMetrics } from 'vs/workbench/services/timer/common/timerService';
import product from 'vs/platform/node/product';
import * as os from 'os';
import { IDiagnosticsService } from 'vs/platform/diagnostics/common/diagnostics';
import { collectWorkspaceStats, collectLaunchConfigs } from 'vs/base/node/stats';
import { basename } from 'vs/base/common/paths';
import { listProcesses } from 'vs/base/node/ps';

used();

const telemetryFrom = 'issueReporterPage';

export class OpenIssueReporterAction extends Action {

	public static readonly ID = 'workbench.action.showIssueReporter';
	public static readonly LABEL = localize('issueReporterPage', "Issue Reporter");

	constructor(
		id: string,
		label: string,
		@IInstantiationService private instantiationService: IInstantiationService
	) {
		super(id, label);
	}

	public run(): TPromise<void> {
		return this.instantiationService.createInstance(IssueReporter)
			.openEditor()
			.then(() => undefined);
	}
}

const issueReporterInputTypeId = 'workbench.editors.issueReporterPageInput';

class IssueReporter {

	private disposables: IDisposable[] = [];

	readonly editorInput: IssueReporterInput;

	constructor(
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@ITimerService private timerService: ITimerService,
		@IDiagnosticsService private diagnosticsService: IDiagnosticsService
	) {
		this.disposables.push(lifecycleService.onShutdown(() => this.dispose()));
		const resource = URI.parse(require.toUrl('./issue_reporter_page'))
			.with({
				scheme: Schemas.walkThrough,
				query: JSON.stringify({ moduleId: 'vs/workbench/parts/issuereporter/page/electron-browser/issue_reporter_page' })
			});
		this.editorInput = this.instantiationService.createInstance(IssueReporterInput, {
			typeId: issueReporterInputTypeId,
			name: localize('welcome.title', "Issue Reporter"),
			resource,
			telemetryFrom,
			onReady: (container: HTMLElement) => this.onReady(container)
		});
	}

	public openEditor() {
		return this.editorService.openEditor(this.editorInput, { pinned: true }, Position.ONE);
	}

	private onReady(container: HTMLElement): void {
		const metrics = this.timerService.startupMetrics;
		this.renderSystemInfo(container, metrics);

		this.diagnosticsService.getDiagnosticsInfo().then(info => {
			console.log(info);
			listProcesses(info.mainPID).then(rootProcess => {
				console.log(rootProcess);
			});

			this.renderWorkspaceStats(info.windows, container);
		});

		const reportIssueButton = container.querySelector('#reportissue');
		reportIssueButton.addEventListener('click', e => {
			const osVersion = `${os.type()} ${os.arch()} ${os.release()}`;
			const body = encodeURIComponent(
				`- VSCode Version: <code>${product.nameLong}</code>
	- OS Version: <code>${osVersion}</code>
	- CPUs: <code>${metrics.cpus.model} (${metrics.cpus.count} x ${metrics.cpus.speed})</code>
	- Memory (System): <code>${(metrics.totalmem / (1024 * 1024 * 1024)).toFixed(2)}GB (${(metrics.freemem / (1024 * 1024 * 1024)).toFixed(2)}GB free)</code>
	- Memory (Process): <code>${(metrics.meminfo.workingSetSize / 1024).toFixed(2)}MB working set (${(metrics.meminfo.peakWorkingSetSize / 1024).toFixed(2)}MB peak, ${(metrics.meminfo.privateBytes / 1024).toFixed(2)}MB private, ${(metrics.meminfo.sharedBytes / 1024).toFixed(2)}MB shared)</code>
	- Load (avg): <code>${metrics.loadavg.map(l => Math.round(l)).join(', ')}</code>
	- VM: <code>${metrics.isVMLikelyhood}%</code>
	- Initial Startup: <code>${metrics.initialStartup ? 'yes' : 'no'}</code>
	- Screen Reader: <code>${metrics.hasAccessibilitySupport ? 'yes' : 'no'}</code>
	- Empty Workspace: <code>${metrics.emptyWorkbench ? 'yes' : 'no'}</code>`);
			window.open(`${product.reportIssueUrl}?body=${body}`);
		});
	}

	private renderSystemInfo(container: HTMLElement, metrics: IStartupMetrics): void {
		const table = container.querySelector('tbody') as HTMLElement;
		const metricsToDisplay = {
			'CPUs': `${metrics.cpus.model} (${metrics.cpus.count} x ${metrics.cpus.speed})`,
			'Memory (System)': `${(metrics.totalmem / (1024 * 1024 * 1024)).toFixed(2)}GB (${(metrics.freemem / (1024 * 1024 * 1024)).toFixed(2)}GB free)`,
			'Memory (Process)': `${(metrics.meminfo.workingSetSize / 1024).toFixed(2)}MB working set (${(metrics.meminfo.peakWorkingSetSize / 1024).toFixed(2)}MB peak, ${(metrics.meminfo.privateBytes / 1024).toFixed(2)}MB private, ${(metrics.meminfo.sharedBytes / 1024).toFixed(2)}MB shared)`,
			'Load (avg)': `${metrics.loadavg.map(l => Math.round(l)).join(', ')}`,
			'VM': `${metrics.isVMLikelyhood}%`,
			'Screen Reader': `${metrics.hasAccessibilitySupport ? 'yes' : 'no'}`
		};

		Object.keys(metricsToDisplay).forEach(key => {
			const row = document.createElement('tr');

			const header = document.createElement('td');
			header.innerText = key;

			const value = document.createElement('td');
			value.innerText = metricsToDisplay[key];

			row.appendChild(header);
			row.appendChild(value);

			table.appendChild(row);
		});
	}

	private renderWorkspaceStats(workspaceWindows: any, container: HTMLElement): void {
		const workspaceDiv = container.querySelector('#workspace');
		workspaceWindows.forEach(window => {
			window.folders.forEach(folder => {
				const stats = collectWorkspaceStats(folder, ['node_modules', '.git']);

				let countMessage = `${stats.fileCount} files`;
				if (stats.maxFilesReached) {
					countMessage = `more than ${countMessage}`;
				}

				const folderInfo = document.createElement('div');
				folderInfo.innerHTML = `Folder (${basename(folder)}): ${countMessage}`;

				// File Types
				let line = 'File types: ';
				const maxShown = 10;
				let max = stats.fileTypes.length > maxShown ? maxShown : stats.fileTypes.length;
				for (let i = 0; i < max; i++) {
					const item = stats.fileTypes[i];
					line += `${item.name} (${item.count}) `;
				}

				const folderFileTypes = document.createElement('div');
				folderFileTypes.innerHTML = line;
				folderInfo.appendChild(folderFileTypes);

				// Config files
				line = 'Config files: ';
				stats.configFiles.forEach((item) => {
					line += `${item.name} (${item.count}) `;
				});

				const folderConfigFiles = document.createElement('div');
				folderConfigFiles.innerHTML = line;
				folderInfo.appendChild(folderConfigFiles);

				// Launch configs
				const launchConfigs = collectLaunchConfigs(folder);
				line = 'Config files: ';
				launchConfigs.forEach((item) => {
					line += item.count > 1 ? ` ${item.name}(${item.count})` : ` ${item.name}`;
				});

				const launchConfigDiv = document.createElement('div');
				launchConfigDiv.innerHTML = line;
				folderInfo.appendChild(launchConfigDiv);


				workspaceDiv.appendChild(folderInfo);
			});
		});
	}

	dispose(): void {
		this.disposables = dispose(this.disposables);
	}

}

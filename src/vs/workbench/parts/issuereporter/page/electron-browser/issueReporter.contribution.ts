/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IWorkbenchActionRegistry, Extensions as ActionExtensions } from 'vs/workbench/common/actions';
import { IEditorRegistry, Extensions as EditorExtensions, EditorDescriptor } from 'vs/workbench/browser/editor';
import { OpenIssueReporterAction } from 'vs/workbench/parts/issuereporter/page/electron-browser/issueReporterPage';
import { IssueReporterInput } from 'vs/workbench/parts/issuereporter/page/node/issueReporterInput';
import { IssueReporterPart } from 'vs/workbench/parts/issuereporter/page/electron-browser/issueReporterPart';

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(OpenIssueReporterAction, OpenIssueReporterAction.ID, OpenIssueReporterAction.LABEL), 'Help: Issue Reporter', localize('help', "Help"));

Registry.as<IEditorRegistry>(EditorExtensions.Editors)
	.registerEditor(new EditorDescriptor(
		IssueReporterPart,
		IssueReporterPart.ID,
		localize('walkThrough.editor.label', "Issue Reporter"),
	),
	[new SyncDescriptor(IssueReporterInput)]);
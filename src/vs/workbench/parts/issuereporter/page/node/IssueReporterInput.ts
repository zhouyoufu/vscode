/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { EditorInput, EditorModel, ITextEditorModel } from 'vs/workbench/common/editor';
import URI from 'vs/base/common/uri';
import { IReference, IDisposable, dispose } from 'vs/base/common/lifecycle';
import { telemetryURIDescriptor } from 'vs/platform/telemetry/common/telemetryUtils';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IHashService } from 'vs/workbench/services/hash/common/hashService';

export class IssueReporterModel extends EditorModel {

	constructor(private mainRef: IReference<ITextEditorModel>) {
		super();
	}

	get main() {
		return this.mainRef.object;
	}

	dispose() {
		this.mainRef.dispose();
		super.dispose();
	}
}

export interface WalkThroughInputOptions {
	readonly typeId: string;
	readonly name: string;
	readonly description?: string;
	readonly resource: URI;
	readonly telemetryFrom: string;
	readonly onReady?: (container: HTMLElement) => void;
}

export class IssueReporterInput extends EditorInput {

	private disposables: IDisposable[] = [];

	private promise: TPromise<IssueReporterModel>;

	private maxTopScroll = 0;
	private maxBottomScroll = 0;

	constructor(
		private options: WalkThroughInputOptions,
		@ITextModelService private textModelResolverService: ITextModelService,
		@IHashService private hashService: IHashService
	) {
		super();
	}

	getResource(): URI {
		return this.options.resource;
	}

	getTypeId(): string {
		return this.options.typeId;
	}

	getName(): string {
		return this.options.name;
	}

	getDescription(): string {
		return this.options.description || '';
	}

	getTelemetryFrom(): string {
		return this.options.telemetryFrom;
	}

	getTelemetryDescriptor(): object {
		const descriptor = super.getTelemetryDescriptor();
		descriptor['target'] = this.getTelemetryFrom();
		descriptor['resource'] = telemetryURIDescriptor(this.options.resource, path => this.hashService.createSHA1(path));
		/* __GDPR__FRAGMENT__
			"EditorTelemetryDescriptor" : {
				"target" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
				"resource": { "${inline}": [ "${URIDescriptor}" ] }
			}
		*/
		return descriptor;
	}

	get onReady() {
		return this.options.onReady;
	}

	resolve(refresh?: boolean): TPromise<IssueReporterModel> {
		if (!this.promise) {
			this.promise = this.textModelResolverService.createModelReference(this.options.resource)
				.then(ref => new IssueReporterModel(ref));
		}

		return this.promise;
	}

	matches(otherInput: any): boolean {
		if (super.matches(otherInput) === true) {
			return true;
		}

		if (otherInput instanceof IssueReporterInput) {
			let otherResourceEditorInput = <IssueReporterInput>otherInput;

			// Compare by properties
			return otherResourceEditorInput.options.resource.toString() === this.options.resource.toString();
		}

		return false;
	}

	dispose(): void {
		this.disposables = dispose(this.disposables);

		if (this.promise) {
			this.promise.then(model => model.dispose());
			this.promise = null;
		}

		super.dispose();
	}

	public relativeScrollPosition(topScroll: number, bottomScroll: number) {
		this.maxTopScroll = Math.max(this.maxTopScroll, topScroll);
		this.maxBottomScroll = Math.max(this.maxBottomScroll, bottomScroll);
	}
}

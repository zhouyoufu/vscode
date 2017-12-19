/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import * as strings from 'vs/base/common/strings';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { $, Dimension, Builder } from 'vs/base/browser/builder';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { EditorOptions } from 'vs/workbench/common/editor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IssueReporterInput } from 'vs/workbench/parts/issuereporter/page/node/issueReporterInput';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { marked } from 'vs/base/common/marked/marked';
import { IModelService } from 'vs/editor/common/services/modelService';
import { CodeEditor } from 'vs/editor/browser/codeEditor';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { localize } from 'vs/nls';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { Scope } from 'vs/workbench/common/memento';
import { RawContextKey, IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IMessageService, Severity } from 'vs/platform/message/common/message';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { UILabelProvider } from 'vs/base/common/keybindingLabels';
import { OS, OperatingSystem } from 'vs/base/common/platform';

export const WALK_THROUGH_FOCUS = new RawContextKey<boolean>('interactivePlaygroundFocus', false);

const UNBOUND_COMMAND = localize('walkThrough.unboundCommand', "unbound");
const WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'walkThroughEditorViewState';

interface IViewState {
	scrollTop: number;
	scrollLeft: number;
}

interface IWalkThroughEditorViewState {
	viewState: IViewState;
}

interface IWalkThroughEditorViewStates {
	0?: IWalkThroughEditorViewState;
	1?: IWalkThroughEditorViewState;
	2?: IWalkThroughEditorViewState;
}

export class IssueReporterPart extends BaseEditor {

	static ID: string = 'workbench.editor.issueReporterPart';

	private disposables: IDisposable[] = [];
	private contentDisposables: IDisposable[] = [];
	private content: HTMLDivElement;
	private scrollbar: DomScrollableElement;
	private editorFocus: IContextKey<boolean>;
	private size: Dimension;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService protected themeService: IThemeService,
		@IOpenerService private openerService: IOpenerService,
		@IModelService protected modelService: IModelService,
		@IKeybindingService private keybindingService: IKeybindingService,
		@IStorageService private storageService: IStorageService,
		@IContextKeyService private contextKeyService: IContextKeyService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IMessageService private messageService: IMessageService
	) {
		super(IssueReporterPart.ID, telemetryService, themeService);
		this.editorFocus = WALK_THROUGH_FOCUS.bindTo(this.contextKeyService);
	}

	createEditor(parent: Builder): void {
		const container = parent.getHTMLElement();

		this.content = document.createElement('div');
		this.content.tabIndex = 0;
		this.content.style.outlineStyle = 'none';

		this.scrollbar = new DomScrollableElement(this.content, {
			horizontal: ScrollbarVisibility.Auto,
			vertical: ScrollbarVisibility.Auto
		});
		this.disposables.push(this.scrollbar);
		container.appendChild(this.scrollbar.getDomNode());

		this.registerFocusHandlers();
		this.registerClickHandler();

		this.disposables.push(this.scrollbar.onScroll(e => this.updatedScrollPosition()));
	}

	private updatedScrollPosition() {
		const scrollDimensions = this.scrollbar.getScrollDimensions();
		const scrollPosition = this.scrollbar.getScrollPosition();
		const scrollHeight = scrollDimensions.scrollHeight;
		if (scrollHeight && this.input instanceof IssueReporterInput) {
			const scrollTop = scrollPosition.scrollTop;
			const height = scrollDimensions.height;
			this.input.relativeScrollPosition(scrollTop / scrollHeight, (scrollTop + height) / scrollHeight);
		}
	}

	private addEventListener<K extends keyof HTMLElementEventMap, E extends HTMLElement>(element: E, type: K, listener: (this: E, ev: HTMLElementEventMap[K]) => any, useCapture?: boolean): IDisposable;
	private addEventListener<E extends HTMLElement>(element: E, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): IDisposable;
	private addEventListener<E extends HTMLElement>(element: E, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): IDisposable {
		element.addEventListener(type, listener, useCapture);
		return { dispose: () => { element.removeEventListener(type, listener, useCapture); } };
	}

	private registerFocusHandlers() {
		this.disposables.push(this.addEventListener(this.content, 'mousedown', e => {
			this.focus();
		}));
		this.disposables.push(this.addEventListener(this.content, 'focus', e => {
			this.editorFocus.set(true);
		}));
		this.disposables.push(this.addEventListener(this.content, 'blur', e => {
			this.editorFocus.reset();
		}));
		this.disposables.push(this.addEventListener(this.content, 'focusin', e => {
			// Work around scrolling as side-effect of setting focus on the offscreen zone widget (#18929)
			if (e.target instanceof HTMLElement && e.target.classList.contains('zone-widget-container')) {
				const scrollPosition = this.scrollbar.getScrollPosition();
				this.content.scrollTop = scrollPosition.scrollTop;
				this.content.scrollLeft = scrollPosition.scrollLeft;
			}
		}));
	}

	private registerClickHandler() {
		this.content.addEventListener('click', event => {
			for (let node = event.target as HTMLElement; node; node = node.parentNode as HTMLElement) {
				if (node instanceof HTMLAnchorElement && node.href) {
					let baseElement = window.document.getElementsByTagName('base')[0] || window.location;
					if (baseElement && node.href.indexOf(baseElement.href) >= 0 && node.hash) {
						const scrollTarget = this.content.querySelector(node.hash);
						const innerContent = this.content.firstElementChild;
						if (scrollTarget && innerContent) {
							const targetTop = scrollTarget.getBoundingClientRect().top - 20;
							const containerTop = innerContent.getBoundingClientRect().top;
							this.scrollbar.setScrollPosition({ scrollTop: targetTop - containerTop });
						}
					} else {
						this.open(URI.parse(node.href));
					}
					event.preventDefault();
					break;
				} else if (node instanceof HTMLButtonElement) {
					const href = node.getAttribute('data-href');
					if (href) {
						this.open(URI.parse(href));
					}
					break;
				} else if (node === event.currentTarget) {
					break;
				}
			}
		});
	}

	private open(uri: URI) {
		if (uri.scheme === 'command' && uri.path === 'git.clone' && !CommandsRegistry.getCommand('git.clone')) {
			this.messageService.show(Severity.Info, localize('walkThrough.gitNotFound', "It looks like Git is not installed on your system."));
			return;
		}
		this.openerService.open(this.addFrom(uri));
	}

	private addFrom(uri: URI) {
		if (uri.scheme !== 'command' || !(this.input instanceof IssueReporterInput)) {
			return uri;
		}
		const query = uri.query ? JSON.parse(uri.query) : {};
		query.from = this.input.getTelemetryFrom();
		return uri.with({ query: JSON.stringify(query) });
	}

	layout(size: Dimension): void {
		this.size = size;
		$(this.content).style({ height: `${size.height}px`, width: `${size.width}px` });
		this.updateSizeClasses();
		this.contentDisposables.forEach(disposable => {
			if (disposable instanceof CodeEditor) {
				disposable.layout();
			}
		});
		this.scrollbar.scanDomNode();
	}

	private updateSizeClasses() {
		const innerContent = this.content.firstElementChild;
		if (this.size && innerContent) {
			const classList = innerContent.classList;
			classList[this.size.height <= 685 ? 'add' : 'remove']('max-height-685px');
		}
	}

	focus(): void {
		let active = document.activeElement;
		while (active && active !== this.content) {
			active = active.parentElement;
		}
		if (!active) {
			this.content.focus();
		}
		this.editorFocus.set(true);
	}

	setInput(input: IssueReporterInput, options: EditorOptions): TPromise<void> {
		if (this.input instanceof IssueReporterInput && this.input.matches(input)) {
			return TPromise.as(undefined);
		}

		if (this.input instanceof IssueReporterInput) {
			this.saveTextEditorViewState(this.input.getResource());
		}

		this.contentDisposables = dispose(this.contentDisposables);
		this.content.innerHTML = '';

		return super.setInput(input, options)
			.then(() => {
				return input.resolve(true);
			})
			.then(model => {
				const content = model.main.textEditorModel.getLinesContent().join('\n');
				if (!strings.endsWith(input.getResource().path, '.md')) {
					this.content.innerHTML = content;
					this.updateSizeClasses();
					this.decorateContent();
					this.contentDisposables.push(this.keybindingService.onDidUpdateKeybindings(() => this.decorateContent()));
					if (input.onReady) {
						input.onReady(this.content.firstElementChild as HTMLElement);
					}
					this.scrollbar.scanDomNode();
					this.loadTextEditorViewState(input.getResource());
					this.updatedScrollPosition();
					return;
				}

				const renderer = new marked.Renderer();
				const innerContent = document.createElement('div');
				innerContent.classList.add('walkThroughContent'); // only for markdown files
				const markdown = this.expandMacros(content);
				innerContent.innerHTML = marked(markdown, { renderer });
				this.content.appendChild(innerContent);

				this.updateSizeClasses();
				this.multiCursorModifier();
				this.contentDisposables.push(this.configurationService.onDidChangeConfiguration(e => {
					if (e.affectsConfiguration('editor.multiCursorModifier')) {
						this.multiCursorModifier();
					}
				}));
				if (input.onReady) {
					input.onReady(innerContent);
				}
				this.scrollbar.scanDomNode();
				this.loadTextEditorViewState(input.getResource());
				this.updatedScrollPosition();
			});
	}

	private expandMacros(input: string) {
		return input.replace(/kb\(([a-z.\d\-]+)\)/gi, (match: string, kb: string) => {
			const keybinding = this.keybindingService.lookupKeybinding(kb);
			const shortcut = keybinding ? keybinding.getLabel() : UNBOUND_COMMAND;
			return `<span class="shortcut">${strings.escape(shortcut)}</span>`;
		});
	}

	private decorateContent() {
		const keys = this.content.querySelectorAll('.shortcut[data-command]');
		Array.prototype.forEach.call(keys, (key: Element) => {
			const command = key.getAttribute('data-command');
			const keybinding = command && this.keybindingService.lookupKeybinding(command);
			const label = keybinding ? keybinding.getLabel() : UNBOUND_COMMAND;
			while (key.firstChild) {
				key.removeChild(key.firstChild);
			}
			key.appendChild(document.createTextNode(label));
		});
		const ifkeys = this.content.querySelectorAll('.if_shortcut[data-command]');
		Array.prototype.forEach.call(ifkeys, (key: HTMLElement) => {
			const command = key.getAttribute('data-command');
			const keybinding = command && this.keybindingService.lookupKeybinding(command);
			key.style.display = !keybinding ? 'none' : '';
		});
	}

	private multiCursorModifier() {
		const labels = UILabelProvider.modifierLabels[OS];
		const value = this.configurationService.getValue<string>('editor.multiCursorModifier');
		const modifier = labels[value === 'ctrlCmd' ? (OS === OperatingSystem.Macintosh ? 'metaKey' : 'ctrlKey') : 'altKey'];
		const keys = this.content.querySelectorAll('.multi-cursor-modifier');
		Array.prototype.forEach.call(keys, (key: Element) => {
			while (key.firstChild) {
				key.removeChild(key.firstChild);
			}
			key.appendChild(document.createTextNode(modifier));
		});
	}

	private saveTextEditorViewState(resource: URI): void {
		const memento = this.getMemento(this.storageService, Scope.WORKSPACE);
		let editorViewStateMemento: { [key: string]: { [position: number]: IWalkThroughEditorViewState } } = memento[WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY];
		if (!editorViewStateMemento) {
			editorViewStateMemento = Object.create(null);
			memento[WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY] = editorViewStateMemento;
		}

		const scrollPosition = this.scrollbar.getScrollPosition();
		const editorViewState: IWalkThroughEditorViewState = {
			viewState: {
				scrollTop: scrollPosition.scrollTop,
				scrollLeft: scrollPosition.scrollLeft
			}
		};

		let fileViewState = editorViewStateMemento[resource.toString()];
		if (!fileViewState) {
			fileViewState = Object.create(null);
			editorViewStateMemento[resource.toString()] = fileViewState;
		}

		if (typeof this.position === 'number') {
			fileViewState[this.position] = editorViewState;
		}
	}

	private loadTextEditorViewState(resource: URI) {
		const memento = this.getMemento(this.storageService, Scope.WORKSPACE);
		const editorViewStateMemento: { [key: string]: IWalkThroughEditorViewStates } = memento[WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY];
		if (editorViewStateMemento) {
			const fileViewState = editorViewStateMemento[resource.toString()];
			if (fileViewState) {
				const state = fileViewState[this.position];
				if (state) {
					this.scrollbar.setScrollPosition(state.viewState);
				}
			}
		}
	}

	public clearInput(): void {
		if (this.input instanceof IssueReporterInput) {
			this.saveTextEditorViewState(this.input.getResource());
		}
		super.clearInput();
	}

	public shutdown(): void {
		if (this.input instanceof IssueReporterInput) {
			this.saveTextEditorViewState(this.input.getResource());
		}
		super.shutdown();
	}

	dispose(): void {
		this.editorFocus.reset();
		this.contentDisposables = dispose(this.contentDisposables);
		this.disposables = dispose(this.disposables);
		super.dispose();
	}
}

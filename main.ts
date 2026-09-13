import {Editor, EventRef, MarkdownView, Plugin, TAbstractFile, TFile} from 'obsidian';

const DONE_TODO_REGEX = /(^|\n)\t*- \[x\].*?(?=\n|$)/g;
const SCRAPPED_TODO_REGEX = /(^|\n)\t*- \[-\].*?(?=\n|$)/g;
const ALL_CLOSED_TODO_REGEX = /(^|\n)\t*- \[(x|-)\].*?(?=\n|$)/g;

const TODO_TEXTS = {
	clearSelection: "Clear todos in selection or current file",
	clearFile: "Clear todos in file",
	move: "Move completed TODOs to the bottom"
}
const CLEAR_TODO_ICON = "check-check"
const CLEAR_COMMAND_ID = "clear-todos"
const MOVE_COMMAND_ID = "move-todos"

enum ModificationAction {
	Clear,
	Move,
}


export default class ClearTodosPlugin extends Plugin {
	private editorMenuEvent: EventRef;
	private fileMenuEvent: EventRef;

	private actionHandlers: Record<ModificationAction, (s: string) => string> = {
		[ModificationAction.Clear]:this.clearTodoString,
		[ModificationAction.Move]:this.moveTodoDown,
	}


	async onload() {

		// Commands (mappable to hotkey)
		this.addCommand({
			id: CLEAR_COMMAND_ID,
			name: TODO_TEXTS.clearSelection,
			editorCallback: (_editor: Editor, view: MarkdownView) => {
				this.modifyTodosInSelectionAndFallBackToFile(view,ModificationAction.Clear)
			},
			icon: CLEAR_TODO_ICON
		});
		this.addCommand({
			id: MOVE_COMMAND_ID,
			name: TODO_TEXTS.move,
			editorCallback: (_editor: Editor, view: MarkdownView) => {
				this.modifyTodosInSelectionAndFallBackToFile(view,ModificationAction.Move)
			},
			icon: CLEAR_TODO_ICON
		});

		// Editor Menu events (3 dots in the top right)
		this.editorMenuEvent = this.app.workspace.on("editor-menu", (menu) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView)
			if(!view) {
				console.error("Clear Todos: No active MarkdownView found")
				return
			}
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.clearSelection)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() => this.modifyTodosInSelectionAndFallBackToFile(view,ModificationAction.Clear))
			)
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.move)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() => this.modifyTodosInSelectionAndFallBackToFile(view,ModificationAction.Move))
			)
		})

		// File Menu Events (right click on file's card)
		this.fileMenuEvent = this.app.workspace.on("file-menu", (menu, file) => {
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.clearFile)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() => this.clearTodosForFile(file,ModificationAction.Clear))
			)
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.move)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() => this.clearTodosForFile(file,ModificationAction.Move))
			)
		})
	}

	onunload() {
		super.onunload();
		this.removeCommand(CLEAR_COMMAND_ID);
		this.app.workspace.offref(this.editorMenuEvent);
		this.app.workspace.offref(this.fileMenuEvent);
	}

	private async clearTodosForFile(file: TAbstractFile,action:ModificationAction) {
		if(!(file instanceof TFile)) return
		const fileContent = await file.vault.read(file)
		await file.vault.modify(file, this.actionHandlers[action](fileContent))
	}

	private modifyTodosInSelectionAndFallBackToFile(view: MarkdownView, action: ModificationAction) {
		const selection:string = view.editor?.getSelection();
		if (selection) {
			return view.editor.replaceSelection(this.actionHandlers[action](selection))
		}
		return view.setViewData(this.actionHandlers[action](view.data), false)
	}

	private clearTodoString(todoString: string) : string{
		return todoString.replace(ALL_CLOSED_TODO_REGEX, "")
	}

	private moveTodoDown(rawText: string): string {
		console.log("this is in fact the new version");
		// split to list of lines
		const done = rawText.matchAll(DONE_TODO_REGEX)
		const scrapped = rawText.matchAll(SCRAPPED_TODO_REGEX)
		let output = rawText.replace(ALL_CLOSED_TODO_REGEX, "")
		for (const hit of done)
		{
			// TODO might remove line break for last hit
			hit.slice(0,-2)
			output += hit;
		}
		output+="***"
		for (const hit of scrapped)
		{
			// TODO might remove line break for last hit
			output += hit;
		}
		return output
	}
}

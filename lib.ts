const DONE_TODO_REGEX = /(^|\n)\t*- \[x\].*?(?=\n|$)/g;
const SCRAPPED_TODO_REGEX = /(^|\n)\t*- \[-\].*?(?=\n|$)/g;
const DONE_TODO_REGEX_WITH_END_LINEBREAK = /\t*- \[x\].*(\n|$)/g;
const SCRAPPED_TODO_REGEX_WITH_END_LINEBREAK = /\t*- \[-\].*(\n|$)/g;
const ALL_CLOSED_TODO_REGEX = /(^|\n)\t*- \[(x|-)\].*?(?=\n|$)/g;
const DONE_TODO_REGEX_WITH_LINEBREAK = /(^|\n)\t*- \[x\].*(\n|$)/g;
const SCRAPPED_TODO_REGEX_WITH_LINEBREAK = /(^|\n)\t*- \[-\].*(\n|$)/g;
const ALL_CLOSED_TODO_REGEX_WITH_END_LINEBREAK = /\t*- \[(x|-)\].*(\n|$)/g; // todo doesnt hit start of file
const ALL_CLOSED_TODO_REGEX_WITH_LINEBREAK = /(^|\n)\t*- \[(x|-)\].*(\n|$)/g; // todo doesnt hit start of file

export function clearTodo(todoString: string): string {
	return todoString.replace(ALL_CLOSED_TODO_REGEX, "");
}
export function moveTodoDown(rawText: string): string {
	// in case last line has to be moved up (every line keeps the line break at its end)
	rawText += "\n";
	// split to list of lines
	const done = rawText.match(DONE_TODO_REGEX_WITH_END_LINEBREAK);
	const scrapped = rawText.match(SCRAPPED_TODO_REGEX_WITH_END_LINEBREAK);
	let output = rawText.replace(ALL_CLOSED_TODO_REGEX_WITH_END_LINEBREAK, "");

	if (done != null) {
		const doneString = done.join("");
		output += doneString;
	}
	if (scrapped != null) {
		const scrappedString = scrapped.join("");
		output += scrappedString;
	}
	// remove last line's linebreak again (either the one we added or from another line that has been moved down)
	output = output.substring(0, output.length - 1);
	return output;
}

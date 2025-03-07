const readline = require('readline');

const commandLinePrompt = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: '> '
});

const tasks = [];

/*
		const emptyResult = false;
		const result = [];
		line = line.trim();
		if (line.charAt(0) !== '/'){
			return emptyResult;
		}

		// Split the line on '
		// Check to see if there is an escape sequence in there
		// If there is, connect the two items back together

		// Anything which does not fall into one of those groups can be split on spaces
		let splitLine = line.split(' ');
		splitLine[0] = splitLine[0].slice(1);

		return splitLine;
		return emptyResult;
*/

const TodoLibrary = {
	todoIDGlobal: 1,
	todos: [],
	newTodo(mergeIn={}){
		return {
			id: this.todoIDGlobal++,
			title: mergeIn.title,
			estimatedTime: mergeIn.estimatedTime || 0,
			completedTime: mergeIn.completedTime || 0,
		};
	},
	addTodoToLibrary(title, estimatedTime=15){
		console.log(`todolib: adding todo:: ${title}, ${estimatedTime}`);
		this.todos.push(
			this.newTodo({title, estimatedTime})
		);
	},

	printAsList(){
		console.log(`id\ttitle`);
		this.todos.forEach(todo => {
			console.log(`${todo.id}\t${todo.title}`);
		});
	}
};

class TodoCommand {}
TodoCommand.lineToCommand = function(line){
		const emptyResult = false;
		const result = [];
		if (line.indexOf('/todo ') !== 0){
			return emptyResult;
		}

		// Scrape off the beginning and check for parameters
		line = line.slice(6);

		if (
			line.indexOf('-a ') === 0
			|| line.indexOf('--add ') === 0
		){
			// Check for the "end of title" marker
			let lineSplitOnMarker = line.split('; ');
			if (lineSplitOnMarker.length > 1){
				let title = lineSplitOnMarker[0].slice(lineSplitOnMarker[0].indexOf(' ') + 1);
				let estimatedTime = lineSplitOnMarker[1];
				TodoLibrary.addTodoToLibrary(title, estimatedTime);
			} else {
				let title = lineSplitOnMarker[0].slice(lineSplitOnMarker[0].indexOf(' ') + 1);
				TodoLibrary.addTodoToLibrary(title);
			}
			return true;

		} else if (
			line.indexOf('-e ') === 0
			|| line.indexOf('--edit ') === 0
		){

		} else if (
			line.indexOf('-s ') === 0
			|| line.indexOf('--show ') === 0
		){

		} else if (
			line.indexOf('-t ') === 0
			|| line.indexOf('--time ') === 0
		){

		} else if (
			line.indexOf('-c ') === 0
			|| line.indexOf('--connect ') === 0
		){

		} else {
			return emptyResult;
		}
		return emptyResult;
};

class ListCommand {}
ListCommand.lineToCommand = function(line){
		const emptyResult = false;
		const result = [];
		if (line.indexOf('/list') !== 0){
			return emptyResult;
		}
		TodoLibrary.printAsList();
		return true;
};

class ExitCommand {}
ExitCommand.lineToCommand = function(line){
		const emptyResult = false;
		const result = [];
		if (line.indexOf('/exit') !== 0){
			return emptyResult;
		}

		process.exit();
};

class LineProcessor {}
LineProcessor.processLineToCommand = function(line){
	if (TodoCommand.lineToCommand(line)){
		return true;
	} else if (ListCommand.lineToCommand(line)){
		return true;
	} else if (ExitCommand.lineToCommand(line)){
		return true;
	}
	return false;
};

commandLinePrompt.prompt();

commandLinePrompt.on('line', (line) => {
	let processedCommand = LineProcessor.processLineToCommand(line.trim());

	if (!processedCommand){
		console.log('Invalid Command');
	}
	commandLinePrompt.prompt();
});

commandLinePrompt.on('close', () => {
	process.exit(0);
});


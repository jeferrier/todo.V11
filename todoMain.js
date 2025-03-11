import fs from 'fs';
import readline from 'readline';

const commandLinePrompt = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: '> '
});

const tasks = [];

const util = {
	clone(objectToCopy){
		let result = {};
		if (typeof objectToCopy === 'string'){
			return '' + objectToCopy;
		} else if (typeof objectToCopy === 'number'){
			return +objectToCopy;
		} else if (typeof objectToCopy === 'function'){
			return objectToCopy;
		} else if (Array.isArray(objectToCopy)){
			let newArray = [];
			objectToCopy.forEach(item => {
				newArray.push(this.clone(item));
			});
			return newArray;
		} else {
			for (const [key, value] of Object.entries(objectToCopy)){
				result[key] = this.clone(value);
			}
		}
		return result;
	},

	tabifyForTablePrint(arrayOfArrays){
		let columnLengths = [];
		arrayOfArrays.forEach(array => {
			for (let a = 0; a < array.length; a++){
				array[a] = '' + array[a];
				if (columnLengths[a] === undefined){
					columnLengths[a] = 0;
				}
				if (columnLengths[a] < array[a].length){
					columnLengths[a] = array[a].length;
				}
			}
		});
		arrayOfArrays.forEach(array => {
			for (let a = 0; a < array.length - 1; a++){
				let thisColumnLengthInTabs = Math.floor(columnLengths[a] / 8) + 1;
				let arrayColumnLengthInTabs = Math.floor(array[a].length / 8);
				for (let b = 0; b < thisColumnLengthInTabs - arrayColumnLengthInTabs; b++){
					array[a] = array[a] + '\t';
				}
			}
		});
		for (let a = 0; a < arrayOfArrays.length; a++){
			arrayOfArrays[a] = arrayOfArrays[a].join('');
		}
		return arrayOfArrays.join('\n');
	},

	dateStampMessage(message){
		let daysOfTheWeek = [
			'S', 'M', 'T', 'W', 'R', 'F', 'A'
		];
		let now = new Date();
		let years = '' + now.getFullYear();
		let months = '' + (now.getMonth() + 1);
		let days = '' + now.getDate();
		let hours = '' + now.getHours();
		let minutes = '' + now.getMinutes();

		while (months.length < 2){
			months = '0' + months;
		}
		while (days.length < 2){
			days = '0' + days;
		}
		while (hours.length < 2){
			hours = '0' + hours;
		}
		while (minutes.length < 2){
			minutes = '0' + minutes;
		}
		return `[${years}-${months}-${days}-${daysOfTheWeek[now.getDay()]}|${hours}:${minutes}] ${message}`;
	}
};

// The main tool for working with the todo storage
const TodoLibrary = {
	todoIDGlobal: 1,
	todos: [],

	addTodoToLibrary(title, estimatedTime=15){
		let newTodo = this.newTodo({title, estimatedTime});
		this.todos.push(newTodo);
		return newTodo;
	},
	deleteTodoFromLibrary(todoId){
		let newTodos = [];
		this.todos.forEach(todoItem => {
			if (todoItem.id !== todoId){
				newTodos.push(todoItem);
			}
			if (todoItem.childs.length > 0){
				newChilds = [];
				todoItem.childs.forEach(childTodoId => {
					if (childTodoId !== todoId){
						newChilds.push(childTodoId);
					}
				});
				todoItem.childs = newChilds;
			}
		});
		this.todos = newTodos;
	},
	getTodoById(todoId){
		let foundTodo = undefined;
		this.todos.forEach(todoItem => {
			if (foundTodo){
				return;
			}
			if (todoItem.id == todoId){
				foundTodo = todoItem;
			}
		});
		return foundTodo;
	},

	printAsList(todo){
		let table = [
			['id', 'S title', 'Estimated', 'Completed', 'Remaining']
		];
		if (todo){
			table.push([
				todo.id, todo.title, todo.estimatedTime, todo.completedTime, Math.max(0, todo.estimatedTime - todo.completedTime)
			]);
		} else {
			this.todos.forEach(todo => {
				let title = todo.title;
				if (todo.id === ProgramState.trackingTodoId){
					title = '* ' + title;
				} else {
					title = '  ' + title;
				}
				table.push([
					todo.id, title, todo.estimatedTime, todo.completedTime, Math.max(0, todo.estimatedTime - todo.completedTime)
				]);
			});
		}
		console.log(util.tabifyForTablePrint(table));
	},
	// Descending is an internal-only variable that indicates if the function was called by this utility
	// or otherwise
	printAsTree(todo, descending=false){
		let table = [];

		// When we ARE top level
		if (!descending){
			// Mark ALL todos untouched
			// This will allow us to show each todo only one time in the tree view
			this.todos.forEach(todo => {
				todo.touched = false;
			});
			// Add a header row for the first todo only
			// (It'll be a bit off anyways).
			table.push(
				['id', 'title', 'Estimated', 'Completed', 'Remaining']
			);
		}

		if (todo && !todo.touched){
			todo.touched = true;
			// Add this todo
			table.push([
				todo.id, todo.title, todo.estimatedTime, todo.completedTime, Math.max(0, todo.estimatedTime - todo.completedTime)
			]);
			// Add any untouched children
			// NOTE: If a todo is a child of multiple todos, that could cause issues with not showing nesting properly
			todo.childs.forEach(todoChildItemId => {
				let foundChildTodo = this.getTodoById(todoChildItemId);
				if (foundChildTodo.touched){
					return;
				}
				let childTodoTable = this.printAsTree(foundChildTodo, true);
				childTodoTable.forEach(childTodoArray => {
					table.push(['->', ...childTodoArray]);
				});
			});
		} else {
			this.todos.forEach(todo => {
				if (todo.touched){
					return;
				}
				todo.touched = true;
				table.push([
					todo.id, todo.title, todo.estimatedTime, todo.completedTime, Math.max(0, todo.estimatedTime - todo.completedTime)
				]);
				todo.childs.forEach(todoChildItemId => {
					let foundChildTodo = this.getTodoById(todoChildItemId);
					if (foundChildTodo.touched){
						return;
					}
					let childTodoTable = this.printAsTree(foundChildTodo, true);
					childTodoTable.forEach(childTodoArray => {
						table.push(['->', ...childTodoArray]);
					});
				});
			});
		}

		// When we ARE top level
		if (!descending){
			// Now that we've finished, clear all touched markers
			this.todos.forEach(todo => {
				delete todo.touched;
			});
			console.log(util.tabifyForTablePrint(table));
		} else {
			return table;
		}
	},

	newTodo(mergeIn={}){
		// id first
		if (mergeIn.id){
			mergeIn.id = +mergeIn.id;
		} else {
			mergeIn.id = 0;
		}
		if (mergeIn.id >= this.todoIDGlobal){
			this.todoIDGlobal = mergeIn.id + 1;
		}

		// now the estimates
		if (mergeIn.estimatedTime){
			mergeIn.estimatedTime = +mergeIn.estimatedTime;
		} else {
			mergeIn.estimatedTime = 0;
		}
		if (mergeIn.completedTime){
			mergeIn.completedTime = +mergeIn.completedTime;
		} else {
			mergeIn.completedTime = 0;
		}
		return {
			id: mergeIn.id || this.todoIDGlobal++,
			title: mergeIn.title,
			estimatedTime: mergeIn.estimatedTime || 0,
			completedTime: mergeIn.completedTime || 0,
			notes: mergeIn.notes || [],
			childs: mergeIn.childs || [],
		};
	},
	loadTodos(){
		let rawContents = '';
		try {
			rawContents = fs.readFileSync('todo-store.txt', 'utf8');
		} catch (error){
			console.log('\n!!! - Todo Store file does not exist. Please create todo-store.txt and restart the program.');
			process.exit();
		}

		const contentLines = rawContents.split('\n');
		contentLines.forEach(contentLine => {
			if (contentLine !== ''){
				let parsedLine = JSON.parse(contentLine);
				this.todos.push(this.newTodo(parsedLine));
			}
		});
	},
	saveTodos(){
		// Pre-process IDs so that we can repopulate them later
		let newIdGlobal = 1;
		let saveableTodos = [];
		let idToNewIDMap = {};

		// Add all IDs we encounter to this map
		// Later, we'll use this map to replace all IDs in the output
		// The net effect is that the final list will have IDs which are contiguous and starting at 1
		this.todos.forEach(todoItem => {
			idToNewIDMap[todoItem.id] = newIdGlobal++;
		});
		this.todos.forEach(todoItem => {
			let copiedTodoItem = util.clone(todoItem);
			let newChilds = [];

			// Copy todos before we write them so we don't mess with the ids of the LIVE todos
			copiedTodoItem.id = idToNewIDMap[copiedTodoItem.id];
			copiedTodoItem.childs.forEach(childId => {
				newChilds.push(idToNewIDMap[childId]);
			});
			copiedTodoItem.childs = newChilds;
			saveableTodos.push(copiedTodoItem);
		});
		// Finally turn everything into strings before jamming it into the file
		for (let a = 0; a < saveableTodos.length; a++){
			saveableTodos[a] = JSON.stringify(saveableTodos[a]);
		}
		fs.writeFileSync('todo-store.txt', saveableTodos.join('\n'), 'utf8');
	},
};

// A tool for keeping track of 'stately' behavior in the tool
const ProgramState = {
	trackingTodoId: undefined,
	trackingInterval: undefined,
	startTracking(todoId){
		let foundTodo = TodoLibrary.getTodoById(todoId);
		if (foundTodo){
			this.trackingTodoId = todoId;
			this.trackingInterval = setInterval(() => {
				foundTodo.completedTime += 1;
			}, 60000);
		}
	},
	endTracking(){
		this.trackingTodoId = undefined;
		clearInterval(this.trackingInterval);
		this.trackingInterval = undefined;
	},

	notesTodo: undefined,
	notesTodoId: undefined,
	notesModeActive: false,
	startNotes(todoId){
		let foundTodo = TodoLibrary.getTodoById(todoId);
		if (foundTodo){
			this.notesTodo = foundTodo;
			this.notesTodoId = todoId;
			this.notesModeActive = true;
			commandLinePrompt.setPrompt('" ');
		}
	},
	endNotes(){
		this.notesTodo = undefined;
		this.notesTodoId = undefined;
		this.notesModeActive = false;
		commandLinePrompt.setPrompt('> ');
	},
	inNotesMode(){
		return this.notesModeActive;
	}
};

// Command definitions
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
				let newTodo = TodoLibrary.addTodoToLibrary(title, estimatedTime);
				TodoLibrary.printAsList(newTodo);
			} else {
				let title = lineSplitOnMarker[0].slice(lineSplitOnMarker[0].indexOf(' ') + 1);
				let newTodo = TodoLibrary.addTodoToLibrary(title);
				TodoLibrary.printAsList(newTodo);
			}
			return true;

		} else if (
			line.indexOf('-e ') === 0
			|| line.indexOf('--edit ') === 0
		){
			// Check for the "end of title" marker
			let lineSplitOnMarker = line.split('; ');
			if (lineSplitOnMarker.length > 1){
				let titlePart = lineSplitOnMarker[0].slice(lineSplitOnMarker[0].indexOf(' ') + 1);
				let todoID = +titlePart.split(' ')[0];
				let title = titlePart.split(' ')[1];
				let estimatedTime = lineSplitOnMarker[1];
				let foundTodo = TodoLibrary.getTodoById(todoID);
				foundTodo.title = title;
				foundTodo.estimatedTime = estimatedTime;
				TodoLibrary.printAsList(foundTodo);
			} else {
				let titlePart = lineSplitOnMarker[0].slice(lineSplitOnMarker[0].indexOf(' ') + 1);
				let todoID = +titlePart.split(' ')[0];
				let title = titlePart.split(' ')[1];
				let foundTodo = TodoLibrary.getTodoById(todoID);
				foundTodo.title = title;
				TodoLibrary.printAsList(foundTodo);
			}
			return true;

		} else if (
			line.indexOf('-s ') === 0
			|| line.indexOf('--show ') === 0
		){
			let lineSplitOnMarker = line.split(' ');
			let todoID = +lineSplitOnMarker[1];
			let foundTodo = TodoLibrary.getTodoById(todoID);
			TodoLibrary.printAsTree(foundTodo);
			if (foundTodo.notes.length > 0){
				console.log('');
				console.log(foundTodo.notes.join('\n'));
			}
			return true;

		} else if (
			line.indexOf('-t ') === 0
			|| line.indexOf('--time ') === 0
		){
			let lineSplitOnMarker = line.split(' ');
			let todoID = +lineSplitOnMarker[1];
			let newCompleted = +lineSplitOnMarker[2];
			let foundTodo = TodoLibrary.getTodoById(todoID);
			foundTodo.completedTime = newCompleted;
			TodoLibrary.printAsList(foundTodo);
			return true;

		} else if (
			line.indexOf('-c ') === 0
			|| line.indexOf('--connect ') === 0
		){
			let lineSplitOnMarker = line.split(' ');
			let parentTodoId = +lineSplitOnMarker[1];
			let childTodoId = +lineSplitOnMarker[2];
			let foundTodo = TodoLibrary.getTodoById(parentTodoId);
			foundTodo.childs.push(childTodoId);
			TodoLibrary.printAsTree(foundTodo);
			return true;

		} else if (
			line.indexOf('-D ') === 0
			|| line.indexOf('--delete ') === 0
		){
			let lineSplitOnMarker = line.split(' ');
			let todoID = +lineSplitOnMarker[1];
			let foundTodo = TodoLibrary.getTodoById(todoID);
			TodoLibrary.deleteTodoFromLibrary(foundTodo.id);
			TodoLibrary.printAsTree();
			return true;

		} else {
			return emptyResult;
		}
		return emptyResult;
};

class TrackCommand {}
TrackCommand.lineToCommand = function(line){
		const emptyResult = false;
		const result = [];
		if (line.indexOf('/track') !== 0){
			return emptyResult;
		}

		let linePieces = line.split(' ');
		if (linePieces.length > 1){
			let todoId = +linePieces[1];
			ProgramState.startTracking(todoId);
		} else {
			ProgramState.endTracking();
		}
		return true;
};

// Notes mode
// Looking for `/notes`
// Other
// Looking for `/notes id`
class NotesCommand {}
NotesCommand.notesModeCommand = function(line){
		const emptyResult = false;
		const result = [];

		if (line.indexOf('/notes') === 0){
			ProgramState.endNotes();
		} else {
			let foundTodo = ProgramState.notesTodo;
			foundTodo.notes.push(
				util.dateStampMessage(line)
			);
		}
		return true;
};
NotesCommand.otherModeCommand = function(line){
		const emptyResult = false;
		const result = [];

		if (line.indexOf('/notes') !== 0){
			return emptyResult;
		}

		let linePieces = line.split(' ');
		if (linePieces.length > 1){
			let todoId = +linePieces[1];
			ProgramState.startNotes(todoId);
			return true;
		}
		return emptyResult;
};
NotesCommand.lineToCommand = function(line){
	if (ProgramState.inNotesMode()){
		return NotesCommand.notesModeCommand(line);
	}
	return NotesCommand.otherModeCommand(line);
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

class TreeCommand {}
TreeCommand.lineToCommand = function(line){
		const emptyResult = false;
		const result = [];
		if (line.indexOf('/tree') !== 0){
			return emptyResult;
		}
		TodoLibrary.printAsTree();
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
	if (ProgramState.inNotesMode()){
		if (NotesCommand.lineToCommand(line)){
			return true;
		}
		return false;
	} else {
		if (TodoCommand.lineToCommand(line)){
			return true;
		} else if (TrackCommand.lineToCommand(line)){
			return true;
		} else if (NotesCommand.lineToCommand(line)){
			return true;
		} else if (ListCommand.lineToCommand(line)){
			return true;
		} else if (TreeCommand.lineToCommand(line)){
			return true;
		} else if (ExitCommand.lineToCommand(line)){
			return true;
		}
		return false;
	}
};

TodoLibrary.loadTodos();
setInterval(() => {
	TodoLibrary.saveTodos();
},
5000);
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


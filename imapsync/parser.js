const fs = require('fs');
const { EventEmitter } = require('events');

// const stdout = fs.createReadStream('../../logs/migra-licita-2020-06-03T09:15:18-03:00.log');

const regexps = {
    'folder-changed': /Folder.*?(?<current>[0-9]+)\/(?<folders>[0-9]+) \[(?<name>.*?)\]/,
    'folder-messages': /Host1: folder \[(?<folder>.*?)\] considering (?<messages>[0-9]+) messages/,
    'message-copied': /msg .* copied to .*/
};

module.exports = process => {
    const processMessage = (message, event) => {
	const regexp = regexps[event];

	const match = message.match(regexp);
	if (match) {
	    const state = Object.assign({}, match.groups);
	    parserEvents.emit(event, state);
	}

    };

    const readErrors = message => {
	if (message.match(/Listing [0-9]+ errors encountered during the sync/))
	    return error.push(message);

	if (message.match(/Err [0-9]+\/[0-9]+:/))
	    return error.push(message);

	if (message.match(/aExiting with return value [0-9]+/))
	    return error.push(message);
    };

    // Parser EventEmitter
    const parserEvents = new EventEmitter();
    let error = [];
    let output = [];

    // Initial state
    const state = {
	folder: {},
	maxProgress: 0,
	folderMessages: { total: 0, current: 0 },

	reportedFolderProgress: 0,
	reportedProgress: 0,

	folderProgress: 0,
	progress: 0
    };

    // Process Event Handlers
    process.on('close', code => {
	// console.log('Finishing with code', code, error.join('\n'));
	if (code == 0)
	    parserEvents.emit('done', { code, output });
	else
	    parserEvents.emit('error', { code, error });
    });

    process.stdout.on('data', chunk => {
	const messages = chunk.toString().split('\n');
	output = output.concat(messages);

	let event = null;
	for (let message of messages) {
	    processMessage(message, 'folder-changed');
	    processMessage(message, 'folder-messages');
	    processMessage(message, 'message-copied');
	    readErrors(message);
	}
    });

    process.stderr.on('data', chunk => {
	const messages = chunk.toString().split('\n');
	error = error.concat(messages);
    })

    // Parser Internal Event Handlers - Updating State
    parserEvents.on('folder-changed', event => {
	parserEvents.emit('progress', state.maxProgress);
	state.folder = event;
	state.maxProgress = event.current / event.folders * 100;

	// Reset calculated states for folder;
	state.folderMessages = { total: 0, current: 0};
	state.reportedFolderProgress = state.folderProgress = 0
    });

    parserEvents.on('folder-messages', event => {
	state.folderMessages = { total: parseInt(event.messages), current: 0 };
    });

    parserEvents.on('message-copied', () => {
	const prevFolderProgress = state.reportedFolderProgress;

	state.folderMessages.current += 1;
	state.folderProgress = state.folderMessages.current / state.folderMessages.total;

	if (state.folderProgress - prevFolderProgress >= 0.1) {
	    state.reportedFolderProgress = state.folderProgress;
	    parserEvents.emit('folder-progress', { name: state.folder.name, progress: state.folderProgress });
	}
    });

    // Parser Internal Event Handlers - Progress Events
    parserEvents.on('folder-progress', event => {
	const prevProgress = state.reportedProgress;

	state.progress = event.progress * state.maxProgress;

	// console.log('Overall Progress Check:', state.progress, prevProgress, state.progress - prevProgress)
	if (state.progress - prevProgress >= 3) {
	    state.reportedProgress = state.progress;
    	    parserEvents.emit('progress', state.progress);
	}
	// console.log('Folder Progress', event);
    });

    // parserEvents.on('progress', progress => {
    // 	console.log('Overall Progress:', job.data, progress);
    // });

    return parserEvents;
};

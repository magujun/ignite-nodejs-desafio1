/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const users = [];

app.use(cors());
app.use(express.json());

/**
 * username = string
 * name = string
 * id = uuid
 * todos = []
 */

// Middleware check user
function checkExistsUserAccount(request, response, next) {
	const { username } = request.headers;
	const user = users.find(user => user.username === username);
	if(!user) {
		return response.status(404).json({ error: 'Username not found!' });
	}
	request.user = user;
	return next();
}

app.post('/users', (request, response) => {
	const { username, name } = request.body;
	const userAlreadyExists = users.some((user) => user.username === username);
	if(userAlreadyExists) {
		return response.status(400).json({ error: 'Username already exists!' });
	}
	const user = {
		id: uuidv4(),
		name,
		username,
		todos: []
	};
	users.push(user);
	return response.status(201).json(user);
	// return response.status(201).json({ message: 'User ' + name + ' succesfully created with username ' + username });
});

// Use middleware check for all routes
// app.use(checkExistsUserAccount);

app.get('/todos', checkExistsUserAccount, (request, response) => {
	const { user } = request;
	const username = user.username;
	// const title = user.title;
	if(user.todos == []) {
		return response.status(400).json({ error: 'No toDos found for user ' + username + '!' });
	} else {
		return response.json(user.todos);
		// return response.json({message: 'Task ' + title + ' created for user ' + username + ' with deadline ' + deadline});
	}
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
	const { user } = request;
	const { title, deadline } = request.body;
	// const username = user.username;
	const todoTask = {
		id: uuidv4(),
		title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date() 
	};
	user.todos.push(todoTask);
	// return response.status(201).json({ message: 'Task ' + title + ' created for user ' + username + ' with deadline ' + deadline + '!' }).send();
	return response.status(201).json(todoTask);
});

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todoUpdate = request.body;
	const todo = user.todos.find(todo => todo.id === id);
	if(!todo) {
		return response.status(404).json({ error: 'Task not found!' });
	}
	todo.title = todoUpdate.title;
	todo.deadline = new Date(todoUpdate.deadline);
	// return response.json({message: 'Task "' + todo.title + '" updated!'}).send();
	return response.json(todo);
});

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todo = user.todos.find(todo => todo.id === id);
	if(!todo) {
		return response.status(404).json({ error: 'Task not found!' });
	}
	// const status = request.query;
	// const done = status.done ? (status.done.toLowerCase() == 'true') : false;
	// if(done === true && todo.done === done) {
	// 	return response.status(404).json({ error: 'Task already completed!'});
	// }
	// if(done === false && todo.done === done) {
	// 	return response.status(404).json({ error: 'Task still pending!' });
	// }
	const done = true;
	todo.done = done;
	// const state = 'task pending!';
	// if(done === true) { const state = 'task completed!'; }
	// return response.json({ message: todo.title + ' status updated: ' + state }).send();
	return response.json(todo);
});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todoIndex = user.todos.findIndex(todo => todo.id === id);
	if(todoIndex === -1) {
		return response.status(404).json({ error: 'Task not found!' });
	}
	user.todos.splice(todoIndex, 1);
	// return response.status(204).json({ message: 'Task "' + todo.title + '" deleted!' }).send();
	return response.status(204).json();
});

module.exports = app;
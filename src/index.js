/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const users = [];
// const todoUpdate = [];

app.use(cors());
app.use(express.json());

/**
 * username = string
 * name = string
 * id = uuid
 * todos = []
 */

// Middleware check user & todos
function checkIfUserExists(request, response, next) {
	const { username } = request.headers;
	const user = users.find((user) => user.username === username);
	if (!user) {
		return response.status(400).json({ error: 'Username not found!' });
	}
	request.user = user;
	return next();
}

app.post('/users', (request, response) => {
	const { username, name } = request.body;
	const userAlreadyExists = users.some((user) => user.username === username);
	if (userAlreadyExists) {
		return response.status(400).json({ error: 'Username already exists!' });
	}
	users.push({
		id: uuidv4(),
		username,
		name,
		todos: []
	});
	return response.status(201).json({ message: 'User ' + name + ' succesfully created with username ' + username });
});

// Use middleware check for all routes
app.use(checkIfUserExists);

app.post('/todos', (request, response) => {
	const { title, description, deadline } = request.body;
	const { user } = request;
	const username = user.username;
	const todoTask = {
		title,
		description,
		deadline: new Date(deadline),
		id: uuidv4(),
		created_at: new Date(),
		done: false
	};
	user.todos.push(todoTask);
	return response.status(201).json({ message: 'Task ' + title + ' created for user ' + username + ' with deadline ' + deadline + '!' }).send();
});

app.get('/todos', (request, response) => {
	const { user } = request;
	const username = user.username;
	if (user.todos == []) {
		return response.status(400).json({ error: 'No toDos found for user ' + username + '!' });
	} else {
		return response.json((user.todos));
	}
});

app.put('/todos/:id', (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todoUpdate = request.body;
	const todo = user.todos.find(todo => todo.id === id);
	if (!todo) {
		return response.status(404).json({ error: 'Task not found!' });
	}
	todo.title = todoUpdate.title;
	todo.description = todoUpdate.description;
	todo.deadline = new Date(todoUpdate.deadline);
	return response.json({message: 'Task "' + todo.title + '" updated!'}).send();
});

app.patch('/todos/:id', (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const status = request.query;
	const todo = user.todos.find(todo => todo.id === id);
	if (!todo) {
		return response.status(404).json({ error: 'Task not found!' });
	}
	const done = status.done ? (status.done.toLowerCase() == 'true') : false;
	if (done === true && todo.done === done) {
		return response.status(400).json({ error: 'Task already completed!'});
	}
	if (done === false && todo.done === done) {
		return response.status(400).json({ error: 'Task still pending!' });
	}
	todo.done = done;
	const state = 'task pending!';
	if(done === true) { const state = 'task completed!'; }
	return response.json({message: todo.title + ' status updated: ' + state }).send();
});

app.delete('/todos/:id', (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const todo = user.todos.find(todo => todo.id === id);
	const todoIndex = user.todos.findIndex(todo => todo.id === id);
	if (todoIndex === -1) {
		return response.status(404).json({ error: 'Task not found!' });
	}
	user.todos.splice(todoIndex, 1);
	return response.json({message: 'Task "' + todo.title + '" deleted!'}).send();
});

module.exports = app;
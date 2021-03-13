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

// Middleware check user & todos
function checkIfUserAccountExists(request, response, next) {
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
app.use(checkIfUserAccountExists);

app.post('/todos', (request, response) => {
	const { title, description, deadline, id } = request.body;
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
	if (!user.todos) {
		return response.json({ message: 'No todos found for user ' + username + '!' });
	} else {
		return response.json((user.todos));
	}
});

app.put('/todos/:id', (request, response) => {
	const { username } = request;
	const { todos } = request.body;
	todos.username = user;
	return response.status(201).json({message: 'Task' + title + ' updated'});
});

app.patch('/todos/:id/done', (request, response) => {
	// Complete aqui
});

app.delete('/todos/:id', (request, response) => {
	// Complete aqui
});

module.exports = app;
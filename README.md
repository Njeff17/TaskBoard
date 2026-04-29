# TaskBoard

A lightweight, full-stack team task management application. Users can register, log in, create projects, and manage tasks with statuses all from a clean UI.

## Tech Stack

Backend = Node.js + Express Minimal, flexible, and ideal for building JSON REST APIs quickly
ORM = Sequelize Prevents raw SQL injection; supports MySQL in prod and SQLite in-memory for testing
Database = MySQL Reliable relational DB well-suited to this data model
Auth = JWT (jsonwebtoken) Stateless — no session store needed; token is verified on every request
Passwords = bcryptjs Industry-standard adaptive hashing; cost factor 12
Validation = express-validator Declarative, per-field validation before logic runs
Tests = Jest + Supertest  Full HTTP integration tests with a single npm test command; SQLite keeps them DB-free      
Frontend = Vanilla HTML + CSS + ES Modules; clean modular structure with import/export      


## Step-by-step setup instructions

How to clone = open cmd (set project location, ex: cd Desktop) then type "git clone https://github.com/Njeff17/TaskBoard.git"
install dependencies = open project folder in text editor, then open new terminal, then type "cd backend" then type "npm install"
run the backend = open project folder in text editor, then open new terminal, then type "cd backend" then type "npm run dev"
run the frontend = open project folder in text editor, then open new terminal, then type "cd frontend" then type "npm run dev"
how to run tests = open project folder in text editor, then open new terminal, then type "cd backend" then type "npm test"

*Why JWT over sessions?* JWT is stateless — the server doesn't need to store session data, making the API horizontally scalable. The trade-off is that tokens cannot be individually revoked before expiry (noted in Limitations).

### Auth

POST = `/api/v1/auth/register` = `{ name, email, password }` = `{ token, user }` 
POST = `/api/v1/auth/login` = `{ email, password }` = `{ token, user }` 
POST = `/api/v1/auth/logout` = `{ message }` 
GET  = `/api/v1/auth/profile` = `{ user }` 
PATCH = `/api/v1/auth/profile` = `{ name }` = `{ user }`

### Projects

GET = `/api/v1/projects` List all own projects
POST = `/api/v1/projects` Create project `{ name, description? }`
GET = `/api/v1/projects/:id` Get single project
PATCH = `/api/v1/projects/:id` Rename / update description
DELETE = `/api/v1/projects/:id` Delete project (cascades tasks)


### Tasks

GET = `/api/v1/projects/:pid/tasks` List tasks (optional `?status=TODO`)
POST = `/api/v1/projects/:pid/tasks` Create task `{ title, description?, status?, dueDate? }`
GET = `/api/v1/projects/:pid/tasks/:tid` Get single task
PATCH = `/api/v1/projects/:pid/tasks/:tid` Update task fields
DELETE = `/api/v1/projects/:pid/tasks/:tid` Delete task


## Frontend Pages

- `/pages/login.html` → Log in
- `/pages/register.html` → Create account
- `/pages/projects.html` → Project list with search, create/edit/delete
- `/pages/project-detail.html?id=<id>` → Kanban board with task modals
- `/pages/profile.html` → View & update display name
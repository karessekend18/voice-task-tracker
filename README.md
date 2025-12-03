## Voice-Enabled Task Tracker

A full-stack voice-enabled task management application that allows users to create, manage, and track tasks using both manual input and voice commands. The app supports Kanban and List views, advanced filters, and full CRUD operations with persistent storage using MongoDB.

This project was built as part of an SDE hiring assignment to demonstrate frontend expertise, backend API design, database integration, and real-world UX workflows.
______________________________________________________

**🚀 Features**
**1. Core Task Management**

- Create, edit, delete tasks
- Status: Todo, In Progress, Done
- Priority: Low, Medium, High, Urgent
- Due date & time support
- Overdue task detection

**2. Views**

- Kanban board view (drag-and-drop)
- List view
- Board ↔ List toggle

**3. Filters & Search**

- Search by title & description
- Filter by status
- Filter by priority
- Filter by due date range
- Clear filters easily

**4. Voice-Enabled Task Creation**

- Start voice recording from browser
- Live speech-to-text transcript
- Smart parsing of:
  - Title
  - Priority
  - Status
  - Due date/time
  - Editable preview before saving
  - Voice transcript stored in database

**5. Data Persistence**

- MongoDB database
- RESTful API with Express & Mongoose
- Full CRUD support
- Pagination on task list

**6. UX & Reliability**

- Form validation
- Delete confirmation dialog
- Toast notifications for all actions
- Fully responsive UI (mobile, tablet, desktop)

_____________________________________________________________________

**🛠 Tech Stack**
**Frontend -**
React + TypeScript
Vite
Tailwind CSS

**Backend -**
Node.js
Express.js
MongoDB

____________________________________________________


**⚙️ Setup Instructions**
✅ Prerequisites

Node.js (v18+ recommended)

MongoDB (local or Atlas)

npm

🔹 1. Clone the repository
git clone <your-repo-url>
cd sde-voice-task-tracker

🔹 2. Backend Setup
cd backend
npm install


Create .env using the example:

cp .env.example .env


Run backend:

npm run dev


Backend runs on:

http://localhost:4000

🔹 3. Frontend Setup

From project root:

npm install


Create frontend .env:

cp .env.example .env


Run frontend:

npm run dev


Frontend runs on:

http://localhost:8080

________________________________________________________________________

**🔗 API Endpoints**
Method	Endpoint	Description
GET	/api/tasks	Get all tasks (paginated)
GET	/api/tasks/:id	Get single task
POST	/api/tasks	Create a task
PUT	/api/tasks/:id	Update a task
DELETE	/api/tasks/:id	Delete a task
POST	/api/tasks/upload	Upload voice note
__________________________________________________
**🎙 Voice Parsing Logic**

- Voice input is captured using the browser Speech Recognition API.
- The raw transcript is processed using a custom parser to extract:
  - Task title
  - Priority keywords (low, medium, high, urgent)
  - Status keywords (todo, in progress, done)
  - Date references (today, tomorrow, next Monday, etc.)
  - Users can edit parsed fields before saving, ensuring full control.

_________________________________________________________

**📌 Assumptions & Limitations**

- Voice input works best in Chrome or Edge.
- Speech recognition uses the browser’s built-in API.
- Date parsing is heuristic-based, not NLP-model based.
- No authentication is implemented (single-user system).
- Voice upload storage is supported but not required for core flow.
___________________________________________________

**✅ Testing**

This project was tested manually with:

- CRUD operations
- Voice task creation
- Overdue detection
- Filters & search
- Responsive behavior on different screen sizes
- Backend API testing via browser & Mongo shell

___________________________________

**🤖 Use of AI Tools**

AI tools (ChatGPT, Copilot) were used as a pair-programming assistant for:
API design planning
Code structure suggestions
All business logic, integrations, and final implementation decisions were made and verified manually.


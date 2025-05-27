# 📅 Custom Event Calendar

A dynamic, interactive event calendar built with **Vite + React.js** and **IndexedDB** for persistent event management. This project allows users to add, edit, delete, view, and reschedule events—including complex recurring events—with a modern, responsive UI and drag-and-drop support.

---

## 🚀 Live Demo

[View the deployed app on Vercel](https://custom-event-calendar-sepia.vercel.app/)

---

## 📝 Features

- **Monthly Calendar View**  
  - Classic grid with current day highlight and month navigation.

- **Event Management**
  - Add, edit, and delete events with details and recurrence.

- **Recurring Events**
  - Supports daily, weekly, monthly, and custom patterns.

- **Drag-and-Drop Rescheduling**
  - Move events by dragging; handles conflicts.

- **Conflict Management**
  - Detects and warns about overlapping events.

- **Data Persistence**
  - Events saved in IndexedDB, persistent across sessions.

- **Edge Case Handling**
  - Prevents adding events to past (completed) days.
  
---

## 🛠️ Tech Stack

- **Frontend:** React.js (with Vite)
- **State Management:** React hooks and context
- **Date Handling:** date-fns
- **Drag-and-Drop:** react-dnd & react-dnd-html5-backend
- **Persistence:** IndexedDB (custom implementation)
- **Deployment:** Vercel

---

## 📦 Installation & Setup

 - Clone the repository
```bash

git clone https://github.com/Nitheesha33/Custom-Event-Calendar.git
```

   This command copies the project repository from GitHub to your local machine.

 - Navigate to the project directory

```bash

cd Custom-Event-Calendar

```

   This command moves you into the project folder you just cloned.

 - Install dependencies

```bash

npm install

```

   This command installs all the required packages and dependencies needed for the project to run.

 - Start the development server

```bash

npm run dev

```

   This command launches the development server. You can now view and work on your app locally, usually at http://localhost:5173 or a similar address shown in your terminal.

### Required Dependencies

- `date-fns`
- `react-dnd`
- `react-dnd-html5-backend`

---

## 🖥️ Usage

- **Add an Event:**  
  Click on any day in the calendar to open the event form. Fill in the details and save.

- **Edit/Delete an Event:**  
  Click an event to open the edit form or delete it.

- **Recurring Events:**  
  Choose recurrence options in the event form for daily, weekly, monthly, or custom patterns.

- **Drag-and-Drop:**  
  Drag events to other days to reschedule. The app will warn you if there’s a conflict.

- **Persistence:**  
  All events are saved automatically in your browser.

---

Enjoy managing your schedule with the Custom Event Calendar!


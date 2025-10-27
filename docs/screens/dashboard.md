# Screen Description

Name: Dashboard
Route: /dashboard

## Description
The Dashboard is the central workspace for the current account’s tasks. It shows task cards scoped to the signed-in user’s active account in a clean, stacked layout with generous negative space. Users can quickly create new tasks, scan statuses at a glance, and perform common actions directly from each card.

Content is organized with simple filters for status (Active, Completed, Archived) and an optional search input to narrow by title or text. Cards display the task title, a concise status badge, a short excerpt of the description, and quick actions. The primary CTA “New Task” uses the brand color; most other actions are secondary or ghost buttons to maintain a minimal, light-hearted feel.

Tasks open to the Task Detail page for richer editing, previewing markdown, and sharing. The Dashboard focuses on efficient triage: adding, completing, archiving, removing, and downloading tasks as markdown files for offline reference or documentation.

## Actions
- Create a new task (primary CTA)
- Open a task to its detail page
- Mark a task as completed
- Archive a task to reduce dashboard clutter
- Remove a task
- Download a task as a markdown (.md) file
- Optional helpers:
  - Filter by status (Active, Completed, Archived)
  - Search tasks by title or text
  - Sort by last updated or created date

## Links
- /task/[task-id]: open a specific task’s detail page
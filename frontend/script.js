// IMPORTANT: Replace this with your actual Cloud Run backend URL
const API_URL = 'https://notex-backend-ze5vpdmr4q-uc.a.run.app';

const noteForm = document.getElementById('note-form');
const notesList = document.getElementById('notes-list');
const errorMessage = document.getElementById('error-message');

async function fetchNotes() {
    try {
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const notes = await response.json();
        displayNotes(notes);
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        errorMessage.textContent = 'Failed to load notes. Please check the API_URL and backend status.';
    }
}

function displayNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-item';

        const contentDiv = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = note.title; // Safely sets text
        const p = document.createElement('p');
        p.textContent = note.description; // Safely sets text

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.dataset.id = note.id;
        deleteButton.textContent = 'Delete';

        contentDiv.appendChild(strong);
        contentDiv.appendChild(p);
        li.appendChild(contentDiv);
        li.appendChild(deleteButton);
        notesList.appendChild(li);
    });
}

async function addNote(event) {
    event.preventDefault();
    const title = document.getElementById('note-title').value;
    const description = document.getElementById('note-description').value;

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description }),
        });
        if (!response.ok) throw new Error('Failed to add note');
        noteForm.reset();
        fetchNotes(); // Refresh the list
    } catch (error) {
        console.error('Failed to add note:', error);
        errorMessage.textContent = 'Failed to add note.';
    }
}

async function handleDelete(event) {
    if (!event.target.classList.contains('delete-btn')) return;
    const id = event.target.dataset.id;
    const deleteButton = event.target;

    // Provide user feedback
    deleteButton.textContent = 'Deleting...';
    deleteButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete note');
        fetchNotes(); // Refresh the list
    } catch (error) {
        console.error('Failed to delete note:', error);
        errorMessage.textContent = 'Failed to delete note.';
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    // A simple check to ensure the API_URL has been changed from a placeholder
    // and looks like a real URL before making a network request.
    if (API_URL && API_URL.startsWith('https')) {
        fetchNotes();
    } else {
        console.error("API_URL is not configured. Please edit script.js and set the backend URL.");
        errorMessage.textContent = 'Frontend is not configured to connect to the backend API.';
    }
    noteForm.addEventListener('submit', addNote);
    notesList.addEventListener('click', handleDelete);
});
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
        li.innerHTML = `
            <div>
                <strong>${note.title}</strong>
                <p>${note.description}</p>
            </div>
            <button class="delete-btn" data-id="${note.id}">Delete</button>
        `;
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
    if (!API_URL.includes('xxxxxxxxxx')) {
        fetchNotes();
    }
    noteForm.addEventListener('submit', addNote);
    notesList.addEventListener('click', handleDelete);
});
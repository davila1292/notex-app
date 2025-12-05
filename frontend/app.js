// --- IMPORTANT ---
// TODO: Replace this placeholder with the URL of your deployed Cloud Run service
const API_URL = 'https://notex-backend-338461806804.us-central1.run.app';

const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');
const noteTitle = document.getElementById('note-title');
const noteDescription = document.getElementById('note-description');

/**
 * Fetches all notes from the API and displays them.
 */
const fetchNotes = async () => {
    try {
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const notes = await response.json();

        // Clear existing notes
        notesContainer.innerHTML = '';

        if (notes.length === 0) {
            notesContainer.innerHTML = '<p>No notes yet. Add one above!</p>';
            return;
        }

        // Create and append a card for each note
        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.description}</p>
                <small>Created: ${new Date(note.createdAt).toLocaleString()}</small>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            `;
            notesContainer.appendChild(noteCard);
        });
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        notesContainer.innerHTML = '<p>Error loading notes. Please try again later.</p>';
    }
};

/**
 * Handles the form submission to create a new note.
 */
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newNote = {
        title: noteTitle.value,
        description: noteDescription.value,
    };

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newNote),
        });

        if (response.status === 201) {
            noteTitle.value = '';
            noteDescription.value = '';
            fetchNotes(); // Refresh the notes list
        } else {
            throw new Error('Failed to create note');
        }
    } catch (error) {
        console.error('Error creating note:', error);
        alert('Could not create the note. Please try again.');
    }
});

/**
 * Handles deleting a note when a delete button is clicked.
 */
notesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const noteId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this note?')) {
            await fetch(`${API_URL}/notes/${noteId}`, { method: 'DELETE' });
            fetchNotes(); // Refresh the list
        }
    }
});

// Initial fetch of notes when the page loads
document.addEventListener('DOMContentLoaded', fetchNotes);
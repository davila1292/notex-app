const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const firestore = new Firestore();
const notesCollection = firestore.collection('notes');

// GET /api/notes - Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const snapshot = await notesCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const notes = [];
    snapshot.forEach(doc => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).send('Error fetching notes');
  }
});

// GET /api/notes/:id - Get a single note by ID
app.get('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const noteDoc = await notesCollection.doc(noteId).get();
    if (!noteDoc.exists) {
      return res.status(404).send('Note not found');
    }
    res.status(200).json({ id: noteDoc.id, ...noteDoc.data() });
  } catch (error) {
    console.error(`Error fetching note ${req.params.id}:`, error);
    res.status(500).send('Error fetching note');
  }
});

// POST /api/notes - Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).send('Title is required');
    }

    const newNote = {
      title,
      description: description || '',
      createdAt: new Date(),
    };

    const docRef = await notesCollection.add(newNote);
    res.status(201).json({ id: docRef.id, ...newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).send('Error creating note');
  }
});

// PUT /api/notes/:id - Update a note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, description } = req.body;

    const noteRef = notesCollection.doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return res.status(404).send('Note not found');
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    await noteRef.update(updates);
    res.status(200).json({ id: noteId, ...updates });
  } catch (error) {
    console.error(`Error updating note ${req.params.id}:`, error);
    res.status(500).send('Error updating note');
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const noteRef = notesCollection.doc(noteId);

    if (!(await noteRef.get()).exists) {
      return res.status(404).send('Note not found');
    }

    await noteRef.delete();
    res.status(204).send(); // No content
  } catch (error) {
    console.error(`Error deleting note ${req.params.id}:`, error);
    res.status(500).send('Error deleting note');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
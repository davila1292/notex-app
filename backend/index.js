const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const cors = require('cors');

const app = express();
const firestore = new Firestore();

// --- CORS Configuration ---
// It's a security best practice to explicitly whitelist the origins that can
// access your API. We use an environment variable for the frontend URL.
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

const corsOptions = {
  origin: allowedOrigin,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(express.json()); // Parse JSON request bodies

// Collection reference
const notesCollection = firestore.collection('notes');

// --- API Endpoints ---

// GET all notes
app.get('/notes', async (req, res) => {
  try {
    const snapshot = await notesCollection.orderBy('createdAt', 'desc').get();
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).send('Error retrieving notes.');
  }
});

// GET a single note by ID
app.get('/notes/:id', async (req, res) => {
  try {
    const doc = await notesCollection.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Note not found.');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).send('Error retrieving note.');
  }
});

// POST a new note
app.post('/notes', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send('Title and description are required.');
    }

    const newNote = {
      title,
      description,
      createdAt: new Date().toISOString(), // Store as ISO string for consistency
      updatedAt: new Date().toISOString(),
    };

    const docRef = await notesCollection.add(newNote);
    res.status(201).json({ id: docRef.id, ...newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).send('Error creating note.');
  }
});

// PUT (update) an existing note
app.put('/notes/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.status(400).send('At least title or description is required for update.');
    }

    const updateData = { updatedAt: new Date().toISOString() };
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const noteRef = notesCollection.doc(req.params.id);
    await noteRef.update(updateData);

    const updatedDoc = await noteRef.get();
    res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).send('Error updating note.');
  }
});

// DELETE a note
app.delete('/notes/:id', async (req, res) => {
  try {
    await notesCollection.doc(req.params.id).delete();
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send('Error deleting note.');
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`NoteX Backend API listening on port ${PORT}`);
});
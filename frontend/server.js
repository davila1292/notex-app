const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const { Datastore } = require('@google-cloud/datastore');

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:8081', // For local development frontend
  'https://notex-frontend-338461806804.us-central1.run.app',
  'https://8081-cs-1027490199430-default.cs-us-east1-rtep.cloudshell.dev', // For Cloud Shell preview
  'https://8080-cs-1027490199430-default.cs-us-east1-rtep.cloudshell.dev' // Allow requests from the backend's own preview URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

const datastore = new Datastore();
const KIND = 'Note';

// --- API Routes ---

// Root endpoint to confirm the API is running
app.get('/', (req, res) => {
    res.status(200).send('NoteX Backend API is running.');
});

// Get all notes
app.get('/notes', async (req, res) => {
    const query = datastore.createQuery(KIND).order('createdAt', { descending: true });
    const [notes] = await datastore.runQuery(query);
    // Map the Datastore-specific ID to a more generic 'id' field
    const results = notes.map(note => {
        const noteKey = note[datastore.KEY];
        return { ...note, id: noteKey.id || noteKey.name };
    });
    res.json(results);
});

// Add a new note
app.post('/notes', async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).send('Title and description are required.');
    }

    const note = {
        key: datastore.key(KIND),
        data: {
            title,
            description,
            createdAt: new Date(),
        },
    };

    await datastore.save(note);
    res.status(201).send('Note created.');
});

// Delete a note
app.delete('/notes/:id', async (req, res) => {
    const { id } = req.params;
    // Datastore IDs are numbers, so we need to parse it
    const noteKey = datastore.key([KIND, parseInt(id, 10)]);
    await datastore.delete(noteKey);
    res.status(204).send(); // 204 No Content is standard for a successful delete
});

// --- Server Start ---

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
});

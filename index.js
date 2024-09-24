const express = require('express');
const compression = require('compression');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // To use environment variables

const app = express();
app.use(express.json());
app.use(compression());  // Enable compression

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db, collection, appointmentCollection, imgVedioCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db('drmarvin');  // Database name
        collection = db.collection('users');  // Collection for users
        appointmentCollection = db.collection('appointments');  // Collection for appointments
        imgVedioCollection = db.collection('imgVedio');  // New Collection for image and video data
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

connectDB();

// Route to store user data
app.post('/store', async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await collection.insertOne({ name, email });
        res.status(200).json({ message: 'Data stored successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error storing data', error });
    }
});

// Route to retrieve stored user data
app.get('/get-data', async (req, res) => {
    try {
        const data = await collection.find().toArray();
        if (data.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving data', error });
    }
});

// Route to store appointment data
app.post('/appointment', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, reason, appointmentStatus } = req.body;
        const result = await appointmentCollection.insertOne({ firstName, lastName, email, phone, reason, appointmentStatus });
        res.status(200).json({ message: 'Appointment stored successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error storing appointment', error });
    }
});

// Route to retrieve all appointment data
app.get('/appointments', async (req, res) => {
    try {
        const appointments = await appointmentCollection.find().toArray();
        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found' });
        }
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving appointments', error });
    }
});

app.get('/appointments/:phone', async (req, res, next) => {
    try {
        // Extract the dynamic phone number from the route parameter
        const { phone } = req.params;

        // Search for an appointment with the provided phone number
        const appointment = await appointmentCollection.findOne({ phone });

        // If no appointment is found, return a 404 status
        if (!appointment) {
            return res.status(404).json({ message: 'No appointment found for the given phone number' });
        }

        // Return the appointment data
        res.status(200).json(appointment);
    } catch (error) {
        next(error);  // Pass any errors to the error-handling middleware
    }
});

// Route to store img and video data
app.post('/img-video', async (req, res) => {
    try {
        const { img, video } = req.body;
        const result = await imgVedioCollection.insertOne({ img, video });
        res.status(200).json({ message: 'Image and video data stored successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error storing image and video data', error });
    }
});

// Route to retrieve img and video data
app.get('/img-video', async (req, res) => {
    try {
        const data = await imgVedioCollection.find().toArray();
        if (data.length === 0) {
            return res.status(404).json({ message: 'No image and video data found' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving image and video data', error });
    }
});

// Use process.env.PORT for deployment environments (like Vercel)
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

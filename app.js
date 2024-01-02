// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { isEmailValid } = require('./helper');
const app = express();
const port = 8000;
app.use(cors());

const db = "mongodb://localhost:27017/Curd"


mongoose
    .connect(db)
    .then(() => {
        console.log("connection successful");
    })
    .catch((err) => console.log(err));

app.use(express.json());

const Class = mongoose.model('Class', {
    name: String,
    email: String,
    subject: String,
    students: [{ type: mongoose.Schema.Types.Object, ref: 'Student' }],
    studentType: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});


const Student = mongoose.model('Student', {
    name: String,
    email: String,
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
});

app.use(bodyParser.json());

// Create a new class
app.post('/api/classes', async (req, res) => {
    try {
        const newClass = new Class(req.body);
        await newClass.save();
        res.status(201).json(newClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a student to a class
app.post('/api/classes/students/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const newStudent = new Student(req.body);
        newStudent.class = classId;

        await newStudent.save();
        const updatedClass = await Class.findByIdAndUpdate(classId, { $push: { students: req.body } }, { new: true });

        res.status(201).json({ class: updatedClass, student: newStudent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Find a class by ObjectId
app.get('/api/classes/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const foundClass = await Class.findById(classId).populate('studentType');

        if (!foundClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.status(200).json(foundClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/getclass', async(req, res) => {
    try {
        const foundClass = await Class.find({});

        if (!foundClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.status(200).json(foundClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/create/class', async(req, res) => {
    if (isEmailValid(req.body.email)){
        const user = await users.create({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject
        });
        console.log(user,"--->")
        return res.status(200).json(user);
    } else {
        res.send(req.body);
    }
    console.log(req.body.email);
});

app.delete('/apidel/classes/:id', async (req, res) => {
    console.log(req.params.id, "===>")
    try {
        const result = await Class.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 1) {
            res.json({ message: 'Class deleted successfully' });
        } else {
            res.status(404).send('Class not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const corsOptions = {
    origin: 'http://localhost:8000',
};

app.use(cors(corsOptions));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

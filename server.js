const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'data', 'exams.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw || '[]');
}

function writeData(exams) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(exams, null, 2), 'utf8');
}

app.get('/api/exams', (req, res) => {
  res.json(readData());
});

app.post('/api/exams', (req, res) => {
  const exams = readData();
  const { student, course, date, grade, decision } = req.body;
  if (!student || !course || !date || !grade || !decision) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  const newExam = {
    id: Date.now().toString(),
    student,
    course,
    date,
    grade,
    decision
  };
  exams.push(newExam);
  writeData(exams);
  res.status(201).json(newExam);
});

app.put('/api/exams/:id', (req, res) => {
  const exams = readData();
  const exam = exams.find(item => item.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Délibération introuvable.' });
  }
  const { student, course, date, grade, decision } = req.body;
  exam.student = student || exam.student;
  exam.course = course || exam.course;
  exam.date = date || exam.date;
  exam.grade = grade || exam.grade;
  exam.decision = decision || exam.decision;
  writeData(exams);
  res.json(exam);
});

app.delete('/api/exams/:id', (req, res) => {
  const exams = readData();
  const filtered = exams.filter(item => item.id !== req.params.id);
  if (filtered.length === exams.length) {
    return res.status(404).json({ error: 'Délibération introuvable.' });
  }
  writeData(filtered);
  res.status(204).end();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});

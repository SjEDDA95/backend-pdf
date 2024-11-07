// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, 'users.json');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch(err) {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}



// Route d'inscription
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  let users = await readUsers();

  // Vérifier si l'utilisateur existe déjà
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Utilisateur déjà existant' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Ajouter le nouvel utilisateur
  users.push({ username, password: hashedPassword });
  await writeUsers(users);
  res.status(200).json({ message: 'Inscription réussie' });
});

// Route de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  let users = await readUsers();

  // Vérifier les informations d'identification
  const user = users.find(
    user => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Identifiants incorrects' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: 'Incorrect mdp' });
  }

  res.status(200).json({ message: 'Connexion réussie' });
});

app.get('/users', async (req, res) => {
  let users = await readUsers();

  let sanitizedUsers = users.map(user => ({ username: user.username }));
  
  res.status(200).json(sanitizedUsers);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

import express from 'express';
import { config as dotenvConfig } from 'dotenv';
import { dbConnection } from './database';
import sequelize from './database';
import UsersModel from './models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authenticateJWT from './authenticateJWT';

dotenvConfig();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

app.use(express.json());

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await UsersModel.create({ name, email, password: hashedPassword });
    res.status(201).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// Login a user and generate a JWT token
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.findOne({ where: { email } });
    if (!user) return res.status(400).send('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(400).send('Invalid email or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// Middleware to protect routes
app.use(authenticateJWT);

// Get the authenticated user's details
app.get('/user', async (req, res) => {
  try {
    const authUserId = res.locals.user.id;
    const user = await UsersModel.findByPk(authUserId);
    if (!user) return res.status(404).send('User not found');
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// Update the authenticated user's details
app.put('/user', async (req, res) => {
  try {
    const authUserId = res.locals.user.id;
    const { name, email, password } = req.body;

    const user = await UsersModel.findByPk(authUserId);
    if (!user) return res.status(404).send('User not found');

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// Delete the authenticated user's account
app.delete('/user', async (req, res) => {
  try {
    const authUserId = res.locals.user.id;

    const user = await UsersModel.findByPk(authUserId);
    if (!user) return res.status(404).send('User not found');

    await user.destroy();
    res.send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});


dbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Sync all the models
  sequelize.sync({ force: false }).then(() => {
    console.log("All models are synchronized successfully");
  }).catch(error => {
    console.log("Error occurred during model synchronization", error);
  });
}).catch(error => {
  console.error('Failed to connect to the database:', error);
});

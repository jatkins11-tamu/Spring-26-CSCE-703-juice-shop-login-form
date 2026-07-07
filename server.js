// Simple Express server for the HW3 Part 2 login form demo.
//
// This demonstrates server-side validation (which cannot be bypassed the
// way client-side JS can) and secure password handling using bcrypt.
// There is no real database here on purpose - it's a small in-memory demo
// user store, seeded with a bcrypt-hashed password so nothing is ever
// stored or compared in plaintext.

const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Demo user store -------------------------------------------------
// In a real app this would be a database lookup using a parameterized
// query / ORM, never raw string concatenation into SQL.
const demoUser = {
  email: 'demo@example.com',
  // Precomputed bcrypt hash for the password "Password1" (cost factor 12).
  // Generated with: bcrypt.hashSync('Password1', 12)
  passwordHash: bcrypt.hashSync('Password1', 12)
};

// --- Validation helpers (mirrors the client-side checks) -------------
// Requires: alphanumeric characters, then "@", then alphanumeric
// characters, then ".", then alphanumeric characters.
// Kept identical to the client-side pattern in public/script.js so a
// request that bypasses the browser form still gets the same rule
// enforced here.
const EMAIL_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;

function validateEmail(email) {
  if (typeof email !== 'string' || email.trim() === '') {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address (e.g. user@example.com).';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.trim() === '') {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

// --- Login route -------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  // Server-side validation. This runs regardless of what the client sent,
  // so it still catches a request built by hand and pointed straight at
  // this endpoint, bypassing index.html and script.js entirely.
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    return res.status(400).json({
      message: emailError || passwordError
    });
  }

  // Look up the user and compare against the bcrypt hash. bcrypt.compareSync
  // re-hashes the supplied password with the stored salt and does a
  // constant-time comparison, so the plaintext password is never stored
  // or compared directly.
  if (email !== demoUser.email) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const passwordMatches = bcrypt.compareSync(password, demoUser.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.status(200).json({ message: 'Login successful. Welcome back!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

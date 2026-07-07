// Client-side validation for the login form.
// Note: this runs in the browser and can be bypassed (e.g. via dev tools or
// a direct API call), which is exactly why matching checks also exist on
// the server in server.js. Never trust the client alone.

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const serverMessage = document.getElementById('serverMessage');

// Requires: alphanumeric characters, then "@", then alphanumeric
// characters, then ".", then alphanumeric characters.
// Example match: user123@example.com
// Example non-match: test@test (no "." + text after the "@")
const EMAIL_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;

function validateEmail(email) {
  if (email.trim() === '') {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address (e.g. user@example.com).';
  }
  return '';
}

function validatePassword(password) {
  if (password.trim() === '') {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return '';
}

function setFieldState(input, errorSpan, message) {
  errorSpan.textContent = message;
  input.classList.toggle('invalid', message !== '');
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  serverMessage.textContent = '';
  serverMessage.className = 'server-message';

  const email = emailInput.value;
  const password = passwordInput.value;

  const emailErrorMsg = validateEmail(email);
  const passwordErrorMsg = validatePassword(password);

  setFieldState(emailInput, emailError, emailErrorMsg);
  setFieldState(passwordInput, passwordError, passwordErrorMsg);

  // Stop here if client-side validation fails. Nothing is sent to the
  // server for an obviously invalid submission.
  if (emailErrorMsg || passwordErrorMsg) {
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      serverMessage.textContent = data.message;
      serverMessage.classList.add('success');
    } else {
      serverMessage.textContent = data.message;
      serverMessage.classList.add('error');
    }
  } catch (err) {
    serverMessage.textContent = 'Unable to reach the server. Please try again.';
    serverMessage.classList.add('error');
  }
});

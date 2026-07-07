# Secure Login Form Demo

Built for CSCE 703 (Cybersecurity Risk Analysis) - HW3, Part 2. A basic login
form modeled after OWASP Juice Shop's login page, with both client-side and
server-side validation.

## What this is

A simple email/password login form. It exists to demonstrate why
client-side validation alone is not a security control, and to show a
basic, correct pattern for handling passwords server-side.

- `public/index.html` - the login page markup
- `public/styles.css` - styling
- `public/script.js` - client-side validation (runs in the browser)
- `server.js` - Express server with server-side validation and password
  handling
- `package.json` - dependencies

## Validation rules

Both the client and the server enforce the same two rules:

1. Email must not be empty and must contain an `@` symbol.
2. Password must not be empty and must be at least 8 characters long.

The client-side checks in `script.js` give the user instant feedback and
stop obviously invalid submissions from ever leaving the browser. But
client-side checks can be bypassed entirely, for example by sending a
request straight to `/api/login` with a tool like Postman, curl, or the
browser console, skipping the HTML form altogether. That's why the exact
same checks are re-implemented in `server.js` and run again on every
request, regardless of what the client already checked.

## Password handling

There is a single demo account:

```
email: demo@example.com
password: Password1
```

The password is never stored or compared as plaintext. It is hashed with
`bcrypt` (cost factor 12) when the demo user is created, and login requests
are checked with `bcrypt.compareSync()`, which re-hashes the submitted
password with the stored salt and compares the result. This means even if
the password store were somehow leaked, an attacker would get bcrypt
hashes, not usable passwords.

## Running it locally

```bash
npm install
npm start
```

Then open `http://localhost:3000` in a browser.

## Testing the validation

Try these to see both layers of validation in action:

- Leave a field empty and submit -> client-side error appears immediately.
- Open browser dev tools and send a POST request directly to
  `/api/login` with an email missing `@`, or a password under 8
  characters -> server responds with a 400 and the same validation
  message, proving the check isn't just in the browser.
- Log in with the demo credentials above -> succeeds.
- Log in with the correct email but wrong password -> fails with a generic
  "Invalid email or password" message (this avoids revealing whether the
  email or the password was the incorrect part, which helps prevent
  account enumeration).

## Relationship to Part 1 and Part 3

Part 1 of this assignment covers vulnerability analysis of OWASP Juice
Shop's own registration and login flows. Part 3 documents an attempted
SQL injection / XSS attack against this form specifically. Because this
demo doesn't use string-concatenated SQL queries (there's no real database
here at all) and doesn't render user input back into the page without
escaping, it is not expected to be vulnerable to either attack, that
outcome and the reasoning behind it are documented in Part 3.

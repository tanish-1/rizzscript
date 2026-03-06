// src/errors.js — RizzScript Universal Error Handler
// "touch grass" and "Go outside bro 🌿" are ALWAYS two separate console.log calls.

function rizzError(message) {
  console.log('touch grass');
  console.log('Go outside bro 🌿');
  if (process.env.RIZZ_DEBUG && message) {
    console.log('\n[debug]', message);
  }
}

module.exports = { rizzError };

#!/usr/bin/env node
// bin/rizz.js — RizzScript CLI Runner
// Usage: node bin/rizz.js <file.rizz>

const fs = require('fs');
const path = require('path');
const { Lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/interpreter');
const { rizzError } = require('../src/errors');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║         RizzScript v1.0.0             ║');
    console.log('║  "Compile vibes, not bugs."           ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    console.log('Usage: node bin/rizz.js <file.rizz>');
    console.log('');
    console.log('Examples:');
    console.log('  node bin/rizz.js examples/hello.rizz');
    console.log('  node bin/rizz.js examples/loops.rizz');
    process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
    console.log(`touch grass`);
    console.log(`Go outside bro 🌿`);
    console.log(`\n(File not found: ${filePath})`);
    process.exit(1);
}

if (!filePath.endsWith('.rizz')) {
    console.log(`touch grass`);
    console.log(`Go outside bro 🌿`);
    console.log(`\n(Only .rizz files are accepted — this ain't Python chat)`);
    process.exit(1);
}

const source = fs.readFileSync(filePath, 'utf-8');

try {
    // Step 1 — Lexer
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Step 2 — Parser
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Step 3 — Interpreter
    const interp = new Interpreter(ast);
    interp.run();

} catch (err) {
    console.log('touch grass');
    console.log('Go outside bro 🌿');
    if (process.env.RIZZ_DEBUG) {
        console.log('\n[debug]', err.message);
    }
    process.exit(1);
}

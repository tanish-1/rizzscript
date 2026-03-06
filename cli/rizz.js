#!/usr/bin/env node
// bin/rizz.js — RizzScript CLI Runner
// Usage: node bin/rizz.js <file.rizz>

const fs = require('fs');
const path = require('path');
const { Lexer } = require('../core/lexer');
const { Parser } = require('../core/parser');
const { Interpreter } = require('../core/interpreter');
const { rizzError } = require('../core/errors');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║         RizzScript v1.2.7             ║');
    console.log('║  "Compile vibes, not bugs."           ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    console.log('Usage:');
    console.log('  rizz <file.rizz>    Run a RizzScript file');
    console.log('  rizz vscode         Install VS Code extension (Syntax + Run button)');
    console.log('');
    process.exit(0);
}

if (args[0] === 'vscode') {
    console.log('🔥 Installing RizzScript VS Code Extension...');
    const { execSync } = require('child_process');
    try {
        execSync(`code --install-extension tanish-1.rizzscript --force`, { stdio: 'inherit' });
        console.log('✅ VS Code extension installed successfully!');
        console.log('Restart VS Code or open a .rizz file to see syntax highlighting and the Play button.');
    } catch (err) {
        console.log('❌ Failed to install VS Code extension. Is the `code` command in your PATH?');
        console.log('👉 Install manually: https://marketplace.visualstudio.com/items?itemName=tanish-1.rizzscript');
    }
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
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interp = new Interpreter(ast);
    interp.run();

} catch (err) {
    console.log(err.message);
    console.log('touch grass');
    console.log('Go outside bro 🌿');
    if (process.env.RIZZ_DEBUG && err.stack) {
        console.log('\n[stack trace]\n', err.stack);
    }
    process.exit(1);
}

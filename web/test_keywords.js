
import { Lexer } from './src/rizz/lexer.js';

const code = `ready to lock in
spill "testing"
we out`;

try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    console.log("Tokens found:", tokens.map(t => t.type).join(', '));
    if (tokens[0].type === 'PROGRAM_START' && tokens[tokens.length - 2].type === 'PROGRAM_END') {
        process.exit(0);
    } else {
        process.exit(1);
    }
} catch (e) {
    console.error(e);
    process.exit(1);
}

// src/lexer.js — RizzScript Tokenizer
// Converts raw .rizz source code into a flat list of typed tokens.

const TokenType = {
    // Program control
    PROGRAM_START: 'PROGRAM_START',   // yo fam
    PROGRAM_END: 'PROGRAM_END',     // peace out
    GHOST: 'GHOST',           // ghost

    // Variables / constants
    VAR: 'VAR',             // vibe
    CONST: 'CONST',           // lock in

    // Output / input
    PRINT: 'PRINT',           // spill
    INPUT: 'INPUT',           // slay

    // Conditionals
    IF: 'IF',              // sus check
    ELSE: 'ELSE',            // or nah

    // Loops
    FOR: 'FOR',             // loop the vibe
    FROM: 'FROM',            // from
    TO: 'TO',              // to
    WHILE: 'WHILE',           // grind

    // Functions
    FUNCTION: 'FUNCTION',        // cook
    RETURN: 'RETURN',          // drop

    // Classes
    CLASS: 'CLASS',           // aura
    NEW: 'NEW',             // fresh

    // Arrays
    ARRAY_DECL: 'ARRAY_DECL',      // squad

    // Literals
    TRUE: 'TRUE',            // bet
    FALSE: 'FALSE',           // cap
    NULL: 'NULL',            // mid
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    IDENT: 'IDENT',

    // Debug
    DEBUG: 'DEBUG',           // vibe check

    // Punctuation
    LPAREN: 'LPAREN',    // (
    RPAREN: 'RPAREN',    // )
    LBRACE: 'LBRACE',    // {
    RBRACE: 'RBRACE',    // }
    LBRACKET: 'LBRACKET',  // [
    RBRACKET: 'RBRACKET',  // ]
    COMMA: 'COMMA',     // ,
    DOT: 'DOT',       // .
    COLON: 'COLON',     // :
    SEMICOLON: 'SEMICOLON', // ;

    // Assignment
    ASSIGN: 'ASSIGN',    // =

    // Comparison / logical
    EQ: 'EQ',        // ==
    NEQ: 'NEQ',       // !=
    LT: 'LT',        // <
    GT: 'GT',        // >
    LTE: 'LTE',       // <=
    GTE: 'GTE',       // >=
    AND: 'AND',       // &&
    OR: 'OR',        // ||
    NOT: 'NOT',       // !

    // Arithmetic
    PLUS: 'PLUS',      // +
    MINUS: 'MINUS',     // -
    STAR: 'STAR',      // *
    SLASH: 'SLASH',     // /
    PERCENT: 'PERCENT',   // %

    // Misc
    EOF: 'EOF',
};

// Multi-word keywords: order matters — longer first so greedy match wins
const MULTI_KEYWORDS = [
    ['yo fam', TokenType.PROGRAM_START],
    ['peace out', TokenType.PROGRAM_END],
    ['sus check', TokenType.IF],
    ['or nah', TokenType.ELSE],
    ['loop the vibe', TokenType.FOR],
    ['lock in', TokenType.CONST],
    ['vibe check', TokenType.DEBUG],
];

// Single-word keywords
const SINGLE_KEYWORDS = {
    'ghost': TokenType.GHOST,
    'vibe': TokenType.VAR,
    'spill': TokenType.PRINT,
    'grind': TokenType.WHILE,
    'cook': TokenType.FUNCTION,
    'drop': TokenType.RETURN,
    'aura': TokenType.CLASS,
    'squad': TokenType.ARRAY_DECL,
    'bet': TokenType.TRUE,
    'cap': TokenType.FALSE,
    'mid': TokenType.NULL,
    'slay': TokenType.INPUT,
    'fresh': TokenType.NEW,
    'from': TokenType.FROM,
    'to': TokenType.TO,
};

class Lexer {
    constructor(source) {
        this.source = source;
        this.pos = 0;
        this.line = 1;
        this.tokens = [];
    }

    error(msg) {
        throw new Error(`Lexer error at line ${this.line}: ${msg}`);
    }

    peek(offset = 0) {
        return this.source[this.pos + offset];
    }

    advance() {
        const ch = this.source[this.pos++];
        if (ch === '\n') this.line++;
        return ch;
    }

    skipWhitespace() {
        while (this.pos < this.source.length) {
            const ch = this.peek();
            if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
                this.advance();
            } else if (ch === '/' && this.peek(1) === '/') {
                // line comment
                while (this.pos < this.source.length && this.peek() !== '\n') {
                    this.advance();
                }
            } else if (ch === '/' && this.peek(1) === '*') {
                // block comment
                this.advance(); this.advance();
                while (this.pos < this.source.length) {
                    if (this.peek() === '*' && this.peek(1) === '/') {
                        this.advance(); this.advance();
                        break;
                    }
                    this.advance();
                }
            } else {
                break;
            }
        }
    }

    // Try to match a multi-word keyword at current position
    tryMultiKeyword() {
        for (const [kw, type] of MULTI_KEYWORDS) {
            if (this.source.startsWith(kw, this.pos)) {
                // Make sure it's not a partial word match (check char after keyword)
                const after = this.source[this.pos + kw.length];
                if (after === undefined || /\W/.test(after)) {
                    for (let i = 0; i < kw.length; i++) this.advance();
                    return { type, value: kw };
                }
            }
        }
        return null;
    }

    readString(quote) {
        this.advance(); // consume opening quote
        let str = '';
        while (this.pos < this.source.length) {
            const ch = this.peek();
            if (ch === '\\') {
                this.advance();
                const esc = this.advance();
                switch (esc) {
                    case 'n': str += '\n'; break;
                    case 't': str += '\t'; break;
                    case '\\': str += '\\'; break;
                    case '"': str += '"'; break;
                    case "'": str += "'"; break;
                    default: str += esc; break;
                }
            } else if (ch === quote) {
                this.advance(); // consume closing quote
                break;
            } else {
                str += this.advance();
            }
        }
        return str;
    }

    readNumber() {
        let num = '';
        while (this.pos < this.source.length && /[\d.]/.test(this.peek())) {
            num += this.advance();
        }
        return parseFloat(num);
    }

    readIdent() {
        let id = '';
        while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.peek())) {
            id += this.advance();
        }
        return id;
    }

    tokenize() {
        while (this.pos < this.source.length) {
            this.skipWhitespace();
            if (this.pos >= this.source.length) break;

            // Try multi-word keywords first
            const multi = this.tryMultiKeyword();
            if (multi) {
                this.tokens.push({ type: multi.type, value: multi.value, line: this.line });
                continue;
            }

            const ch = this.peek();
            const line = this.line;

            // Strings
            if (ch === '"' || ch === "'") {
                const str = this.readString(ch);
                this.tokens.push({ type: TokenType.STRING, value: str, line });
                continue;
            }

            // Numbers
            if (/\d/.test(ch) || (ch === '-' && /\d/.test(this.peek(1)))) {
                const num = this.readNumber();
                this.tokens.push({ type: TokenType.NUMBER, value: num, line });
                continue;
            }

            // Two-char operators
            if (ch === '=' && this.peek(1) === '=') { this.advance(); this.advance(); this.tokens.push({ type: TokenType.EQ, value: '==', line }); continue; }
            if (ch === '!' && this.peek(1) === '=') { this.advance(); this.advance(); this.tokens.push({ type: TokenType.NEQ, value: '!=', line }); continue; }
            if (ch === '<' && this.peek(1) === '=') { this.advance(); this.advance(); this.tokens.push({ type: TokenType.LTE, value: '<=', line }); continue; }
            if (ch === '>' && this.peek(1) === '=') { this.advance(); this.advance(); this.tokens.push({ type: TokenType.GTE, value: '>=', line }); continue; }
            if (ch === '&' && this.peek(1) === '&') { this.advance(); this.advance(); this.tokens.push({ type: TokenType.AND, value: '&&', line }); continue; }
            if (ch === '|' && this.peek(1) === '|') { this.advance(); this.advance(); this.tokens.push({ type: TokenType.OR, value: '||', line }); continue; }

            // Single-char punctuation & operators
            const singles = {
                '(': TokenType.LPAREN, ')': TokenType.RPAREN,
                '{': TokenType.LBRACE, '}': TokenType.RBRACE,
                '[': TokenType.LBRACKET, ']': TokenType.RBRACKET,
                ',': TokenType.COMMA, '.': TokenType.DOT,
                ':': TokenType.COLON, ';': TokenType.SEMICOLON,
                '=': TokenType.ASSIGN,
                '+': TokenType.PLUS, '-': TokenType.MINUS,
                '*': TokenType.STAR, '/': TokenType.SLASH,
                '%': TokenType.PERCENT,
                '<': TokenType.LT, '>': TokenType.GT,
                '!': TokenType.NOT,
            };

            if (singles[ch]) {
                this.advance();
                this.tokens.push({ type: singles[ch], value: ch, line });
                continue;
            }

            // Identifiers / single-word keywords
            if (/[a-zA-Z_]/.test(ch)) {
                const id = this.readIdent();
                const kwType = SINGLE_KEYWORDS[id];
                if (kwType) {
                    this.tokens.push({ type: kwType, value: id, line });
                } else {
                    this.tokens.push({ type: TokenType.IDENT, value: id, line });
                }
                continue;
            }

            this.error(`Unexpected character: ${ch}`);
        }

        this.tokens.push({ type: TokenType.EOF, value: null, line: this.line });
        return this.tokens;
    }
}

module.exports = { Lexer, TokenType };

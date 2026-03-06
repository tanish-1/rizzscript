// src/parser.js — RizzScript Recursive-Descent Parser
// Converts token stream into an Abstract Syntax Tree (AST).

const { TokenType } = require('./lexer');

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    /* ─── Token helpers ─── */
    peek() { return this.tokens[this.pos]; }
    prev() { return this.tokens[this.pos - 1]; }

    check(type) {
        return this.peek().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.pos++;
        return this.prev();
    }

    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }

    consume(type, msg) {
        if (this.check(type)) return this.advance();
        const t = this.peek();
        throw new Error(`L ${t.line} C ${t.col}: ${msg} (got ${t.type} "${t.value}")`);
    }

    match(...types) {
        for (const t of types) {
            if (this.check(t)) { this.advance(); return true; }
        }
        return false;
    }

    /* ─── Entry point ─── */
    parse() {
        this.consume(TokenType.PROGRAM_START, 'Program must start with "ready to lock in" or "yo fam"');
        const body = [];
        while (!this.isAtEnd() && !this.check(TokenType.PROGRAM_END)) {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        if (!this.isAtEnd()) this.consume(TokenType.PROGRAM_END, 'Expected "peace out"');
        return { type: 'Program', body };
    }

    /* ─── Statements ─── */
    statement() {
        const t = this.peek().type;

        if (t === TokenType.VAR) return this.varDecl();
        if (t === TokenType.ARRAY_DECL) return this.arrayDecl();
        if (t === TokenType.CONST) return this.constDecl();
        if (t === TokenType.PRINT) return this.printStmt();
        if (t === TokenType.IF) return this.ifStmt();
        if (t === TokenType.FOR) return this.forStmt();
        if (t === TokenType.WHILE) return this.whileStmt();
        if (t === TokenType.FUNCTION) return this.funcDecl();
        if (t === TokenType.CLASS) return this.classDecl();
        if (t === TokenType.RETURN) return this.returnStmt();
        if (t === TokenType.DEBUG) return this.debugStmt();
        if (t === TokenType.GHOST) { this.advance(); return { type: 'Ghost' }; }
        if (t === TokenType.INPUT) return this.inputStmt();

        // Assignment or function call (expression statement)
        return this.exprStmt();
    }

    varDecl() {
        this.consume(TokenType.VAR, 'Expected "vibe"');
        const name = this.consume(TokenType.IDENT, 'Expected variable name').value;
        let init = null;
        if (this.match(TokenType.ASSIGN)) {
            init = this.expression();
        }
        return { type: 'VarDecl', name, init };
    }

    arrayDecl() {
        this.consume(TokenType.ARRAY_DECL, 'Expected "squad"');
        const name = this.consume(TokenType.IDENT, 'Expected array variable name').value;
        let init = null;
        if (this.match(TokenType.ASSIGN)) {
            init = this.expression();
        }
        return { type: 'VarDecl', name, init };
    }

    constDecl() {
        this.consume(TokenType.CONST, 'Expected "lock in"');
        const name = this.consume(TokenType.IDENT, 'Expected constant name').value;
        this.consume(TokenType.ASSIGN, 'Expected "=" after constant name');
        const init = this.expression();
        return { type: 'ConstDecl', name, init };
    }

    printStmt() {
        this.consume(TokenType.PRINT, 'Expected "spill"');
        const value = this.expression();
        return { type: 'Print', value };
    }

    inputStmt() {
        this.consume(TokenType.INPUT, 'Expected "slay"');
        const name = this.consume(TokenType.IDENT, 'Expected variable name').value;
        let prompt = null;
        if (this.check(TokenType.STRING)) {
            prompt = this.advance().value;
        }
        return { type: 'Input', name, prompt };
    }

    ifStmt() {
        this.consume(TokenType.IF, 'Expected "sus check"');
        this.consume(TokenType.LPAREN, 'Expected "(" after "sus check"');
        const condition = this.expression();
        this.consume(TokenType.RPAREN, 'Expected ")" after condition');
        const thenBranch = this.block();
        let elseBranch = null;
        if (this.match(TokenType.ELSE)) {
            elseBranch = this.block();
        }
        return { type: 'If', condition, thenBranch, elseBranch };
    }

    forStmt() {
        // loop the vibe <ident> from <expr> to <expr> { }
        this.consume(TokenType.FOR, 'Expected "loop the vibe"');
        const counter = this.consume(TokenType.IDENT, 'Expected loop variable').value;
        this.consume(TokenType.FROM, 'Expected "from"');
        const start = this.expression();
        this.consume(TokenType.TO, 'Expected "to"');
        const end = this.expression();
        const body = this.block();
        return { type: 'ForLoop', counter, start, end, body };
    }

    whileStmt() {
        // grind <condition> { }
        this.consume(TokenType.WHILE, 'Expected "grind"');
        const condition = this.expression();
        const body = this.block();
        return { type: 'WhileLoop', condition, body };
    }

    funcDecl() {
        // cook name(params) { }
        this.consume(TokenType.FUNCTION, 'Expected "cook"');
        const name = this.consume(TokenType.IDENT, 'Expected function name').value;
        this.consume(TokenType.LPAREN, 'Expected "("');
        const params = [];
        if (!this.check(TokenType.RPAREN)) {
            params.push(this.consume(TokenType.IDENT, 'Expected parameter name').value);
            while (this.match(TokenType.COMMA)) {
                params.push(this.consume(TokenType.IDENT, 'Expected parameter name').value);
            }
        }
        this.consume(TokenType.RPAREN, 'Expected ")"');
        const body = this.block();
        return { type: 'FuncDecl', name, params, body };
    }

    classDecl() {
        // aura ClassName { methods }
        this.consume(TokenType.CLASS, 'Expected "aura"');
        const name = this.consume(TokenType.IDENT, 'Expected class name').value;
        this.consume(TokenType.LBRACE, 'Expected "{"');
        const methods = [];
        const fields = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            if (this.check(TokenType.FUNCTION)) {
                methods.push(this.funcDecl());
            } else if (this.check(TokenType.VAR)) {
                fields.push(this.varDecl());
            } else {
                this.advance(); // skip unexpected tokens inside class body
            }
        }
        this.consume(TokenType.RBRACE, 'Expected "}"');
        return { type: 'ClassDecl', name, methods, fields };
    }

    returnStmt() {
        this.consume(TokenType.RETURN, 'Expected "drop"');
        let value = null;
        // Return has a value if the next token is not a statement-starting keyword or '}'
        const noVal = [
            TokenType.RBRACE, TokenType.EOF, TokenType.PROGRAM_END,
            TokenType.VAR, TokenType.CONST, TokenType.PRINT, TokenType.IF,
            TokenType.FOR, TokenType.WHILE, TokenType.FUNCTION, TokenType.CLASS,
            TokenType.DEBUG, TokenType.GHOST, TokenType.RETURN,
        ];
        if (!noVal.includes(this.peek().type)) {
            value = this.expression();
        }
        return { type: 'Return', value };
    }

    debugStmt() {
        this.consume(TokenType.DEBUG, 'Expected "vibe check"');
        return { type: 'Debug' };
    }

    exprStmt() {
        const expr = this.expression();
        // Allow optional semicolon
        this.match(TokenType.SEMICOLON);
        return { type: 'ExprStmt', expr };
    }

    block() {
        this.consume(TokenType.LBRACE, 'Expected "{"');
        const stmts = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            stmts.push(this.statement());
        }
        this.consume(TokenType.RBRACE, 'Expected "}"');
        return stmts;
    }

    /* ─── Expressions ─── */
    expression() {
        return this.assignment();
    }

    assignment() {
        const expr = this.logicalOr();

        if (this.check(TokenType.ASSIGN)) {
            // Make sure LHS is an assignable
            if (expr.type === 'Ident') {
                this.advance();
                const value = this.assignment();
                return { type: 'Assignment', name: expr.name, value };
            }
            if (expr.type === 'IndexExpr') {
                this.advance();
                const value = this.assignment();
                return { type: 'IndexAssign', object: expr.object, index: expr.index, value };
            }
            if (expr.type === 'MemberExpr') {
                this.advance();
                const value = this.assignment();
                return { type: 'MemberAssign', object: expr.object, prop: expr.prop, value };
            }
        }
        return expr;
    }

    logicalOr() {
        let left = this.logicalAnd();
        while (this.check(TokenType.OR)) {
            const op = this.advance().value;
            const right = this.logicalAnd();
            left = { type: 'BinaryExpr', op, left, right };
        }
        return left;
    }

    logicalAnd() {
        let left = this.equality();
        while (this.check(TokenType.AND)) {
            const op = this.advance().value;
            const right = this.equality();
            left = { type: 'BinaryExpr', op, left, right };
        }
        return left;
    }

    equality() {
        let left = this.comparison();
        while (this.check(TokenType.EQ) || this.check(TokenType.NEQ)) {
            const op = this.advance().value;
            const right = this.comparison();
            left = { type: 'BinaryExpr', op, left, right };
        }
        return left;
    }

    comparison() {
        let left = this.additive();
        while ([TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE].includes(this.peek().type)) {
            const op = this.advance().value;
            const right = this.additive();
            left = { type: 'BinaryExpr', op, left, right };
        }
        return left;
    }

    additive() {
        let left = this.multiplicative();
        while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
            const op = this.advance().value;
            const right = this.multiplicative();
            left = { type: 'BinaryExpr', op, left, right };
        }
        return left;
    }

    multiplicative() {
        let left = this.unary();
        while ([TokenType.STAR, TokenType.SLASH, TokenType.PERCENT].includes(this.peek().type)) {
            const op = this.advance().value;
            const right = this.unary();
            left = { type: 'BinaryExpr', op, left, right };
        }
        return left;
    }

    unary() {
        if (this.check(TokenType.NOT)) {
            const op = this.advance().value;
            const right = this.unary();
            return { type: 'UnaryExpr', op, right };
        }
        if (this.check(TokenType.MINUS)) {
            const op = this.advance().value;
            const right = this.unary();
            return { type: 'UnaryExpr', op, right };
        }
        return this.callExpr();
    }

    callExpr() {
        let expr = this.primary();

        while (true) {
            if (this.check(TokenType.LPAREN)) {
                // Function call
                this.advance();
                const args = [];
                if (!this.check(TokenType.RPAREN)) {
                    args.push(this.expression());
                    while (this.match(TokenType.COMMA)) {
                        args.push(this.expression());
                    }
                }
                this.consume(TokenType.RPAREN, 'Expected ")"');
                expr = { type: 'CallExpr', callee: expr, args };
            } else if (this.check(TokenType.DOT)) {
                // Member access: obj.prop
                this.advance();
                const prop = this.consume(TokenType.IDENT, 'Expected property name').value;
                expr = { type: 'MemberExpr', object: expr, prop };
            } else if (this.check(TokenType.LBRACKET)) {
                // Index access: arr[i]
                this.advance();
                const index = this.expression();
                this.consume(TokenType.RBRACKET, 'Expected "]"');
                expr = { type: 'IndexExpr', object: expr, index };
            } else {
                break;
            }
        }

        return expr;
    }

    primary() {
        const t = this.peek();

        if (t.type === TokenType.TRUE) { this.advance(); return { type: 'Literal', value: true }; }
        if (t.type === TokenType.FALSE) { this.advance(); return { type: 'Literal', value: false }; }
        if (t.type === TokenType.NULL) { this.advance(); return { type: 'Literal', value: null }; }
        if (t.type === TokenType.NUMBER) { this.advance(); return { type: 'Literal', value: t.value }; }
        if (t.type === TokenType.STRING) { this.advance(); return { type: 'Literal', value: t.value }; }

        // Grouped expression
        if (t.type === TokenType.LPAREN) {
            this.advance();
            const expr = this.expression();
            this.consume(TokenType.RPAREN, 'Expected ")"');
            return { type: 'Group', expr };
        }

        // Array literal: [a, b, c]
        if (t.type === TokenType.LBRACKET) {
            this.advance();
            const elements = [];
            if (!this.check(TokenType.RBRACKET)) {
                elements.push(this.expression());
                while (this.match(TokenType.COMMA)) {
                    if (this.check(TokenType.RBRACKET)) break; // trailing comma OK
                    elements.push(this.expression());
                }
            }
            this.consume(TokenType.RBRACKET, 'Expected "]"');
            return { type: 'ArrayLiteral', elements };
        }

        // Object literal: { key: value, ... }
        if (t.type === TokenType.LBRACE) {
            this.advance();
            const props = [];
            while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
                const key = this.consume(TokenType.IDENT, 'Expected property name').value;
                this.consume(TokenType.COLON, 'Expected ":"');
                const val = this.expression();
                props.push({ key, value: val });
                this.match(TokenType.COMMA);
            }
            this.consume(TokenType.RBRACE, 'Expected "}"');
            return { type: 'ObjectLiteral', props };
        }

        // new / fresh ClassName(args)
        if (t.type === TokenType.NEW) {
            this.advance();
            const className = this.consume(TokenType.IDENT, 'Expected class name').value;
            this.consume(TokenType.LPAREN, 'Expected "("');
            const args = [];
            if (!this.check(TokenType.RPAREN)) {
                args.push(this.expression());
                while (this.match(TokenType.COMMA)) args.push(this.expression());
            }
            this.consume(TokenType.RPAREN, 'Expected ")"');
            return { type: 'NewExpr', className, args };
        }

        // Identifier
        if (t.type === TokenType.IDENT) {
            this.advance();
            return { type: 'Ident', name: t.value };
        }

        throw new Error(`L ${t.line} C ${t.col}: Unexpected token "${t.value}" (${t.type}). Get it together.`);
    }
}

module.exports = { Parser };

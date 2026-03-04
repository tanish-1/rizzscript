// src/interpreter.js — RizzScript Tree-Walk Interpreter
// Evaluates the AST produced by the parser.

// ─── Environment (Scope) ───────────────────────────────────────────────────
class Environment {
    constructor(parent = null) {
        this.vars = {};
        this.consts = new Set();
        this.parent = parent;
    }

    define(name, value, isConst = false) {
        this.vars[name] = value;
        if (isConst) this.consts.add(name);
    }

    set(name, value) {
        if (name in this.vars) {
            if (this.consts.has(name)) {
                throw new Error(`Cannot reassign constant "${name}" — it's locked in, bestie 🔒`);
            }
            this.vars[name] = value;
            return;
        }
        if (this.parent) return this.parent.set(name, value);
        throw new Error(`Undefined variable "${name}" — not in the squad`);
    }

    get(name) {
        if (name in this.vars) return this.vars[name];
        if (this.parent) return this.parent.get(name);
        throw new Error(`Undefined variable "${name}" — not in the squad`);
    }
}

// ─── Return signal (non-error control flow) ───────────────────────────────
class ReturnSignal {
    constructor(value) { this.value = value; }
}

// ─── RizzScript Function ──────────────────────────────────────────────────
class RizzFunction {
    constructor(name, params, body, closure) {
        this.name = name;
        this.params = params;
        this.body = body;
        this.closure = closure;
    }

    async call(interp, args) {
        const env = new Environment(this.closure);
        this.params.forEach((p, i) => env.define(p, args[i] !== undefined ? args[i] : null));
        try {
            await interp.execBlock(this.body, env);
        } catch (e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
        }
        return null;
    }

    toString() { return `[cook ${this.name}]`; }
}

// ─── RizzScript Class ─────────────────────────────────────────────────────
class RizzClass {
    constructor(name, methods, fields) {
        this.name = name;
        this.methods = methods; // Map<string, RizzFunction>
        this.fields = fields;  // Array of { name, initExpr } resolved later
    }

    async instantiate(interp, args) {
        const instance = new RizzInstance(this);
        // Initialise declared fields
        for (const f of this.fields) {
            instance.props[f.name] = f.init ? await interp.eval(f.init) : null;
        }
        // Call init() constructor if exists
        if (this.methods.has('init')) {
            const ctor = this.methods.get('init');
            const env = new Environment(ctor.closure);
            env.define('self', instance);
            ctor.params.forEach((p, i) => env.define(p, args[i] !== undefined ? args[i] : null));
            try {
                await interp.execBlock(ctor.body, env);
            } catch (e) {
                if (!(e instanceof ReturnSignal)) throw e;
            }
        }
        return instance;
    }

    toString() { return `[aura ${this.name}]`; }
}

class RizzInstance {
    constructor(klass) {
        this.klass = klass;
        this.props = {};
    }

    get(name) {
        if (name in this.props) return this.props[name];
        if (this.klass.methods.has(name)) {
            // Bind method so "self" resolves
            const method = this.klass.methods.get(name);
            const bound = new BoundMethod(method, this);
            return bound;
        }
        throw new Error(`Property "${name}" not found on aura ${this.klass.name}`);
    }

    set(name, value) {
        this.props[name] = value;
    }

    toString() { return `[aura instance of ${this.klass.name}]`; }
}

class BoundMethod {
    constructor(fn, instance) {
        this.fn = fn;
        this.instance = instance;
    }

    async call(interp, args) {
        const env = new Environment(this.fn.closure);
        env.define('self', this.instance);
        this.fn.params.forEach((p, i) => env.define(p, args[i] !== undefined ? args[i] : null));
        try {
            await interp.execBlock(this.fn.body, env);
        } catch (e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
        }
        return null;
    }
}

// ─── Interpreter ──────────────────────────────────────────────────────────
class Interpreter {
    constructor(ast, options = {}) {
        this.ast = ast;
        this.onLog = options.onLog || console.log;
        this.onInput = options.onInput || (() => "");
        this.global = new Environment();
        this.env = this.global;

        // Built-in functions
        this._defineBuiltins();
    }

    _defineBuiltins() {
        // len(arr)
        this.global.define('len', {
            call: async (_, args) => {
                const a = args[0];
                if (typeof a === 'string' || Array.isArray(a)) return a.length;
                if (a && typeof a === 'object') return Object.keys(a).length;
                throw new Error('len() needs a squad (array) or string');
            },
            toString: () => '[built-in: len]'
        });

        // str(val)
        this.global.define('str', {
            call: async (_, args) => this.stringify(args[0]),
            toString: () => '[built-in: str]'
        });

        // num(val)
        this.global.define('num', {
            call: async (_, args) => {
                const n = parseFloat(args[0]);
                if (isNaN(n)) throw new Error(`Cannot convert "${args[0]}" to a number`);
                return n;
            },
            toString: () => '[built-in: num]'
        });

        // push(arr, val)
        this.global.define('push', {
            call: async (_, args) => {
                if (!Array.isArray(args[0])) throw new Error('push() needs a squad as first arg');
                args[0].push(args[1]);
                return args[0];
            },
            toString: () => '[built-in: push]'
        });

        // pop(arr)
        this.global.define('pop', {
            call: async (_, args) => {
                if (!Array.isArray(args[0])) throw new Error('pop() needs a squad as first arg');
                return args[0].pop();
            },
            toString: () => '[built-in: pop]'
        });

        // rng(min, max)
        this.global.define('rng', {
            call: async (_, args) => {
                const min = Math.ceil(args[0] || 0);
                const max = Math.floor(args[1] || 100);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            toString: () => '[built-in: rng]'
        });

        // chill(ms)
        this.global.define('chill', {
            call: async (_, args) => {
                const ms = args[0] || 1000;
                await new Promise(resolve => setTimeout(resolve, ms));
                return null;
            },
            toString: () => '[built-in: chill]'
        });
    }

    // ─── Run the program ────────────────────────────────────────────────────
    async run() {
        await this.execBlock(this.ast.body, this.global);
    }

    async execBlock(stmts, env) {
        const prev = this.env;
        this.env = env;
        try {
            for (const stmt of stmts) {
                await this.exec(stmt);
            }
        } finally {
            this.env = prev;
        }
    }

    async exec(node) {
        switch (node.type) {
            case 'VarDecl': return await this.execVarDecl(node);
            case 'ConstDecl': return await this.execConstDecl(node);
            case 'Print': return await this.execPrint(node);
            case 'Input': return await this.execInput(node);
            case 'If': return await this.execIf(node);
            case 'ForLoop': return await this.execFor(node);
            case 'WhileLoop': return await this.execWhile(node);
            case 'FuncDecl': return await this.execFuncDecl(node);
            case 'ClassDecl': return await this.execClassDecl(node);
            case 'Return': throw new ReturnSignal(node.value ? await this.eval(node.value) : null);
            case 'Debug': this.onLog('System aura: immaculate'); return;
            case 'Ghost': if (typeof process !== 'undefined' && process.exit) process.exit(0); return;
            case 'ExprStmt': return await this.eval(node.expr);
            default:
                throw new Error(`Unknown statement type: ${node.type}`);
        }
    }

    async execVarDecl(node) {
        const value = node.init ? await this.eval(node.init) : null;
        this.env.define(node.name, value);
    }

    async execConstDecl(node) {
        const value = await this.eval(node.init);
        this.env.define(node.name, value, true);
    }

    async execPrint(node) {
        const value = await this.eval(node.value);
        this.onLog(this.stringify(value));
    }

    async execInput(node) {
        const prompt = node.prompt ? node.prompt : '> ';
        // Web/Browser fallback path is primary for this file (web/src/rizz/interpreter.js)
        const input = await this.onInput(prompt);
        this.env.define(node.name, input);
    }

    async execIf(node) {
        const cond = await this.eval(node.condition);
        if (this.isTruthy(cond)) {
            await this.execBlock(node.thenBranch, new Environment(this.env));
        } else if (node.elseBranch) {
            await this.execBlock(node.elseBranch, new Environment(this.env));
        }
    }

    async execFor(node) {
        let start = await this.eval(node.start);
        let end = await this.eval(node.end);
        const env = new Environment(this.env);
        env.define(node.counter, start);
        for (let i = start; i < end; i++) {
            env.set(node.counter, i);
            await this.execBlock(node.body, new Environment(env));
        }
    }

    async execWhile(node) {
        let iterations = 0;
        const MAX = 1_000_000;
        while (this.isTruthy(await this.eval(node.condition))) {
            await this.execBlock(node.body, new Environment(this.env));
            if (++iterations > MAX) throw new Error('Infinite loop detected — touch grass and recheck your grind condition');
        }
    }

    execFuncDecl(node) {
        const fn = new RizzFunction(node.name, node.params, node.body, this.env);
        this.env.define(node.name, fn);
    }

    execClassDecl(node) {
        const methods = new Map();
        const fields = node.fields.map(f => ({ name: f.name, init: f.init }));

        // Pre-register class (allows recursion)
        const klass = new RizzClass(node.name, methods, fields);
        this.env.define(node.name, klass);

        // Build methods with current env as closure
        node.methods.forEach(m => {
            methods.set(m.name, new RizzFunction(m.name, m.params, m.body, this.env));
        });
    }

    // ─── Expression evaluation ───────────────────────────────────────────────
    async eval(node) {
        switch (node.type) {
            case 'Literal': return node.value;
            case 'Group': return await this.eval(node.expr);
            case 'Ident': return this.env.get(node.name);
            case 'UnaryExpr': return await this.evalUnary(node);
            case 'BinaryExpr': return await this.evalBinary(node);
            case 'CallExpr': return await this.evalCall(node);
            case 'MemberExpr': return await this.evalMember(node);
            case 'IndexExpr': return await this.evalIndex(node);
            case 'ArrayLiteral':
                const elements = [];
                for (const e of node.elements) elements.push(await this.eval(e));
                return elements;
            case 'ObjectLiteral': return await this.evalObject(node);
            case 'NewExpr': return await this.evalNew(node);
            case 'Assignment': return await this.evalAssign(node);
            case 'IndexAssign': return await this.evalIndexAssign(node);
            case 'MemberAssign': return await this.evalMemberAssign(node);
            default:
                throw new Error(`Unknown expression type: ${node.type}`);
        }
    }

    async evalUnary(node) {
        const val = await this.eval(node.right);
        if (node.op === '!') return !this.isTruthy(val);
        if (node.op === '-') return -val;
        throw new Error(`Unknown unary operator: ${node.op}`);
    }

    async evalBinary(node) {
        const left = await this.eval(node.left);
        const right = await this.eval(node.right);
        switch (node.op) {
            case '+': return (typeof left === 'string' || typeof right === 'string')
                ? String(left) + String(right)
                : left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/':
                if (right === 0) throw new Error('Division by zero — that math is not mathing');
                return left / right;
            case '%': return left % right;
            case '==': return left === right;
            case '!=': return left !== right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '&&': return this.isTruthy(left) && this.isTruthy(right);
            case '||': return this.isTruthy(left) || this.isTruthy(right);
            default: throw new Error(`Unknown operator: ${node.op}`);
        }
    }

    async evalCall(node) {
        const callee = await this.eval(node.callee);
        const args = [];
        for (const a of node.args) args.push(await this.eval(a));

        if (callee instanceof RizzFunction || callee instanceof BoundMethod) {
            return await callee.call(this, args);
        }
        if (callee && typeof callee.call === 'function') {
            return await callee.call(this, args);
        }
        const name = node.callee.name || node.callee.prop || '(anonymous)';
        throw new Error(`${name} is not a cook (not callable)`);
    }

    async evalMember(node) {
        const obj = await this.eval(node.object);
        const prop = node.prop;

        if (obj instanceof RizzInstance) return obj.get(prop);

        // Array built-in props
        if (Array.isArray(obj)) {
            if (prop === 'length') return obj.length;
            if (prop === 'push') return { call: async (_, a) => { obj.push(a[0]); return obj; } };
            if (prop === 'pop') return { call: async () => obj.pop() };
            if (prop === 'join') return { call: async (_, a) => obj.join(a[0] !== undefined ? a[0] : ',') };
            if (prop === 'reverse') { return { call: async () => [...obj].reverse() }; }
        }

        // String built-in props
        if (typeof obj === 'string') {
            if (prop === 'length') return obj.length;
            if (prop === 'upper') return { call: async () => obj.toUpperCase() };
            if (prop === 'lower') return { call: async () => obj.toLowerCase() };
            if (prop === 'trim') return { call: async () => obj.trim() };
            if (prop === 'split') return { call: async (_, a) => obj.split(a[0] !== undefined ? a[0] : '') };
            if (prop === 'includes') return { call: async (_, a) => obj.includes(a[0]) };
        }

        // Plain object
        if (obj && typeof obj === 'object' && prop in obj) return obj[prop];

        throw new Error(`Property "${prop}" not found`);
    }

    async evalIndex(node) {
        const obj = await this.eval(node.object);
        const index = await this.eval(node.index);
        if (Array.isArray(obj)) {
            if (typeof index !== 'number') throw new Error('Array index must be a number');
            return obj[Math.floor(index)] !== undefined ? obj[Math.floor(index)] : null;
        }
        if (obj && typeof obj === 'object') return obj[index] !== undefined ? obj[index] : null;
        if (typeof obj === 'string') return obj[Math.floor(index)] || null;
        throw new Error('Cannot index into this value');
    }

    async evalObject(node) {
        const obj = {};
        for (const p of node.props) { obj[p.key] = await this.eval(p.value); }
        return obj;
    }

    async evalNew(node) {
        const klass = this.env.get(node.className);
        if (!(klass instanceof RizzClass)) throw new Error(`"${node.className}" is not an aura (class)`);
        const args = [];
        for (const a of node.args) args.push(await this.eval(a));
        return await klass.instantiate(this, args);
    }

    async evalAssign(node) {
        const value = await this.eval(node.value);
        this.env.set(node.name, value);
        return value;
    }

    async evalIndexAssign(node) {
        const obj = await this.eval(node.object);
        const index = await this.eval(node.index);
        const value = await this.eval(node.value);
        if (Array.isArray(obj)) { obj[Math.floor(index)] = value; return value; }
        if (obj && typeof obj === 'object') { obj[index] = value; return value; }
        throw new Error('Cannot index-assign to this value');
    }

    async evalMemberAssign(node) {
        const obj = await this.eval(node.object);
        const value = await this.eval(node.value);
        if (obj instanceof RizzInstance) { obj.set(node.prop, value); return value; }
        if (obj && typeof obj === 'object') { obj[node.prop] = value; return value; }
        throw new Error('Cannot assign to property of this value');
    }

    // ─── Utilities ───────────────────────────────────────────────────────────
    isTruthy(val) {
        if (val === null || val === false || val === 0 || val === '') return false;
        return true;
    }

    stringify(val) {
        if (val === null) return 'mid';
        if (val === true) return 'bet';
        if (val === false) return 'cap';
        if (Array.isArray(val)) return '[' + val.map(v => this.stringify(v)).join(', ') + ']';
        if (val instanceof RizzInstance) return val.toString();
        if (typeof val === 'object') {
            return '{' + Object.entries(val).map(([k, v]) => `${k}: ${this.stringify(v)}`).join(', ') + '}';
        }
        return String(val);
    }
}

export { Interpreter };

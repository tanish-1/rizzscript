<div align="center">

# 🔥 RizzScript

### *"A programming language that compiles vibes, not bugs."*

[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet?style=for-the-badge)](.)
[![Language](https://img.shields.io/badge/language-Gen--Z-ff69b4?style=for-the-badge)](.)
[![Vibes](https://img.shields.io/badge/vibes-immaculate-00c853?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](.)

> Coding, but make it Gen-Z. Where logic meets internet culture.

</div>

---

## ✨ What is RizzScript?

RizzScript is a modern experimental programming language inspired by Gen-Z internet slang. It supports **real programming concepts** — variables, functions, classes, loops, conditionals, arrays, and more — wrapped in the language of the internet.

Built with a full **Lexer → Parser → AST → Interpreter** pipeline in pure Node.js.

---

## 🚀 Quick Start

### Requirements

- [Node.js](https://nodejs.org/) v14+

### Run a Program

```bash
node bin/rizz.js examples/hello.rizz
```

### Run All Examples

```bash
node bin/rizz.js examples/hello.rizz
node bin/rizz.js examples/variables.rizz
node bin/rizz.js examples/conditionals.rizz
node bin/rizz.js examples/loops.rizz
node bin/rizz.js examples/functions.rizz
node bin/rizz.js examples/classes.rizz
node bin/rizz.js examples/arrays.rizz
```

---

## 📖 Keyword Dictionary

| Keyword | Programming Meaning | Example |
|---|---|---|
| `yo fam` | Program start | `yo fam` |
| `peace out` | Program end | `peace out` |
| `ghost` | Terminate program | `ghost` |
| `vibe` | Variable declaration | `vibe x = 10` |
| `lock in` | Constant declaration | `lock in MAX = 100` |
| `spill` | Print / output | `spill "Hello"` |
| `slay` | User input | `slay name "Enter name:"` |
| `sus check` | If statement | `sus check (x > 0) { }` |
| `or nah` | Else / else-if | `or nah { }` |
| `loop the vibe` | For loop | `loop the vibe i from 0 to 5 { }` |
| `grind` | While loop | `grind x < 10 { }` |
| `cook` | Function declaration | `cook greet(name) { }` |
| `drop` | Return statement | `drop result` |
| `aura` | Class declaration | `aura Player { }` |
| `fresh` | Instantiate class | `fresh Player("Tanish", 0)` |
| `squad` | Array declaration | `squad fruits = ["apple", "mango"]` |
| `bet` | Boolean `true` | `vibe alive = bet` |
| `cap` | Boolean `false` | `vibe lost = cap` |
| `mid` | Null / default | `vibe bonus = mid` |
| `vibe check` | Debug command | `vibe check` |
| `touch grass` | Runtime error output | *(auto, line 1 of 2)* |
| `Go outside bro 🌿` | Runtime error output | *(auto, line 2 of 2)* |

---

## 📝 Syntax Guide

### Program Structure

Every RizzScript program must begin with `yo fam` and end with `peace out`.

```
yo fam

spill "Chat we coding"

peace out
```

---

### Variables & Constants

```
vibe score = 100
vibe username = "Tanish"
vibe is_alive = bet
vibe bonus = mid

lock in MAX_SCORE = 9999
```

---

### Conditional Logic

```
sus check (score >= 90) {
  spill "Main character energy"
} or nah {
  spill "Mid performance tbh"
}
```

---

### Loops

**For Loop**
```
loop the vibe i from 0 to 5 {
  spill i
}
```

**While Loop**
```
vibe xp = 0
grind xp < 100 {
  xp = xp + 10
  spill "Grinding XP: " + str(xp)
}
```

---

### Functions

```
cook greet(name) {
  spill "Yo " + name + " 👋"
}

cook add(a, b) {
  drop a + b
}

greet("Chat")
vibe result = add(10, 20)
spill "Result: " + str(result)
```

---

### Classes

```
aura Player {
  vibe name
  vibe score

  cook init(player_name, start_score) {
    self.name  = player_name
    self.score = start_score
  }

  cook intro() {
    spill "Player: " + self.name
    spill "Score:  " + str(self.score)
  }

  cook gain_xp(amount) {
    self.score = self.score + amount
  }
}

vibe p1 = fresh Player("Tanish", 0)
p1.intro()
p1.gain_xp(50)
```

---

### Arrays

```
squad fruits = ["apple", "banana", "mango"]

spill fruits[0]
spill len(fruits)

push(fruits, "cherry")
vibe removed = pop(fruits)

loop the vibe i from 0 to len(fruits) {
  spill fruits[i]
}
```

---

### Debug Command

```
vibe check
```

Output:
```
System aura: immaculate
```

---

## ⚠️ Error Handling

Whenever an error occurs (syntax or runtime), RizzScript outputs:

```
touch grass
Go outside bro 🌿
```

These two lines are always printed **individually** — they are separate messages, not one combined string.

Enable debug mode to see the underlying error message:

```bash
RIZZ_DEBUG=1 node bin/rizz.js yourfile.rizz
```

---

## 🔢 Operators

| Category | Operators |
|---|---|
| Arithmetic | `+` `-` `*` `/` `%` |
| Comparison | `==` `!=` `<` `>` `<=` `>=` |
| Logical | `&&` `\|\|` `!` |
| Assignment | `=` |
| String concat | `+` (auto-coerces to string) |

---

## 🏗️ Built-in Functions

| Function | Description |
|---|---|
| `len(arr)` | Returns length of array or string |
| `str(val)` | Converts value to string |
| `num(val)` | Converts string to number |
| `push(arr, val)` | Appends value to array |
| `pop(arr)` | Removes and returns last element |

---

## 🧠 Interpreter Architecture

```
Source Code (.rizz)
        ↓
    Lexer (src/lexer.js)
    Multi-word keyword scanning
    Token stream output
        ↓
    Parser (src/parser.js)
    Recursive descent
    AST construction
        ↓
  Abstract Syntax Tree
        ↓
  Interpreter (src/interpreter.js)
  Environment chaining
  Tree-walk evaluation
        ↓
   Program Output
```

---

## 📁 Project Structure

```
rizzscript/
├── bin/
│   └── rizz.js          # CLI runner
├── src/
│   ├── lexer.js         # Tokenizer
│   ├── parser.js        # AST parser
│   ├── interpreter.js   # Tree-walk interpreter
│   └── errors.js        # touch grass error handler
├── examples/
│   ├── hello.rizz       # Hello world
│   ├── variables.rizz   # Variables & constants
│   ├── conditionals.rizz
│   ├── loops.rizz       # loop the vibe & grind
│   ├── functions.rizz
│   ├── classes.rizz
│   ├── arrays.rizz
│   └── errors.rizz      # Error demo
└── package.json
```

---

## 🗺️ Roadmap

| Feature | Status |
|---|---|
| Lexer + Parser | ✅ Done |
| Tree-walk interpreter | ✅ Done |
| Variables, constants | ✅ Done |
| Conditionals (sus check / or nah) | ✅ Done |
| For loop (loop the vibe) | ✅ Done |
| While loop (grind) | ✅ Done |
| Functions + closures | ✅ Done |
| Classes + self | ✅ Done |
| Arrays + built-ins | ✅ Done |
| Error handler (touch grass) | ✅ Done |
| Debug command (vibe check) | ✅ Done |
| User input (slay) | ✅ Done |
| CLI runner (rizz run) | 🔜 Planned |
| Package / module system | 🔜 Planned |
| Standard library | 🔜 Planned |
| VS Code syntax highlighting | 🔜 Planned |
| Web playground | 🔜 Planned |
| REPL (interactive mode) | 🔜 Planned |

---

## 📜 License

MIT — use it, fork it, keep the vibes immaculate.

---

<div align="center">
Made with maximum rizz ✨
</div>

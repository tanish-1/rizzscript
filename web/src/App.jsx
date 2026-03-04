
import React, { useState, useEffect, useRef } from 'react';
import { Lexer } from './rizz/lexer';
import { Parser } from './rizz/parser';
import { Interpreter } from './rizz/interpreter';
import { EXAMPLES } from './constants/examples';
import './App.css';

function App() {
    const [code, setCode] = useState(EXAMPLES["Hello World"]);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedExample, setSelectedExample] = useState("Hello World");
    const consoleEndRef = useRef(null);

    const scrollToBottom = () => {
        consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [output, isRunning]);

    const runCode = async () => {
        setOutput([]);
        setIsRunning(true);

        // Minimal delay to ensure UI updates before heavy lifting
        await new Promise(r => setTimeout(r, 10));

        const logs = [];
        const onLog = (msg) => {
            logs.push(msg);
            setOutput([...logs]);
        };
        const onInput = async (prompt) => {
            const input = window.prompt(prompt);
            return input || "";
        };

        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            const parser = new Parser(tokens);
            const ast = parser.parse();

            const interpreter = new Interpreter(ast, { onLog, onInput });
            await interpreter.run();
        } catch (err) {
            setOutput(prev => [...prev, `L ERR: ${err.message}`, "touch grass", "Go outside bro 🌿"]);
        } finally {
            setIsRunning(false);
        }
    };

    const loadExample = (name) => {
        setCode(EXAMPLES[name]);
        setSelectedExample(name);
        setOutput([]);
    };

    return (
        <div className="playground-container no-sidebar">
            <div className="main-content">
                <header className="playground-header">
                    <div className="logo">
                        <span className="emoji">🔥</span>
                        <h1>RizzScript <small>Playground</small></h1>
                    </div>
                    <div className="header-actions">
                        <button
                            className="clear-button"
                            onClick={() => setOutput([])}
                            disabled={isRunning || output.length === 0}
                        >
                            CLEAR CONSOLE
                        </button>
                        <button
                            className={`run-button ${isRunning ? 'pulse' : ''}`}
                            onClick={runCode}
                            disabled={isRunning}
                        >
                            {isRunning ? 'COOKING...' : 'RUN VIBES ▶'}
                        </button>
                    </div>
                </header>

                <main className="editor-layout">
                    <div className="panel editor-panel">
                        <div className="panel-header">
                            <span>SOURCE CODE (.rizz)</span>
                            <span className="file-status">Modified</span>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck="false"
                            className="code-editor"
                            placeholder="Type your rizz here..."
                        />
                    </div>

                    <div className="panel output-panel">
                        <div className="panel-header">OUTPUT CONSOLE</div>
                        <div className="console-display">
                            {output.length === 0 && !isRunning && (
                                <div className="placeholder">Click RUN to see the magic happen...</div>
                            )}
                            {output.map((line, i) => (
                                <div key={i} className={`console-line ${line.startsWith('L ') ? 'error' : ''}`}>
                                    {line}
                                </div>
                            ))}
                            {isRunning && <div className="console-line shimmer">System is cooking...</div>}
                            <div ref={consoleEndRef} />
                        </div>
                    </div>
                </main>

                <footer className="playground-footer">
                    Built with maximum rizz ✨ | v1.0.0
                </footer>
            </div>
        </div>
    );
}

export default App;

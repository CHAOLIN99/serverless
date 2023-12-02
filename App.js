import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [isResult, setIsResult] = useState(false);
  const azureFunctionUrl = 'https://severlesslab2023.azurewebsites.net/api/HttpFun';

  const handleInput = useCallback((value) => {
    setInput((prevInput) => (isResult ? value : prevInput + value));
    setIsResult(false);
  }, [isResult]);

  const handleOperationClick = useCallback((operation) => {
    if (!isResult && !['+', '-', '*', '/'].includes(input.slice(-1))) {
      setInput(input + operation);
    } else if (isResult) {
      setInput(input);
    }
    setIsResult(false);
  }, [input, isResult]);

  const handleClear = useCallback(() => {
    setInput('');
    setIsResult(false);
  }, []);

  const handleDelete = useCallback(() => {
    setInput(input.slice(0, -1));
  }, [input]);

  const handleEqual = useCallback(async () => {
    if (input.trim() === '') return;
    try {
      const response = await fetch(azureFunctionUrl, {
        method: 'POST',
        body: JSON.stringify({ expression: input }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setInput(data.result.toString());
      setIsResult(true);
    } catch (error) {
      console.error('Error calling Azure Function:', error);
      setInput('Error');
      setIsResult(true);
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleEqual();
      } else if (event.key === 'Backspace') {
        handleDelete();
      } else if (event.key === 'Escape') {
        handleClear();
      } else {
        const button = event.key.match(/[0-9+\-*/.]/);
        if (button) {
          handleInput(button[0]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete, handleEqual, handleInput, handleClear]);

  return (
    <div className="App">
      <div className="display">{input || "0"}</div>
      <div className="button-container">
        {'7894561230.'.split('').map(number => (
          <button key={number} onClick={() => handleInput(number)}>{number}</button>
        ))}
        <button onClick={() => handleOperationClick('+')}>+</button>
        <button onClick={() => handleOperationClick('-')}>-</button>
        <button onClick={() => handleOperationClick('*')}>*</button>
        <button onClick={() => handleOperationClick('/')}>/</button>
        <button onClick={handleEqual}>=</button>
        <button onClick={handleClear}>AC</button>
      </div>
    </div>
  );
}

export default App;

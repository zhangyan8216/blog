---
title: React Hooks 完全指南
date: 2026-02-02
tags: [React, Hooks, 前端, 教程]
---

# React Hooks 完全指南

React Hooks 是 React 16.8 中引入的新特性，它允许我们在函数组件中使用状态和其他 React 特性。本文将详细介绍 React Hooks 的使用方法和最佳实践。

## 1. useState Hook

`useState` 是最基本的 Hook，用于在函数组件中添加状态：

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### 特点

- 接受初始状态作为参数
- 返回一个数组，包含当前状态和更新状态的函数
- 更新函数可以接受新值或函数

## 2. useEffect Hook

`useEffect` 用于处理副作用，如数据获取、订阅或手动修改 DOM：

```jsx
import React, { useState, useEffect } from 'react';

function DataFetching() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.example.com/data');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // 清理函数
    return () => {
      // 清理代码，如取消订阅
    };
  }, []); // 空依赖数组表示只在组件挂载和卸载时执行

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 依赖数组

- 空数组 `[]`：只在组件挂载和卸载时执行
- 包含变量：当这些变量变化时执行
- 不提供：每次渲染都执行

## 3. useContext Hook

`useContext` 用于访问 React 的 Context API：

```jsx
import React, { useContext } from 'react';

const ThemeContext = React.createContext('light');

function ThemeButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button style={{ 
      background: theme === 'dark' ? '#333' : '#fff',
      color: theme === 'dark' ? '#fff' : '#333'
    }}>
      {theme === 'dark' ? 'Dark' : 'Light'} Theme
    </button>
  );
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemeButton />
    </ThemeContext.Provider>
  );
}
```

## 4. useReducer Hook

`useReducer` 是 `useState` 的替代方案，适用于复杂的状态逻辑：

```jsx
import React, { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

## 5. useCallback Hook

`useCallback` 用于记忆函数，避免不必要的重新渲染：

```jsx
import React, { useState, useCallback } from 'react';

function ChildComponent({ onButtonClick }) {
  console.log('Child component re-rendered');
  return <button onClick={onButtonClick}>Click me</button>;
}

function ParentComponent() {
  const [count, setCount] = useState(0);

  // 使用 useCallback 记忆函数
  const handleButtonClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // 空依赖数组

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ChildComponent onButtonClick={handleButtonClick} />
    </div>
  );
}
```

## 6. useMemo Hook

`useMemo` 用于记忆计算结果，避免不必要的重新计算：

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveCalculation({ value }) {
  const result = useMemo(() => {
    console.log('Performing expensive calculation...');
    let sum = 0;
    for (let i = 0; i < 1000000000; i++) {
      sum += i;
    }
    return sum + value;
  }, [value]); // 只在 value 变化时重新计算

  return <p>Result: {result}</p>;
}

function App() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
      <p>Value: {value}</p>
      <button onClick={() => setValue(value + 1)}>Increment Value</button>
      <ExpensiveCalculation value={value} />
    </div>
  );
}
```

## 7. useRef Hook

`useRef` 用于创建一个可变的 ref 对象，在组件的整个生命周期内保持不变：

```jsx
import React, { useRef, useEffect } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    // 直接访问 DOM 元素
    inputEl.current.focus();
  };

  useEffect(() => {
    // 访问 ref
    console.log(inputEl.current);
  }, []);

  return (
    <div>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </div>
  );
}
```

## 8. 自定义 Hook

我们可以创建自己的自定义 Hook 来复用逻辑：

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 从 localStorage 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 监听变化并更新 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// 使用自定义 Hook
function App() {
  const [name, setName] = useLocalStorage('name', '');

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Hello, {name}!</p>
    </div>
  );
}
```

## 9. Hooks 规则

使用 Hooks 时需要遵循以下规则：

1. **只在函数组件的顶层使用 Hooks**
   - 不要在条件语句、循环或嵌套函数中使用 Hooks

2. **只在函数组件或自定义 Hook 中使用 Hooks**
   - 不要在普通 JavaScript 函数中使用 Hooks

3. **使用 eslint-plugin-react-hooks 检查规则**
   - 可以在 ESLint 配置中添加此插件来自动检查 Hooks 规则的遵守情况

## 10. 最佳实践

1. **使用适当的 Hook**
   - 简单状态使用 `useState`
   - 复杂状态使用 `useReducer`
   - 副作用使用 `useEffect`
   - 避免重复渲染使用 `useCallback` 和 `useMemo`

2. **合理使用依赖数组**
   - 只包含真正需要的依赖
   - 避免循环依赖

3. **自定义 Hook 命名**
   - 自定义 Hook 应该以 `use` 开头
   - 命名应该清晰表达 Hook 的功能

4. **代码组织**
   - 相关的 state 和 effect 应该放在一起
   - 复杂的逻辑应该提取到自定义 Hook 中

## 结论

React Hooks 为我们提供了一种更简洁、更优雅的方式来编写 React 组件。通过合理使用各种 Hook，我们可以编写更加模块化、可维护的代码。

希望本文对您理解和使用 React Hooks 有所帮助！
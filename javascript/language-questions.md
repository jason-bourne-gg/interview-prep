# JavaScript language questions

The ones that come up in the same loop as the algorithms, usually as a warm-up
or a "let's talk about JS for ten minutes" round.

---

## Closures

A closure is a function plus the variables it captured from where it was
*defined*, not where it is called.

```js
function counter() {
  let n = 0
  return () => ++n
}
const next = counter()
next()   // 1
next()   // 2
```

`n` survives because the returned function still references it.

**The loop question** — see pitfall 19. `var` is function-scoped so all closures
share one binding; `let` creates a fresh binding per iteration.

**Why it matters in practice:** private state without classes, memoisation,
and every `useState` in React.

## `this`

`this` is decided by *how a function is called*, with one exception.

| Call | `this` |
|---|---|
| `obj.fn()` | `obj` |
| `fn()` | `undefined` (strict) / `globalThis` (sloppy) |
| `new Fn()` | the new object |
| `fn.call(x)` / `.apply(x)` / `.bind(x)` | `x` |
| arrow function | **lexical** — whatever `this` was where it was written |

The classic bug:

```js
class Timer {
  constructor() { this.n = 0 }
  start() { setInterval(function () { this.n++ }, 1000) }   // ✗ this is not the Timer
  start() { setInterval(() => { this.n++ }, 1000) }         // ✅ arrow captures lexically
}
```

Arrow functions have no `this`, no `arguments`, and cannot be `new`ed.

## The event loop

JS is single-threaded. The loop runs: **call stack → microtasks (all of them) →
one macrotask → repeat**.

- **Microtasks:** promise callbacks, `queueMicrotask`, `MutationObserver`
- **Macrotasks:** `setTimeout`, `setInterval`, I/O, rendering

```js
console.log('1')
setTimeout(() => console.log('2'))
Promise.resolve().then(() => console.log('3'))
console.log('4')
// 1, 4, 3, 2
```

`3` beats `2` because the whole microtask queue drains before the next macrotask.

**The trap:** an infinite microtask chain starves the macrotask queue and the
page never repaints.

`setTimeout(fn, 0)` does not run in 0 ms — it runs after the current task and all
microtasks, with a ~4 ms floor after nesting.

## Prototypes

Every object has a hidden link (`[[Prototype]]`) to another object. A property
miss walks up that chain until `null`.

```js
class Animal { speak() { return 'generic' } }
class Dog extends Animal { speak() { return 'woof' } }

const d = new Dog()
Object.getPrototypeOf(d) === Dog.prototype           // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype  // true
```

`class` is syntax over this; it is not a different system.

**`__proto__` vs `prototype`:** `prototype` is a property on *constructor
functions* — the object that instances will link to. `__proto__` is the link on
an *instance*. Prefer `Object.getPrototypeOf`.

## `var` / `let` / `const`

| | Scope | Hoisted | Reassign | TDZ |
|---|---|---|---|---|
| `var` | function | yes, as `undefined` | yes | no |
| `let` | block | yes, but unusable | yes | yes |
| `const` | block | yes, but unusable | no | yes |

The **temporal dead zone** is why this throws rather than printing `undefined`:

```js
console.log(x)   // ReferenceError
let x = 1
```

`const` freezes the *binding*, not the value: `const a = []; a.push(1)` is fine.

## Shallow vs deep copy

```js
const shallow = { ...obj }              // nested objects still shared
const shallow = Object.assign({}, obj)  // same
const deep = structuredClone(obj)       // ✅ handles Map, Set, Date, cycles
const deep = JSON.parse(JSON.stringify(obj))   // loses undefined, Date, Map, functions
```

## Debounce and throttle

Asked constantly, and worth being able to write cold.

```js
const debounce = (fn, ms) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

const throttle = (fn, ms) => {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= ms) { last = now; fn(...args) }
  }
}
```

**Debounce** waits for quiet — search-as-you-type. **Throttle** caps the rate —
scroll handlers.

## `map` / `filter` / `reduce`

```js
arr.reduce((acc, x) => acc + x, 0)
arr.reduce((acc, x) => { (acc[x] ??= []).push(x); return acc }, {})   // group by
```

Always pass the initial value — `reduce` on an empty array without one throws.

## Promises

```js
Promise.all([a, b])          // all succeed, or reject on the first failure
Promise.allSettled([a, b])   // never rejects; array of {status, value|reason}
Promise.race([a, b])         // first to settle, success or failure
Promise.any([a, b])          // first to SUCCEED; rejects only if all fail
```

`Promise.all` is the usual answer; `allSettled` is the one that shows you have
thought about partial failure.

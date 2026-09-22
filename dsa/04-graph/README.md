# Graph — 8 problems

| # | Problem | Difficulty | Brute | Optimal | Pattern |
|---|---|---|---|---|---|
| 27 | [Clone Graph](27-clone-graph.js) | Medium | O(V+E), two passes | **O(V+E), one pass** | BFS / DFS |
| 28 | [Course Schedule](28-course-schedule.js) | Medium | O(V·E) | **O(V+E)** | Topological sort |
| 29 | [Pacific Atlantic Water Flow](29-pacific-atlantic-water-flow.js) | Medium | O((m·n)²) | **O(m·n)** | Multi-source BFS / DFS |
| 30 | [Number of Islands](30-number-of-islands.js) | Medium | O(m·n), recursive | **O(m·n), iterative** | Flood fill |
| 31 | [Longest Consecutive Sequence](31-longest-consecutive-sequence.js) | Medium | O(n log n) | **O(n)** | Hash set |
| 32 | [Alien Dictionary](32-alien-dictionary.js) | Hard | O(k!·L) | **O(V+E)** | Topological sort |
| 33 | [Graph Valid Tree](33-graph-valid-tree.js) | Medium | O(n+e), traversal | **O(e·α(n))** | Union-find |
| 34 | [Number of Connected Components](34-number-of-connected-components.js) | Medium | O(n+e), traversal | **O(e·α(n))** | Union-find |

Run any file directly to check it: `node dsa/04-graph/28-course-schedule.js`

---

## What this category is really teaching

**Four of these eight are the same three lines.** Islands, Connected Components,
Clone Graph and Pacific Atlantic are all: keep a visited set, start a traversal
at every unvisited thing, mark on discovery. What changes between them is only
what the outer loop counts and what a neighbour is — a grid offset, a stored
reference, a list of edges. Once you see that, the four collapse into one.

**Two are topological sort, and they are the same problem in disguise.** Course
Schedule asks whether an order exists; Alien Dictionary asks what it is. Both
run Kahn's algorithm, and in both, cycle detection is not extra code — it is the
count. Emit fewer nodes than exist and something never reached indegree zero,
which means something in a cycle always still precedes it. The Alien Dictionary
half of the work is not the sort at all, it is deriving the edges: only adjacent
words carry information, and only up to their first differing letter.

**Two are union-find, and that is the point of asking them.** Graph Valid Tree
and Connected Components can both be answered with a traversal, and an
interviewer who asks them wants to see `union()` return `false` and hear you say
"they were already connected, so this edge closes a cycle". Union-find also
answers the streaming version — edges arriving one at a time, count correct
after each — which no traversal does without starting over.

**Two hinge on reversing the question.** Pacific Atlantic gets stuck at
O((m·n)²) while you ask "where does this cell drain to". Start at the ocean and
climb, and the m·n searches become two. Longest Consecutive Sequence is stuck at
O(n²) while you count from every number, and one guard — only start when `n-1`
is absent — makes it linear.

**One is not a graph problem.** Longest Consecutive Sequence is filed here in the
original list, and there is no graph in it. It is a hash set problem. Solve it as
one, and be ready to say that the O(n log n) sort is the answer the constraint
was written to exclude.

## BFS or DFS

Where both work, both are written out here, because the choice is not a matter
of taste in JavaScript.

- **DFS recursive** is shorter and reads better. Its depth is the length of the
  longest path, and V8 gives up at roughly 10,000 frames.
- **BFS iterative**, or DFS with an explicit stack, has no such ceiling.

That ceiling is not theoretical on these inputs. A 200×200 grid that is all land
is one component of 40,000 cells, and Number of Islands recurses right through
every one of them. Same for a graph that happens to be a long chain. Identical
complexity on paper, and only one of them returns an answer.

The exception is Alien Dictionary: its graph has at most 26 nodes, so recursion
is safe there and the DFS version is the one to write on a whiteboard.

## The JS-specific traps in this category

- **`Array(n).fill([])` gives you one array, n times.** Every row is the same
  object, so pushing to `graph[0]` pushes to all of them. Use
  `Array.from({ length: n }, () => [])`. This silently produces a graph where
  everything is connected to everything.

- **`queue.shift()` is O(n).** A textbook BFS written with `shift()` is O(n²) on
  the queue alone. Every BFS in this folder walks an index instead:

  ```js
  for (let i = 0; i < queue.length; i++) { /* queue.push(...) inside is fine */ }
  ```

- **Mark visited on enqueue, not on dequeue.** A cell with four land neighbours
  gets pushed four times otherwise, and the queue is no longer bounded by the
  grid size.

- **Arrays as Map or Set keys never match.** `new Set([[0,1]]).has([0,1])` is
  `false` — two different array objects. Encode grid cells as `r * cols + c`, or
  as a string, or use a 2-D boolean array.

- **Objects as Map keys match by identity, and that is exactly what Clone Graph
  needs.** Keying the old-to-new map by `node.val` breaks the moment two nodes
  share a value; keying by the node object is correct and is why the map works.

- **`[...grid]` copies the outer array only.** The rows are still shared, so a
  flood fill through the copy destroys the caller's grid. Use
  `grid.map(row => [...row])`.

- **Undirected edges are stored twice**, so walking back the way you came looks
  like a cycle. Graph Valid Tree needs a parent guard for that; Connected
  Components does not, because revisiting a node there is not an error.

See [javascript/pitfalls.md](../../javascript/pitfalls.md) for the full list.

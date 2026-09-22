# HLD — 10 problems

Ranked by how often they recur across the sources people actually use: Alex Xu
Vol 1 & 2, ByteByteGo, `donnemartin/system-design-primer` (371k★),
`karanpratapsingh/system-design`, Hello Interview, and Gaurav Sen's playlist.

| # | Problem | Recurs in | The thing it's really testing |
|---|---|---|---|
| 1 | [URL shortener](01-url-shortener.md) | 6/7 | Key generation, read-heavy caching |
| 2 | [News feed / Twitter](02-news-feed.md) | 7/7 | Fan-out on write vs read, celebrities |
| 3 | [Chat system / WhatsApp](03-chat-system.md) | 7/7 | WebSockets, ordering, delivery guarantees |
| 4 | [Rate limiter](04-rate-limiter.md) | 4/7 | Distributed counters, algorithm choice |
| 5 | [Video streaming / YouTube](05-video-streaming.md) | 5/7 | Transcoding pipeline, CDN, ABR |
| 6 | [Uber / proximity](06-ride-hailing.md) | 5/7 | Geospatial indexing, matching, state |
| 7 | [Key-value store](07-key-value-store.md) | 5/7 | Partitioning, quorum, replication |
| 8 | [Web crawler](08-web-crawler.md) | 4/7 | Frontier, politeness, dedup at scale |
| 9 | [Notification system](09-notification-system.md) | 3/7 | Multi-channel, retries, dedup |
| 10 | [LLM application platform](10-llm-application.md) | new | Streaming, GPU economics, evals |

**Two deliberate choices.** Consistent hashing appears in as many sources as
some of these, but it is a *primitive*, not a product — it lives in
[fundamentals](../fundamentals.md). Its slot went to designing an LLM product,
which is the clearest change to this round since 2024.

**Read [the framework](../framework.md) first.** Every write-up below assumes the
four phases and skips straight to the substance.

**The other round:** [LLD — 11 problems](../lld/).

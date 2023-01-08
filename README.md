## [`@bunsvr/core`](https://bunsvr.netlify.app/modules/_bunsvr_core.html)
The core server of [BunSVR](https://github.com/bunsvr) which aims to be fast.

```typescript
import { App } from "@bunsvr/core";

// Create a new app
const app = new App();

// Use a middleware
app.use(async () => new Response("Hello world!"));

// Set port and hostname
app.port = 8080;
app.hostname = "127.0.0.1";

// Serve using bun
export default app;
```

See more examples [here](https://github.com/bunsvr/core/tree/main/assets/examples).



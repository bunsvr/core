The core server of [StricJS](https://github.com/bunsvr) which aims to be fast.

```typescript
import { App } from "@stricjs/core";

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

See more examples [here](/assets/examples).



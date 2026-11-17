# CART3R Roblox Username Scanner

A mobile-first web app that generates random 3–4 character candidates and checks them through Roblox's public username validation endpoint.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000.

## Use on a phone

The app is responsive and includes a web app manifest and service worker. To install it on a phone, deploy it to an HTTPS host, open the deployed URL in Safari/Chrome, then use the browser's Add to Home Screen / Install option.

## Important limitations

- This checks generated candidates in batches; it does not instantly enumerate every possible username.
- Roblox controls the validation endpoint and may change its response codes, availability rules, or rate limits.
- An `AVAILABLE` result is not a guarantee. A name can become unavailable before you claim it.
- The app deliberately paces checks and stops on rate limiting. Do not remove these protections or send high-volume requests.
- Roblox's username rules still apply; the API is the final authority.

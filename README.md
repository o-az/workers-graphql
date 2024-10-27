# GraphQL Server on Cloudflare Workers

<p align="center">
  <img src="./.github/images/cover.png" alt="cover" height="275" width="450" />
</p>

<h1 align="center" style="font-size: 2.75rem; font-weight: 900; color: white;">
  GraphQL on Cloudflare Workers
</h1>


Fast 💨<br />
Smooth 🧈<br />
& globally distributed GraphQL Server 🌐<br />
deployed at the edge using Cloudflare Workers 🔶

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/o-az/workers-graphql)
___
> [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server/docs) - [Hono](https://hono.dev) - [GraphQL Playground](https://github.com/graphql/graphiql) - [GitHub Actions](https://github.com/features/actions) - Automatic Deployments on push to `main`
___

## Usage

### Development

locally:

```bash
pnpm install
pnpm dev
```

in browser:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/o-az/workers-graphql)

### GraphiQL Playground

[workers-graphql.evm.workers.dev/graphiql](https://workers-graphql.evm.workers.dev/graphql)

### Example Requests (query with `POST` and `GET`)

Simple query:

```bash
# POST request
curl --request POST \
  --url https://workers-graphql.evm.workers.dev/graphql \
  --header 'content-type: application/json' \
  --data '{ "query": "{ health }" }'
```

```bash
# GET request
curl --request GET \
  --url 'https://workers-graphql.evm.workers.dev/graphql?query=%7B+health+%7D'
```

### Example Subscription

```graphql
subscription {
  countdown(from: 3)
}
```

```bash
# GET request
curl --request GET \
  --header 'Accept: text/event-stream' \
  --url 'https://workers-graphql.evm.workers.dev/graphql?query=subscription%7Bcountdown%28from%3A3%29%7D'

# output

# event: next
# data: {"data":{"countdown":3}}

# event: next
# data: {"data":{"countdown":2}}

# event: next
# data: {"data":{"countdown":1}}

# event: next
# data: {"data":{"countdown":0}}

# event: complete
```

### Introspection

`.graphql` schema:

```sh
pnpm dlx @graphql-inspector/cli \
  introspect https://workers-graphql.evm.workers.dev/graphql \
  --write schema.graphql
# or npx, or yarn dlx, or bunx
```

`.json` schema:

```sh
pnpm dlx @graphql-inspector/cli \
  introspect https://workers-graphql.evm.workers.dev/graphql \
  --write schema.json
# or npx, or yarn dlx, or bunx
```

### Example Response Caching

I manually set the resolver of this query to take 5 seconds for the first request.
Then subsequent requests will be served from the cache for the next n seconds.

To find out how long the cache is set to, search for `@cacheControl` in [./src/graphql.ts](./src/graphql.ts).

To try this, visit [workers-graphql.evm.workers.dev/graphql?query=%7B+slow+%7D](https://workers-graphql.evm.workers.dev/graphql?query=%7B+slow+%7D) in the browser, run the query, notice the slowness, and then run it again a few times to see the cache in action.

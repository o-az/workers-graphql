# GraphQL Server on Cloudflare Workers

Fast 💨<br />
Smooth 🧈<br />
& globally distributed GraphQL Server 🌐<br />
deployed at the edge using Cloudflare Workers 🔶
___
[GraphQL Yoga](https://the-guild.dev/graphql/yoga-server/docs) - [Hono](https://hono.dev) - [GraphQL Playground](https://github.com/graphql/graphiql) - [GitHub Actions](https://github.com/features/actions) - Automatic Deployments on push to `main`
___

## Usage

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

Testing response caching

I manually set the resolver of this query to take 5 seconds for the first request.
Then subsequent requests will be served from the cache for the next n seconds.

To find out how long the cache is set to, search for `@cacheControl` in [./src/index.ts](./src//index.ts).

```bash
# first request
curl --request POST \
  --url https://workers-graphql.evm.workers.dev/graphql \
  --header 'content-type: application/json' \
  --data '{ "query": "{ slow }" }'
```

```bash
# subsequent requests
curl --request POST \
  --url https://workers-graphql.evm.workers.dev/graphql \
  --header 'content-type: application/json' \
  --data '{ "query": "{ slow }" }'
```

### Introspection

`.graphql` schema:

```sh
bunx @graphql-inspector/cli \
  introspect https://workers-graphql.evm.workers.dev/graphql \
  --write schema.graphql
```

`.json` schema:

```sh
bunx @graphql-inspector/cli \
  introspect https://workers-graphql.evm.workers.dev/graphql \
  --write schema.json
```

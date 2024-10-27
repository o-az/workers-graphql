<p align="center">
  <img
    alt="hono"
    width="150"
    src="./.github/images/hono.svg"
  />
  <img
    width="250"
    alt="cloudflare-workers"
    src="./.github/images/cloudflare-workers.svg"
    style="margin: 0 -50px;mask-image:url('./.github/images/cloudflare-workers.svg');mask-size:contain;"
  />
  <img
    width="194"
    alt="graphql"
    src="./.github/images/graphql.svg"
  />
</p>

<h1 align="center" style="font-size: 2.75rem; font-weight: 900; color: white;">
  GraphQL on Cloudflare Workers
</h1>

<br />

> Fast 💨 ([hono benchmarks](https://hono.dev/docs/concepts/benchmarks) - [yoga benchmarks](https://github.com/ardatan/graphql-server-benchmarks/tree/federation#apollo-federation-server-benchmarks)), maximally extensible 🔗, globally distributed 🌐, deployed at the edge using Cloudflare Workers 🔶
<br />

<p align="center">

| One Click Deploy | Instant Development |
| ---------------- | ------------------- |
| [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/o-az/workers-graphql) | [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/o-az/workers-graphql) |

</p>

[Hono](https://hono.dev) as a base router, [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server/docs) server, runs on [Cloudflare Workers](https://developers.cloudflare.com/workers) runtime.<br />

This stack is maximally extensible. To extend the GraphQL server functionalities, see [Envelop Plugins](https://the-guild.dev/graphql/envelop/plugins) – there's a plugin for everything you need. To extend Hono (the router), see the list of [middlewares](https://hono.dev/docs/middleware/third-party) – on the left side menu is the list of official middlewares and on the page itself is a list of community middlewares.<br />

### Local Development

Clone the repo and install dependencies:

```bash
gh repo clone o-az/workers-graphql
cd workers-graphql

# if you don't have github cli `gh`, you should
# git clone https://github.com/o-az/workers-graphql
```

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

## Usage

examples on how to query, subscribe, access playground, introspect, see cache, etc.

### GraphiQL Playground

[workers-graphql.evm.workers.dev/graphiql](https://workers-graphql.evm.workers.dev/graphql)

### Query Request Examples

Usually GraphQL queries are sent as `POST` requests but here we can also send them as `GET` requests. We `encodeURIComponent` the query and add it to the URL as a query parameter. `GET` example:

```bash
curl --request GET \
  --url 'https://workers-graphql.evm.workers.dev/graphql?query=%7B+health+%7D'
```

Classic `POST` example:

```bash
curl --request POST \
  --url https://workers-graphql.evm.workers.dev/graphql \
  --header 'content-type: application/json' \
  --data '{ "query": "{ health }" }'
```

### Subscription Request Example

```graphql
subscription {
  countdown(from: 3)
}
```

Notice the `Accept: text/event-stream` header.

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

You can also introspect with a `curl` request:

```bash
# assuming you have jq installed
curl --silent --location \
    --request POST \
    --url 'https://workers-graphql.evm.workers.dev/graphql' \
    --header 'Content-Type: application/json' \
    --data '{"query":"query IntrospectionQuery { __schema { description queryType { name description } mutationType { name description } subscriptionType { name description } types { ...FullType } directives { name description locations args { ...InputValue } } } } fragment FullType on __Type { kind name description fields(includeDeprecated: true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef } } fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue } fragment TypeRef on __Type { kind name description ofType { kind name description ofType { kind name description ofType { kind name description ofType { kind name description ofType { kind name description ofType { kind name description ofType { kind name description } } } } } } } }","variables":{}}' \
    | jq '.data' > schema.json
```

### Response Caching Example

I manually set the resolver of this query to take 5 seconds for the first request.
Then subsequent requests will be served from the cache for the next n seconds.

To find out how long the cache is set to, search for `@cacheControl` in [./src/graphql.ts](./src/graphql.ts).

To try this, visit [workers-graphql.evm.workers.dev/graphql?query=%7B+slow+%7D](https://workers-graphql.evm.workers.dev/graphql?query=%7B+slow+%7D) in the browser.

Run the query, notice the slowness, and then run it again a few times to see the cache in action.

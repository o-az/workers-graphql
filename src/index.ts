import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { timeout } from 'hono/timeout'
import { requestId } from 'hono/request-id'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { HTTPException } from 'hono/http-exception'
import { createSchema, createYoga } from 'graphql-yoga'
import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { cacheControlDirective } from '@graphql-yoga/plugin-response-cache'
import { useImmediateIntrospection } from '@envelop/immediate-introspection'

const typeDefs = /* graphql */ `
  # the directive needs to be defined in the schema
  ${cacheControlDirective}

  type Query {
    health: String
    slow: String @cacheControl(maxAge: 3600000) # 1 hour
  }

  type Subscription {
    countdown(from: Int!): Int!
  }
`

const schema = createSchema({
  typeDefs: () => typeDefs,
  resolvers: {
    Query: {
      health: () => `OK`,
      /**
       * simulate a slow query
       * running this for the first time will take 5 seconds
       * subsequent requests will be instant, served from the cache
       *
       * cache is set with the `useResponseCache` plugin
       */
      slow: async () => {
        await new Promise(resolve => setTimeout(resolve, 5_000))
        return "I'm slow"
      }
    },
    Subscription: {
      countdown: {
        subscribe: async function* (_, { from }) {
          for (let index = from; index >= 0; index--) {
            await new Promise(resolve => setTimeout(resolve, 1_000))
            yield { countdown: index }
          }
        }
      }
    }
  }
})

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  graphiql: {
    disableTabs: true,
    title: 'workers-graphql',
    defaultQuery: /* graphql */ `{ health }`
  },
  plugins: [
    useResponseCache({
      enabled: _ => true,
      session: _ => null
      // ttl: 1_000 * 10 // 10 seconds
    }),
    useImmediateIntrospection()
  ]
})

const app = new Hono<{ Bindings: Env }>()

app.use(prettyJSON())
app.use(secureHeaders())
app.use('*', requestId())
app.use('*', timeout(5_000))

app.on(['GET', 'POST'], '/', _ => new Response('zkgm'))
app.get('/graphiql', context => context.redirect('/graphql'))
app.all('/health', _context => new Response('OK', { status: 200 }))

app.notFound(context => {
  const report = `environment: ${context.env.ENVIRONMENT}\nid: ${context.get('requestId')}`
  const message = `if this is unexpected, open an issue and include everything under this line\n\n${report}`
  return new Response(`zkgn 🐻🐻 📉📉\n\n${message}`, { status: 404 })
})

app.onError((error, context) => {
  const report = `environment: ${context.env.ENVIRONMENT}\nid: ${context.get('requestId')}\nerror: ${error.message}`
  const message = `if this is unexpected, open an issue and include everything under this line\n\n${report}`

  if (error instanceof HTTPException) return error.getResponse()

  return new Response(`zkgn 🐻🐻 📉📉\n\n${message}`, { status: 404 })
})

showRoutes(app, { verbose: true, colorize: true })

export default {
  port: 8_787,
  fetch: async (request: Request, env: Env, context: ExecutionContext): Promise<Response> => {
    const url = new URL(request.url)
    if (url.pathname?.startsWith('/graphql')) return await yoga.fetch(request, env, context)

    return await app.fetch(request, env, context)
  }
}

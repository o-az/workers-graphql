import { createSchema, createYoga } from 'graphql-yoga'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { cacheControlDirective } from '@graphql-yoga/plugin-response-cache'
import { useImmediateIntrospection } from '@envelop/immediate-introspection'

const typeDefs = /* graphql */ `
  # the directive needs to be defined in the schema
  ${cacheControlDirective}

  type Query {
    health: String
    slow: String @cacheControl(maxAge: 3600000) # cache for 1 hour
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
        await new Promise(resolve => setTimeout(resolve, 4_500))
        return "I'm slow"
      }
    },
    Subscription: {
      countdown: {
        subscribe: async function* (_, { from }) {
          for (let index = from; index >= 0; index--) {
            await new Promise(resolve => setTimeout(resolve, 750)) // 0.75 seconds
            yield { countdown: index }
          }
        }
      }
    }
  }
})

const defaultQuery = /* graphql */ `
# run this to see a subscription stream example
subscription StreamExample {
  countdown(from: 12)
}

# the first time you run this it'll be slow
# run it again to see the cache in action
query QueryCachingExample {
  slow
}

#
# click the play button and it'll let you choose what to run
#`.trim()

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  graphiql: {
    defaultQuery,
    disableTabs: true,
    title: 'workers-graphql',
    defaultEditorToolsVisibility: false
  },
  /**
   * more plugins here https://the-guild.dev/graphql/envelop/plugins
   */
  plugins: [
    useResponseCache({
      enabled: _ => true,
      session: _ => null
    }),
    useDeferStream(),
    useGraphQLSSE(),
    useImmediateIntrospection()
  ]
})

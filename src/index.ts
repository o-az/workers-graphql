import { Hono } from 'hono'
import { yoga } from '#graphql.ts'
import { showRoutes } from 'hono/dev'
import { timeout } from 'hono/timeout'
import { requestId } from 'hono/request-id'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { HTTPException } from 'hono/http-exception'

const app = new Hono<{ Bindings: Env }>()

app.use(prettyJSON())
app.use(secureHeaders())
app.use('*', requestId())
app.use('*', timeout(10_500))

/**
 * currently base url redirects to `/graphql`
 * you can change it to whatever you want
 */
app.on(['GET', 'POST'], '/', context => {
  return context.redirect('/graphql')
})

app.all('/health', _context => new Response('OK', { status: 200 }))

app.get('/graphiql', context => context.redirect('/graphql'))
app.get('/playground', context => context.redirect('/graphql'))

app.on(['GET', 'POST'], '/graphql', async context =>
  yoga.fetch(context.req.raw, context.env, context.executionCtx)
)

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

showRoutes(app, { colorize: true })

export default app

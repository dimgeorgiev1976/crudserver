import Koa from 'koa'
import cors from '@koa/cors'
import koaBody from 'koa-body'

import router from './router'

import getDataBaseByKey from './db'

const app = new Koa()

app.use(cors())

app.use(koaBody())

app.use(async (ctx, next) => {
	const key = ctx.request.query.key

	if (!require('./keys.json').includes(key)) {
		return ctx.body = 'Need a correct invite key.'
	}

	ctx.state.db = await getDataBaseByKey(key)
	await next()
})


app.use(router.routes())

app.use(router.allowedMethods())

app.listen(3000, () => {
	console.log(`
		Server started ${new Date}
	`)	
})
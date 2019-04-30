import KoaRouter from 'koa-router'

const router = new KoaRouter

router.get('/orders', async (ctx, next) => {
	ctx.body = await ctx.state.db.getAll()

	await next()
})

router.get('/order/:id', async (ctx, next) => {
	const id = parseInt(ctx.params.id)
	const order = await ctx.state.db.getById(id)

	ctx.body = order

	await next()
})

router.post('/order', async (ctx, next) => {
	if (ctx.request.body) {
		if (typeof ctx.request.body === 'string') {
			ctx.request.body = JSON.parse(ctx.request.body)
		}
		
		const order = await ctx.state.db.create(ctx.request.body)
		ctx.body = order
	}

	await next()
})

router.post('/reinit', async (ctx, next) => {
	ctx.body = await ctx.state.db.reinit()

	await next()
})

router.post('/generate/:number', async (ctx, next) => {
	const number = parseInt(ctx.params.number)
		
	ctx.body = await ctx.state.db.generate(number)

	await next()
})


router.put('/order/:id', async (ctx, next) => {
	const id = parseInt(ctx.params.id)

	if (ctx.request.body) {
		if (typeof ctx.request.body === 'string') {
			ctx.request.body = JSON.parse(ctx.request.body)
		}

		const order = await ctx.state.db.updateById(id, ctx.request.body)
		ctx.body = order
	}

	await next()
})

router.delete('/order/:id', async (ctx, next) => {
	const id = parseInt(ctx.params.id)

	await ctx.state.db.removeById(id)

	ctx.body = await ctx.state.db.getAll()

	await next()
})

export default router
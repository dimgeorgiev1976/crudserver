import fs from 'fs'
import path from 'path'
import util from 'util'

async function getDataBaseByKey (key) {
	const writeFile = util.promisify(fs.writeFile)
	const readdir = util.promisify(fs.readdir)

	const dbfName =`${key}.json`

	const rootPath = path.join(__dirname, 'db')
	const defaultPath = path.join(rootPath, 'default.json')
	const fullPath = path.join(rootPath, dbfName)

	const dir = await readdir(rootPath)

	if (!dir.includes(dbfName)) {
		await reinit()
	}

	let orders = require(fullPath)

	const db = {
		async getById (id) {
			for (const order of orders) {
				if (order.id === id) {
					return order
				}
			}

			return null
		},

		async getAll () {
			return JSON.parse(JSON.stringify(orders))
		},

		async updateById (id, newData) {
			const order = await this.getById(id)

			if (!order) {
				return null
			}

			order.good = newData.good || order.good
			order.price = newData.price || order.price
			order.clientName = newData.clientName || order.clientName
			order.requestStatus = newData.requestStatus || order.requestStatus
			order.paymentStatus = newData.paymentStatus || order.paymentStatus

			await save()

			return await this.getById(order.id)
		},

		async create (data) {
			const order = {
				id: 1 + Math.max(0, ...orders.map(p => p.id)),
				good: data.good || "NotName",
				price: data.price || 0,
				clientName: data.clientName || 'NotName',
				requestStatus: data.requestStatus || 0,
				paymentStatus: data.paymentStatus || 0
			}


			orders.push(order)
			await save()

			return await this.getById(order.id)
		},

		async removeById (id) {
			const order = await this.getById(id)
			const index = orders.indexOf(order)

			orders.splice(index, 1)
			await save()

			return true
		},

		async reinit () {
			await reinit()

			return await this.getAll()
		}
	}

	return db

	async function save () {
		await writeFile(fullPath, JSON.stringify(orders, null, 2))
	}

	async function reinit () {
		const defaultData = require(defaultPath)
		await writeFile(fullPath, JSON.stringify(defaultData, null, 2))

		orders = defaultData
	}
}

export default getDataBaseByKey
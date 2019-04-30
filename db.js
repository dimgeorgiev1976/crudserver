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

	let orders = await getJSONFromFile(fullPath)

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
		},

		async generate (number) {

			number = Math.max(1, Math.min(10, number))

			for (let i = 0; i < number; i++) {
				await this.create({
					good: getRandomGood(),
					price: getRandomBetween(1, 1000000),
					clientName: getRandomName(),
					requestStatus: getRandomBetween(1, 5),
					paymentStatus: getRandomBetween(1, 4)
				})
			}

			return await this.getAll()
		}
	}

	return db

	async function save () {
		await writeFile(fullPath, JSON.stringify(orders, null, 2))
	}

	async function reinit () {
		orders = await getJSONFromFile(defaultPath)
		await writeFile(fullPath, JSON.stringify(orders, null, 2))
	}
}

export default getDataBaseByKey

async function getJSONFromFile (filePath) {
	const util = require('util')
	const fs = require('fs')

	const readFile = util.promisify(fs.readFile)
	const config = {
		encoding: 'utf-8',
		flag: 'r'
	}

	const file = await readFile(filePath, config)
	const obj = JSON.parse(file)

	return obj
}

function getRandomName () {
	const names = ['Алексей', 'Дмитрий', 'Сергей', 'Петр', 'Абдул', 'Александр', 'Тимофей', 'Евгений', 'Юрий', 'Мирослав']
	return names[getRandomBetween(0, names.length - 1)]
}

function getRandomGood () {
	const goods = ['Перчатки', 'Серьги', 'Яхта', 'Масло', 'Клавиатура', 'Луноход', 'Карандаш', 'Каштан', 'Веревка', 'Мыло']
	return goods[getRandomBetween(0, goods.length - 1)]
}

function getRandomBetween (min, max) {
	return min + Math.floor(Math.random() * (max - min + 1))
}
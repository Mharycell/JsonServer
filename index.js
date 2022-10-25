//importamos los módulos que usaremos http,path, fs

const http = require('http')
const path = require('path')
const fs = require('fs/promises')
const PORT = 8000

const app = http.createServer(async (request, response) => {
	// dentro del objeto request podemos leer el método de la petición
	//GET -- POST -- PUT-- DELETE
	const requestMethod = request.method
	const requestURL = request.url
	//nos permite leer la uta y el método de la petición
	//responder el data.json cuando se realice un get al endpoint/apiv1/tasks

	if (requestURL === '/apiv1/tasks') {
		const jsonPath = path.resolve('./data.json')
		let jsonFile = await fs.readFile(jsonPath, 'utf8') //acepta dos parámetros ruta-- codificación
		jsonFile = JSON.parse(jsonFile)
		if (requestMethod === 'GET') {
			//respondo con un data.json
			//obtener la ruta del data.json
			response.setHeader('Content-Type', 'application/json')
			response.writeHead(200)
			response.end(JSON.stringify(jsonFile))
		}
		if (requestMethod === 'POST') {
			response.writeHead(201)
			request.on('data', async (data) => {
				jsonFile.sort((a, b) => a.id - b.id)
				const id = jsonFile.at(-1).id + 1
				console.log(jsonFile)
				data = JSON.parse(data)
				data.id = id
				jsonFile.push(data)
				console.log(jsonFile)
				await fs.writeFile(jsonPath, JSON.stringify(jsonFile))
			})
		}
		if (requestMethod === 'PUT') {
			response.writeHead(201)
			request.on('data', async (data) => {
				data = JSON.parse(data)
				jsonFile = jsonFile.map((task) => {
					if (task.id === data.id) {
						task.status = data.status
					}
					return task
				})
				await fs.writeFile(jsonPath, JSON.stringify(jsonFile))
			})
		}
		if (requestMethod === 'DELETE') {
			response.writeHead(200)
			request.on('data', async (data) => {
				data = JSON.parse(data)
				jsonFile = jsonFile.filter((task) => task.id != data.id)
				await fs.writeFile(jsonPath, JSON.stringify(jsonFile))
			})
		}
	} else {
		response.writeHead('503') // poner un estado de la respuesta 403/404...
	}
	response.end()
})
app.listen(PORT)

console.log('servidor corriendo al 100')

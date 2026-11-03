const express = require('express')

const router = express.Router()

const bodyParser = require('body-parser')

const bodyParserJson = bodyParser.json()

const controllerProduto = require('../controller/produtos/controllerProduto.js')

router.post('/', bodyParserJson, async function(request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerProduto.insertProduto(dados, contentType )

    response.status(result.status_code)
    response.json(result)
})

router.put('/:id', bodyParserJson, async function(request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerProduto.atualizarProduto(request.params.id, dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

router.patch('/:id/ativo', bodyParserJson, async function(request, response) {

    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerProduto.atualizarStatusProduto(id, dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

router.delete('/:id', async function(request, response) {

    let id = request.params.id
    let result = await controllerProduto.excluirProduto(id)

    response.status(result.status_code)
    response.json(result)
})

router.get('/', async function(request, response) {
    let result = await controllerProduto.listarProdutos()

    response.status(result.status_code)
    response.json(result)
})

router.get('/:id', async function(request, response) {

    let id = request.params.id
    let result = await controllerProduto.buscarProdutoById(id)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router

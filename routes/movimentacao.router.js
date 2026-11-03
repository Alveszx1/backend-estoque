const express = require('express')

const router = express.Router()

const bodyParser = require('body-parser')

const bodyParserJson = bodyParser.json()

const controllerMovimentacao = require('../controller/movimentacao/controllerMovimentacao.js')

router.get('/tipos', bodyParserJson, async function(request, response) {
    let result = await controllerMovimentacao.listarTipos()

    response.status(result.status_code)
    response.json(result)
})

router.get('/', async function(request, response) {
    let result = await controllerMovimentacao.listarMovimentacoes(request.query)

    response.status(result.status_code)
    response.json(result)
})

router.post('/', bodyParserJson, async function(request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerMovimentacao.insertMovimentacao(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router

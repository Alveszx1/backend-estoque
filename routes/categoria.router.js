const express = require('express')

const router = express.Router()

const bodyParser = require('body-parser')

const bodyParserJson = bodyParser.json()

const controllerCategoria = require('../controller/categoria/controllerCategoria.js')

router.get('/', bodyParserJson, async function(request, response) {
    let result = await controllerCategoria.listarCategoria()

    response.status(result.status_code)
    response.json(result)
})

module.exports = router

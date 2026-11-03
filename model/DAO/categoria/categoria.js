/**
 * Objetivo: Arquivo responsável pelo CRUD de estoque do projeto Estoque+
 * MYSQL
 * Data: 20/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

// Faz o import da biblioteca para manipular dados no banco de dados MySQL
const knex = require("knex");

// Import do arquivo de configuração para acesso ao banco de dados
const knexDatabaseConfig = require("../../database_config/knex.config.js");

// Criar a conexão com o BD MySQL conforme o arquivo de configuração
const knexConection = knex(knexDatabaseConfig.development);

const selectAllCategorias = async function () {
    try {
        const sql = `select * from tbl_categoria`
        let result = await knexConection.raw(sql)

        if(Array.isArray(result)){
            return result[0]
        } else{
            return false
        }
    } catch (error) {
        
        return false 

    }
}

const selectCategoriaById = async function (id) {
    try {
        const sql = `select id from tbl_categoria where id = ?`
        let result = await knexConection.raw(sql, [id])

        if (Array.isArray(result)) {
            return result[0]
        } else {
            return false
        }
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = {
    selectAllCategorias,
    selectCategoriaById
}
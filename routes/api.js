const express = require('express')
const router = express.Router()
const users = require('./users')
const games = require('./games')
const rates = require('./rates')

router.use('/users', users)

router.use('/games', games)

router.use('/rates', rates)

module.exports = router

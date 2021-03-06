const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const steamAPI = require('../apis/steam')
const itadAPI = require('../apis/itad')
const cache = require('../cache')

router.get('/', function (req, res, next) {
  const topGames = cache.get('TOP_GAMES')
  if (topGames) {
    return res.send(topGames)
  }

  fetch(steamAPI.TOP_100_GAMES)
    .then(res => res.json())
    .then(json => Promise.all(Object.values(json)
                                    .sort((game1, game2) => game2.ccu - game1.ccu)
                                    .map(game => fetch(steamAPI.GAME_DETAIL + game.appid))))
    .then(res => Promise.all(res.map(data => data.json())))
    .then(games => {
      let data = []
      games.forEach(game => {
        game = game[Object.keys(game)[0]]
        if (!game.success) return

        const gameData = game.data
        data.push({
          app_id      : gameData.steam_appid,
          name        : gameData.name,
          is_free     : gameData.is_free,
          header_image: gameData.header_image,
          platforms   : gameData.platforms,
          steam_price : gameData.price_overview
        })
      })

      cache.set('TOP_GAMES', data, 300)

      res.send(data)
    })
    .catch(error => {
      next(error)
    })
})

router.get('/prices', function (req, res, next) {
  let plainData = []

  fetch(itadAPI.PLAINS_BY_ID + req.query.appIds)
    .then(res => res.json())
    .then(plains => {
      plainData = plains.data
      return fetch(itadAPI.CURRENT_PRICES + encodeURIComponent(Object.values(plainData)
                                                                     .join(',')))
    })
    .then(res => res.json())
    .then(prices => {
      const appIds = Object.keys(plainData)
      const plainIds = Object.values(plainData)

      let priceList = []
      plainIds.forEach(plainId => {
        const priceInfo = prices.data[plainId]
        if (priceInfo) {
          const firstPrice = priceInfo.list[0]
          if (firstPrice) {
            firstPrice.app_id = +appIds[plainIds.indexOf(plainId)].match(/\d+$/)[0]
            priceList.push(firstPrice)
          }
        }
      })

      res.send(priceList)
    })
    .catch(error => {
      next(error)
    })
})

router.get('/search', function (req, res, next) {
  fetch(steamAPI.SEARCH_GAME_BY_NAME + req.query.name)
    .then(res => res.json())
    .then(games => Promise.all(games.items.map(game => fetch(steamAPI.GAME_DETAIL + game.id))))
    .then(res => Promise.all(res.map(data => data.json())))
    .then(games => {
      let data = []
      games.forEach(game => {
        game = game[Object.keys(game)[0]]
        if (!game.success) return

        const gameData = game.data
        data.push({
          app_id      : gameData.steam_appid,
          name        : gameData.name,
          is_free     : gameData.is_free,
          header_image: gameData.header_image,
          platforms   : gameData.platforms,
          steam_price : gameData.price_overview
        })
      })

      res.send(data)
    })
    .catch(error => {
      next(error)
    })
})

router.get('/suggestions', function (req, res, next) {
  fetch(steamAPI.SEARCH_GAME_BY_NAME + req.query.name)
    .then(res => res.json())
    .then(games => {
      games = games.items.map(game => ({
        name      : game.name,
        tiny_image: game.tiny_image
      }))

      res.send(games)
    })
    .catch(error => {
      next(error)
    })
})

module.exports = router

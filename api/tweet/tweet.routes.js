const express = require('express')
const { log } = require('../../middlewares/logger.middleware')
const { getTweets,getTweetsByLoggedinUser } = require('./tweet.controller')
const router = express.Router()

router.get('/', log, getTweets)
router.get('/:userId',getTweetsByLoggedinUser)

module.exports = router
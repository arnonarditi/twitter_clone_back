const tweetService = require('./tweet.service')
// const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')

async function getTweets(req, res) {
  try {
    logger.debug('Getting Tweets')

    const tweets = await tweetService.query()
    res.json(tweets)
  } catch (err) {
    logger.error('Failed to get tweets', err)
    res.status(500).send({ err: 'Failed to get tweets' })
  }
}

async function getTweetsByLoggedinUser(req, res) {
  try {
    const userId = req.params.userId
    const tweets = await tweetService.getTweetsByLoggedinUser(userId)
    res.json(tweets)

  }
  catch (err) {
    logger.error('Failed to get tweets', err)
    res.status(500).send({ err: 'Failed to get tweets' })
  }
}

module.exports = {
  getTweets,
  getTweetsByLoggedinUser
}

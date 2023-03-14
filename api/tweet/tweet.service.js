
const dbService = require('../../services/db.service')

async function getTweetsByLoggedinUser(userId) {
    const query = `
    select * from tweets 
    where createdBy in(
    select followed_id from follows 
    where follower_id=${userId})`
    let tweets = await dbService.runSQL(query)

    tweets = tweets.map(async (tweet) => {
        const query1 = `select count(${tweet._id}) from tweet_likes
        where tweet_id=${tweet._id}
        group by tweet_id;`

        const likesCount = await dbService.runSQL(query1)
        tweet.likeCount = likesCount[0][`count(${tweet._id})`]

        const query2 = `
        select exists(select 1 from 
            (select user_id from tweet_likes
            where tweet_id=${tweet._id}) as t where t.user_id=${userId});
        `
        const isLoggedLiked = await dbService.runSQL(query2)
        if (Object.values(isLoggedLiked[0])[0]) {
            tweet.isLoggedLiked = true
        } else tweet.isLoggedLiked = false

        return tweet
    })

    return Promise.all(tweets)
}

module.exports = {
    getTweetsByLoggedinUser
}
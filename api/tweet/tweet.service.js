
const dbService = require('../../services/db.service')

async function getTweetsByLoggedinUser(userId) {

    const query = `
    select * from tweets 
    where createdBy in(
    select followed_id from follows 
    where follower_id=${userId})`
    let tweets = await dbService.runSQL(query)

    
    return tweets

}


async function query() {
    var query = `
    select photos.id,image_url,users.username as creator
    from photos join
    users on
    photos.user_id=users.id; `

    var photos = await dbService.runSQL(query)
    photos = photos.map(async (photo) => {
        const query1 = `select comment_text,comments.created_at,username as written_by from comments 
        join users on users.id=comments.user_id
        where comments.photo_id=${photo.id};`

        const comments = await dbService.runSQL(query1)
        photo.comments = comments
        return photo
    })

    return Promise.all(photos)
}

module.exports = {
    query,
    getTweetsByLoggedinUser
}
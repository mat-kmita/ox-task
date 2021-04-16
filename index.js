const https = require('https');


/*
    Download JSON data from location using HTTPS protocol and parse it.

    @param  {string}    location    URL of location to download from

    @return {Object}    Object created by parsing JSON data from location
*/
async function downloadWithHttps(location) {
    return new Promise((resolve, reject) => {
        
        https.get(location, res => {
            res.setEncoding('utf-8')

            let allData = '';

            res.on('data', data => {
                allData += data;
            });

            res.on('end', () => {
                try {
                    let result = JSON.parse(allData);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }

            }).on('error', e => {
                reject(e);
            })

        }).on('error', e => {
            reject(e);
        })
    })
}

/*
    Creates new array of user data objects that store an array of all users' posts

    @param  {[Object]}  [users] An array of objects with users' data
    @param  {[Object]}  [posts] An array of posts data

    @return {[Object]}  An array of users and posts joined on user id
*/
function joinUsersWithPosts(users, posts) {
    return users.map(u => {
        let user = Object.create(u);
        user.posts = posts.filter(p => p.userId == user.id);
        return user;
    });
}

/*
    Finds posts with duplicate titles

    @param  {[Object]}  [posts] An array of posts

    @return {[Object]}  An array of posts with duplicate titles
*/
function findDuplicateTitles(posts) {
    const titlesCountMap = posts.reduce((accMap, post) => {
        accMap[post.title] = (accMap[post.title] || 0) + 1;
        return accMap;
    }, {});

    return posts.filter(p => titlesCountMap[p.title] > 1);
}

(async function() {
    const POSTS_LOCATION = 'https://jsonplaceholder.typicode.com/posts'
    const USERS_LOCATION = 'https://jsonplaceholder.typicode.com/users'

    let posts = await downloadWithHttps(POSTS_LOCATION);

    let users = await downloadWithHttps(USERS_LOCATION);
    let usersWithPosts = joinUsersWithPosts(users, posts); 

    console.log("Nie unikalne tytuły postów to: ");
    console.log(findDuplicateTitles(posts));
})()

module.exports.joinUsersWithPosts = joinUsersWithPosts;

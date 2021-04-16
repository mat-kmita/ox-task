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


(async function() {
    const POSTS_LOCATION = 'https://jsonplaceholder.typicode.com/posts'
    const USERS_LOCATION = 'https://jsonplaceholder.typicode.com/users'

    let posts = await downloadWithHttps(POSTS_LOCATION);

    let users = await downloadWithHttps(USERS_LOCATION);
    let usersWithPosts = users.map(u => {
        let user = Object.create(u);
        user.posts = posts.filter(p => p.userId == user.id);
        console.log(user.posts.length);
        return user;
    })
    users[0].name = 'Franke'
    console.log(usersWithPosts[0].name)


    console.log(usersWithPosts);
})()
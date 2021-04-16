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


/*
    Count number of posts written by each user.

    @param  {[Object]}  users   Array of objects representing users and their posts

    @return {[string]}  Array of strings with information about post count for each user
*/
function countPosts(users) {
    return users.map(user => `${user.username || "unknown"} napisał(a) ${user.posts.length || 0} postów`)
}


/*
    This uses the ‘haversine’ formula to calculate the great-circle distance between two points.
    Source: https://www.movable-type.co.uk/scripts/latlong.html
    © 2002-2020 Chris Veness
*/
function geoDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;

    return d;
}

/*
    Finds closest user for each user in the users array

    @param  {[Object]}  [users] An array of users

    @return {[Object]}  An array of users so that for each index i, return array[i] is the closest user to users[i]
*/
function findClosestUsers(users) {
    if(users.length < 2) {
        return []
    }

    const AuxTuple = function(user, distance) {
        this.user = user;
        this.distance = distance;
    }

    const getCloser = function(user, user1, auxTuple) {
        const distance = geoDistance(
            user.address.geo.lat,
            user.address.geo.lng,
            user1.address.geo.lat,
            user1.address.geo.lng);

        if(distance < (auxTuple.distance || Number.MAX_VALUE)) {
            return new AuxTuple(user1, distance);
        }

        return auxTuple;
    }

    return users.map(u => {
        return users.filter(u1 => u.id !== u1.id)
                    .reduce((closest, u1) => {
                        return getCloser(u, u1, closest);
                    }, {}).user;
    });
}



(async function() {
    const POSTS_LOCATION = 'https://jsonplaceholder.typicode.com/posts'
    const USERS_LOCATION = 'https://jsonplaceholder.typicode.com/users'

    let posts = await downloadWithHttps(POSTS_LOCATION);

    let users = await downloadWithHttps(USERS_LOCATION);
    let usersWithPosts = joinUsersWithPosts(users, posts); 

    console.log("Nie unikalne tytuły postów to: ");
    console.log(findDuplicateTitles(posts));

    console.log("Informacje o postach:");
    console.log(countPosts(usersWithPosts));

    console.log("Najbliżej położeni użytkownicy: ")
    findClosestUsers(users).forEach( (u, i) => {
        console.log(`Użytkownik ${u.username} o id ${u.id} jest nabliżej położony użytkownika ${users[i].username} o id ${users[i].id}`)
    })
})()

module.exports.joinUsersWithPosts = joinUsersWithPosts;
module.exports.findDuplicateTitles = findDuplicateTitles;
module.exports.countPosts = countPosts;
module.exports.findClosestUsers = findClosestUsers;
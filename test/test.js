const { expect } = require("chai");
const script = require('../index');

function Post(id, userId) {
    this.id = id;
    this.userId = userId;
    this.title = `Post #${id}`
    this.body = `Post #${id} body`
}

function User(id) {
    this.id = id;
    this.username = `user#${id}`
}

describe("Script", function() {
    describe("joinUsersWithPosts()", function() {
        it("should return an empty array for 0 users", function() {
            let users = [];
            let posts = [
                new Post(0, 1),
                new Post(0, 2),
            ];

            expect(script.joinUsersWithPosts(users, posts)).to.empty;
        });

        it("should return joined data if user ids match", function() {
            let user_0 = new User(0);
            let user_1 = new User(1);
            let user_2 = new User(2);

            let post_0 = new Post(0,0);
            let post_1 = new Post(1,0);

            let result_0 = Object.create(user_0);
            result_0.posts = [post_0, post_1];
            let result_1 = Object.create(user_1);
            result_1.posts = []
            let result_2 = Object.create(user_2);
            result_2.posts = []

            let expectedResult = [result_0, result_1, result_2];

            expect(script.joinUsersWithPosts([user_0, user_1, user_2], [post_0, post_1])).to.eql(expectedResult);
        })
    })

    describe("findDuplicateTitles()", function() {
        it("should return an empty array if all titles are distinct", function() {
            expect(script.findDuplicateTitles([new Post(0, 0), new Post(1, 1)]))
            .to.eql([]);
        })
    
        it("should return duplicate titles if exist", function() {
            let post_0 = new Post(0, 0);
            post_0.title = 'duplicate';
    
            let post_1 = new Post(1, 0);
            
            let post_2 = new Post(2, 1);
            post_2.title = 'duplicate';
    
            expect(script.findDuplicateTitles([post_0, post_1, post_2]))
            .to.eql([post_0, post_2])
        });
    })
})

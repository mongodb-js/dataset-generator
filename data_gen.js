// Customized version of Chance.js to serve more types of data,
// such as User, Address, etc.

var chance = require('chance').Chance();

chance.mixin({
    'user': function() {
        return {
            first: chance.first(),
            last: chance.last(),
            email: chance.email()
        };
    }
});

chance.mixin({
    'user1': function() {
        return {
            first: chance.first(),
            email: chance.email()
        };
    }
});

chance.mixin({});

module.exports = chance;

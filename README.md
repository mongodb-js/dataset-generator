# mongodb-datasets

[![build status](https://secure.travis-ci.org/imlucas/mongodb-datasets.png)](http://travis-ci.org/imlucas/mongodb-datasets)

What's a database without any data?

## Example

Example _schema.json_:
```json
{
  "user_email": "email",
  "job": {
    "company": "word",
    "phones": {
      "mobile": "phone",
      "work": "phone"
    },
    "duties": "sentence"
  },
  "personalities": {
    "favorites": {
      "number": "d10",
      "city": "city",
      "radio": "radio"
    },
    "violence-rating": "d6"
  },
  "friends" : [{
    "name": "name",
    "phones": ["phone"]
  }]
}
```

Example _app.js_:
```javascript
var datasets = require('mongodb-datasets');
var opts = {
  host: 'localhost',
  port: '27017',
  db: 'test',
  collection: 'dataset',
  schema: './schema.json',
  size: 5
};

datasets(opts, function () {
  console.log('Done! Check out the collection you specified!');
});
```

Sample entry in the collection:
```javascript
{
  "_id" : ObjectId("53a89211734538741c4bde5e"),
  "user_email" : "jofowpat@asose.edu",
  "job" : {
    "company" : "wapez",
    "phones" : {
      "mobile" : "(311) 692-8852",
      "work" : "(417) 927-3203"
    },
    "duties" : "Hu zaib diftu jujepme joulemo gib jip oboto."
  },
  "personalities" : {
    "favorites" : {
      "number" : 5,
      "city" : "Hapkugbub",
      "radio" : "KCWL"
    },
    "violence-rating" : 3
  },
  "friends" : [
    {
      "name" : "Edna Perez",
      "phones" : [
        "(313) 206-6936",
        "(924) 655-6886"
      ]
    },
    {
      "name" : "Etta Parsons",
      "phones" : [
        "(719) 313-2275",
        "(545) 706-7688"
      ]
    },
    {
      "name" : "Thomas Cummings",
      "phones" : [
        "(343) 550-2924",
        "(205) 513-1057",
        "(388) 242-1740"
      ]
    },
    {
      "name" : "Maria Hunter",
      "phones" : [
        "(501) 629-3251"
      ]
    }
  ]
}
```

## Usage

## Overview

With the explosion of data volume and availability, users are
transitioning their focus to analysis and data-mining on these vast
datasets. We believe MongoDB is ideally positioned to provide the
backbone to meet these market needs. While several users have already
begun to exploit this, it requires substantial sunk costs including
mapping the aggregation framework to their current mental model,
designing efficient schemas, and acquiring datasets for prototyping.
Work to humanize the aggregation framework is already underway. We
believe supplying users with example schemas for common use cases,
such as user activity streams, time series data, and entity management,
and more importantly, corresponding datasets for prototyping will
establish MongoDB as a leader in this emerging market.

## Milestones

- [x] Set up generalizable skeleton code that abstracts each module
- [x] Support user defined schemas with arbitrary structure
- [ ] Collect example schemas from documentation
- [ ] Extend the current code base to support replicating common datasets
- [ ] Select datasets to add support for prototyping

## Implementation Plan

+ Collect example schemas
  * Simple educational schemas that cover
    1. basic model relationships, e.g. one-to-one, one-to-many with
       embedded document, one-to-many with document reference
  * Ready-to-use template schemas such as
    1. user activity stream
    2. time series data
    3. user management
    4. other [use cases](http://docs.mongodb.org/ecosystem/use-cases)
+ Set up skeleton code that encapsulates the feature to populate random
  data, which has support of
  1. reading and configuring for the selected schemas with limited user
     customization
  2. generating data of types that are used in the schemas
  3. feeding the generated data to MongoDB database
+ Add peripheral support for individual schemas, based on the skeleton
  1. identify types and/or reasonable range for data in each field
  2. write up configuration files for each schema
+ Enhance user experience
  1. generate user defined (as opposed to random) data, such as
     constant strings, enums, and incrementor
  2. allow user pass in config arguments to underlying Chance.js methods
+ @todo: plans for replicating datasets

## Resources

+ Some handy references
  * [Chance.js](http://chancejs.com/)
  * [Joi](https://github.com/spumko/joi)
  * [Node.js Stream](http://nodejs.org/api/stream.html)
  * [Async](https://github.com/caolan/async)
  * [Stream Handbook](https://github.com/substack/stream-handbook)

+ Other potential userful docs
  * MongoDB official doc: [Generate Test Data](http://docs.mongodb.org/manual/tutorial/generate-test-data)
  * [Time Series](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb)[same topic ppt](http://www.mongodb.com/presentations/webinar-time-series-data-mongodb)
  * [User Management](http://www.slideshare.net/mongodb/webinar-user-data-management-with-mongodb)

## License

MIT

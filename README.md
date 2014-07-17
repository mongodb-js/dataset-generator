# mongodb-datasets

[![build status](https://secure.travis-ci.org/imlucas/mongodb-datasets.png)](http://travis-ci.org/imlucas/mongodb-datasets)

What's a database without any data? With mongodb-datasets you never worry about
how to populate your MongoDB database with the data as you wish. Unlike a simple
populator, mongodb-datasets is designed to offer you the maximum control of the
data to be in your database.

## A Simple Example

```javascript
var datasets = require('mongodb-datasets');
var opts = {
  host: 'localhost',
  port: '27017',
  db: 'company',
  collection: 'employee',
  size: 50,
  schema: {
    _id: '{{counter()}}',
    name: '{{chance.name()}}',
    phones: [ 3, '{{chance.phone()}}' ],
    title: 'Software {{util.sample(["Engineer", "Programmer"])}}'
  }
};

datasets.populate(opts, function () {
  console.log('This will be called when populating is complete.');
});
```

## Usage

### Options

* `uri` - the URI of the target MongoDB database. Alternatively, you can
  specify each components respectively: `host`, `port`, `db`
* `collection` - the collection to store the sample data
* `size` - the number of documents to be populated
* `schema` - a Javascript object representing the template schema of your data.
* Or `schemaPath` - if you want to define your schema in a `.json` file

If any required option is missing, the default will be used.
```js
uri: 'mongodb://localhost:27017/test/',
collection: 'dataset',
size: 100,
schemaPath: './me_in_a_nutshell.json'
```

### Command line

You can also invoke mongodb-datasets in cli

    $ mongodb-datasets --schemaPath=./schema.json --size=100 --collection=temp --uri=mongodb://localhost:27017/test

### Building your schema

The schema is a JSON or Javascript object which is used as the template of every
single document to be inserted into MongoDB database. The following content in
this section discusses how to specify the value of each name/value pair of the
object.

#### Basics

The value can be any primitive data types, such as boolean, number, array, and
object. When the value is a string, it can be used to evaluate Javascript
expressions. All string segments intended to be treated as expressions must be
surrounded by `{{ <expr> }}`. A mix of regular string and expressions are
allowed, whereas a mix of different types is not. Some examples:
* `{ "boolean": true }`
* `{ "brackets_parade": [ { 1: { 2: [ { 3: 3 } ] } } ] }`
* `{ "mix": "1 + 1 = {{ 1+1 }}" }`

#### Random data

This project uses [chance.js](http://chancejs.com/) and
[faker.js](https://github.com/FotoVerite/Faker.js) as the internal random data
generator. To invoke them, simply do, for instance:
* `{ "use_chance": "{{ chance.name({ gender: 'female' }) }}" }`
* `{ "use_faker": "{{ faker.Company.catchPhrase() }}" }`

#### Type conversion

Maybe you've already noticed. It's not very useful to generate a string from
`"{{chance.year()}}"` which is expected to apply commands such as `$gte`.
Since its MongoDB-specific nature, the package currently supports common bson
types as in [bson](https://github.com/mongodb/js-bson) module, such as Double,
Timestamp, Date, and ObjectID. Note that once conversion is triggered, the
target object will be the only produced content. Some examples:
* `{ "date": "{{ Date(chance.date()) }}" }` becomes `ISODate(...)` in MongoDB
* `{ "two": "{{ Double(1) + Double(1) }}" }` produces `{ "two": 1}`

#### Scope

#### Utility methods

#### Imperfections

## Purpose of this project

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

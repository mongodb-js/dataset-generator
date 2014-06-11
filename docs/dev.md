# Development Roadmap

## Implementation Plan

+ Collect example schemas
  * Simple educational schemas that cover
    1. basic model relationships, e.g. one-to-one, one-to-many with
       embedded document, one-to-many with document reference
    2. @todo: more examples
  * Ready-to-use template schemas such as
    1. user activity stream
    2. time series data
    3. user management
    4. @todo: gather or refine [use cases](http://docs.mongodb.org/ecosystem/use-cases)
+ Set up skeleton code that encapsulates the feature to populate random
  data, which has support of
  1. reading and configuring for the selected schemas with limited user
     customization
  2. generating data of types that are used in the schemas (possibly
     extend existing APIs such as [Mockaroo](http://www.mockaroo.com/api/docs))
  3. feeding the generated data to MongoDB database
+ Add peripheral support for individual schemas, based on the skeleton
  1. identify types and/or reasonable range for data in each field
  2. write up configuration files for each schema
+ @todo: plans for replicating datasets

## Resources

+ Random data generator
  * MongoDB official doc: [Generate Test Data](http://docs.mongodb.org/manual/tutorial/generate-test-data)
  * community question [random k-v pair](https://groups.google.com/forum/#!topic/mongodb-user/o0AmMt9i3Zc)
  * API:
    1. [json-generator](http://www.json-generator.com/)
    2. [chance.js](http://chancejs.com/): [mixin](http://chancejs.com/#mixin) seems useful

+ Schema Design
  * [Time Series](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb)[same topic ppt](http://www.mongodb.com/presentations/webinar-time-series-data-mongodb)
    1. granularity: a doc per hour or min or event, level of embedded
    2. sparse data?
    3. capped collection?
    - notes: [Cassandra](http://stackoverflow.com/questions/11166441/nosql-for-time-series-logged-instrument-reading-data-that-is-also-versioned)
  * [User Management](http://www.slideshare.net/mongodb/webinar-user-data-management-with-mongodb)

+ Datasets
  * Questions
    1. Some datasets are generally very large (sometimes ~TB scale) and
       do not support online streaming. It's almost impossible to
       download to local drive and then replicate into MongoDB.
    2. Some datasets are encoded in the format which is hard to read in
       node.js because of no corresponding npm modules.

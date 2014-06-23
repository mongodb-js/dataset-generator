# mongodb-datasets

[![build status](https://secure.travis-ci.org/imlucas/mongodb-datasets.png)](http://travis-ci.org/imlucas/mongodb-datasets)

What's a database without any data?

## Table of Contents

- [Example](#example)
- [Overview](#overview)
- [Usage](#usage)
- [Milestones](#milestones)
- [Implementation Plan](#implementation-plan)
- [Resources](#resources)

## Example

```javascript
// @todo
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

- [ ] Collect example schemas from documentation
- [ ] Generate random data to populate the example schemas
- [ ] Select datasets to add support for prototyping
- [ ] Design efficient schemas for the selected datasets
- [ ] Scripts to import from data sources to specified user database

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
+ @todo: plans for replicating datasets

## Resources

+ Random data generator
  * MongoDB official doc: [Generate Test Data](http://docs.mongodb.org/manual/tutorial/generate-test-data)
  * community question [random k-v pair](https://groups.google.com/forum/#!topic/mongodb-user/o0AmMt9i3Zc)
  * API: [chance.js](http://chancejs.com/)

+ Schema Design
  * [Time Series](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb)[same topic ppt](http://www.mongodb.com/presentations/webinar-time-series-data-mongodb)
    1. granularity: a doc per hour or min or event, level of embedded
    2. sparse data?
    3. capped collection?
    - notes: [Cassandra](http://stackoverflow.com/questions/11166441/nosql-for-time-series-logged-instrument-reading-data-that-is-also-versioned)
  * [User Management](http://www.slideshare.net/mongodb/webinar-user-data-management-with-mongodb)

## License

MIT

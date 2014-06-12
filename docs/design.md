# Design

## generator.js

Augment Chance.js that supports

### Input

A representation of schema (field name, field data type, including
level of embedding)

### Process

Add the schema to mixin so that chance.<schema name>() generates a
random entry that conforms to the schema

### Output

An object with built-in generator that expires after a specified
number of yields

## schema.js

A representation of schema.
Some examples of pre-configured schemas.
A generalized constructor.

### Representation

* Support embedding, such as Schema -> { a: number, b: Schema<#xxxx> }
* (maybe) Support relationship between multiple tables

## inserter.js

### Input

Object returned from generator.js.

### Process

Insert into the database, adaptively adjusting the bulk size

## importer.js

In case of external data source, importer will create a stream.
The exposed object should be the same with generator.js

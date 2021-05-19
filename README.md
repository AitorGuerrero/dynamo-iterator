# Dynamo Iterator
A utility class to iterate Dynamo searches. When iterating, it loads results by demand, and manages batches logic. 

## Getting started
- Installation ```npm install dynamo-iterator```
- Making a query:
```
import DynamoIteratorFactory from 'dynamo-iterator';

const items = DynamoIteratorFactory.query({
  TableName: 'my-table',
  KeyConditionExpression: 'id=:id',
  ExpressionAttributeValues: {'id': 'myId'}, 
});

for await (const item of items) {
  ...
}
```

## Changelog
- 2.0.0 Async Iterator implementation.
  - Features:
    - ```for await (const item of generator) { ... }``` form can be used
    - There is no need to precharge the generator.
  - Breaking changes:
    - Exported class is named ```DynamoIteratorFactory```
    - ```DynamoIteratorFactory.preload``` method removed, as it is not needed.

/* tslint:disable */
import {DynamoDB} from 'aws-sdk';

import DocumentClient = DynamoDB.DocumentClient;

/**
 * Document client for using in testing
 */
export default class {

    public batchesSize = 2;
    public list: DynamoDB.DocumentClient.ItemList = [];

    public scan(i: DocumentClient.ScanInput, cb: (err: Error, data: DocumentClient.ScanOutput) => unknown) {
        cb(null, this.getNexResponse(i));
    }

    public query(i: DocumentClient.QueryInput, cb: (err: Error, data: DocumentClient.QueryOutput) => unknown) {
        cb(null, this.getNexResponse(i));
    }

    private getNexResponse(i: DocumentClient.ScanInput | DocumentClient.QueryInput) {
        const firstIndex = i.ExclusiveStartKey ? this.findIndexOfKey(i.ExclusiveStartKey) + 1 : 0;
        const lastIndex = firstIndex + this.batchesSize;
        const batch = this.list.slice(firstIndex, lastIndex);
        const lastEvaluatedKey = lastIndex >= this.list.length ? undefined : batch[batch.length - 1];
        if (i.Select && i.Select === 'COUNT') {
            return {
                Count: batch.length,
                LastEvaluatedKey: lastEvaluatedKey,
            };
        }

        return {
            Items: batch,
            LastEvaluatedKey: lastEvaluatedKey,
        };
    }

    private findIndexOfKey(key: DocumentClient.Key) {
        return this.list.findIndex((i) => this.keyMatches(i, key));
    }

    private keyMatches(item: DocumentClient.AttributeMap, key: DocumentClient.Key) {
        return Array.from(Object.keys(key)).reduce((prev, current) => prev && (item[current] === key[current]), true);
    }
}

/* tslint:disable */
import {DynamoDB} from 'aws-sdk';

import DocumentClient = DynamoDB.DocumentClient;

/**
 * Document client for using in testing
 */
export default class {

    public batchesSize = 2;
    public list: Array<{matches?: boolean, value: DocumentClient.AttributeMap}> = [];

    public scan(i: DocumentClient.ScanInput, cb: (err: Error, data: DocumentClient.ScanOutput) => unknown) {
        cb(null, this.getNexResponse(i));
    }

    public query(i: DocumentClient.QueryInput, cb: (err: Error, data: DocumentClient.QueryOutput) => unknown) {
        cb(null, this.getNexResponse(i));
    }

    private getNexResponse(i: DocumentClient.ScanInput | DocumentClient.QueryInput) {
        const firstIndex = i.ExclusiveStartKey ? this.findIndexOfKey(i.ExclusiveStartKey) + 1 : 0;
        const lastIndex = firstIndex + this.batchesSize;
        const batch = this.list.slice(firstIndex, lastIndex).filter((i) => i.matches !== false).map((i) => i.value);
        const lastEvaluatedKey = lastIndex >= this.list.length ? undefined : this.list[lastIndex - 1].value;
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
        return this.list.findIndex((i) => this.keyMatches(i.value, key));
    }

    private keyMatches(item: DocumentClient.AttributeMap, key: DocumentClient.Key) {
        return Array.from(Object.keys(key)).reduce((prev, current) => prev && (item[current] === key[current]), true);
    }
}

/* tslint:disable */
import {DynamoDB} from 'aws-sdk';

import DocumentClient = DynamoDB.DocumentClient;

/**
 * Document client for using in testing
 */
export default class {

    public queueBatches: DynamoDB.DocumentClient.ScanOutput[] = [];

    public scan(i: DocumentClient.ScanInput, cb: (err: Error, data: DocumentClient.ScanOutput) => unknown) {
        const nextBatch = this.queueBatches.shift();
        if (i.Select && i.Select === 'COUNT') {
            return cb(null, {
                Count: nextBatch.Items.length,
                LastEvaluatedKey: this.queueBatches.length > 0 ? {} : undefined,
            });
        }
        cb(null, Object.assign({
            LastEvaluatedKey: this.queueBatches.length > 0 ? {} : undefined,
        }, nextBatch));
    }

    public query(i: DocumentClient.QueryInput, cb: (err: Error, data: DocumentClient.QueryOutput) => unknown) {
        const nextBatch = this.queueBatches.shift();
        cb(null, Object.assign({
            LastEvaluatedKey: this.queueBatches.length > 0 ? {} : undefined,
        }, nextBatch));
    }
}

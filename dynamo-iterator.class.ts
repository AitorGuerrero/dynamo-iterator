import {DynamoDB} from "aws-sdk";
import QueryIterator from "./query-iterator.class";
import ScanIterator from "./scan-iterator.class";
import DocumentClient = DynamoDB.DocumentClient;

export default class {
	constructor(
		private documentClient: DocumentClient,
	) {}

	public async scan(input: DocumentClient.ScanInput) {
		const iterator = new ScanIterator(this.documentClient, input);
		await iterator.preload();

		return iterator;
	}

	public async query(input: DocumentClient.QueryInput) {
		const iterator = new QueryIterator(this.documentClient, input);
		await iterator.preload();

		return iterator;
	}

	public async countQuery(input: DocumentClient.QueryInput) {
		return (new QueryIterator(this.documentClient, input)).count();
	}

	public async countScan(input: DocumentClient.ScanInput) {
		return (new ScanIterator(this.documentClient, input)).count();
	}
}

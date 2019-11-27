import {DynamoDB} from "aws-sdk";
import QueryIterator from "./query-iterator.class";
import ScanIterator from "./scan-iterator.class";
import DocumentClient = DynamoDB.DocumentClient;

export default class {
	constructor(
		private documentClient: DocumentClient,
	) {}

	public scan(input: DocumentClient.ScanInput) {
		return new ScanIterator(this.documentClient, input);
	}

	public query(input: DocumentClient.QueryInput) {
		return new QueryIterator(this.documentClient, input);
	}
}

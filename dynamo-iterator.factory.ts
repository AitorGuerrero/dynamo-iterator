import {DynamoDB} from "aws-sdk";
import QueryIterator from "./query-iterator.class";
import ScanIterator from "./scan-iterator.class";
import DocumentClient = DynamoDB.DocumentClient;

export default class {

	/**
	 * @param {DocumentClient} documentClient
	 */
	constructor(
		private documentClient: DocumentClient,
	) {}

	/**
	 * @param {DocumentClient.ScanInput} input
	 * @return {ScanIterator}
	 */
	public scan(input: DocumentClient.ScanInput) {
		return new ScanIterator(this.documentClient, input);
	}

	/**
	 * @param {DocumentClient.QueryInput} input
	 * @return {QueryIterator}
	 */
	public query(input: DocumentClient.QueryInput) {
		return new QueryIterator(this.documentClient, input);
	}
}

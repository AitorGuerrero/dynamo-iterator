import {DynamoDB} from "aws-sdk";
import SearchIterator from "./search-iterator.class";

export default class extends SearchIterator<DynamoDB.DocumentClient.ScanInput> {

	/**
	 * @param {DynamoDB.DocumentClient} documentClient
	 * @param {DynamoDB.DocumentClient.ScanInput} input
	 */
	constructor(
		private documentClient: DynamoDB.DocumentClient,
		input: DynamoDB.DocumentClient.ScanInput,
	) {
		super(input);
	}

	protected asyncSearch(input: DynamoDB.DocumentClient.ScanInput) {
		return this.documentClient.scan(input).promise();
	}
}

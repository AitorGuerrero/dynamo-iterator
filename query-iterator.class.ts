import {DynamoDB} from "aws-sdk";
import SearchGenerator from "./search-iterator.class";

export default class extends SearchGenerator<DynamoDB.DocumentClient.QueryInput> {

	constructor(
		private documentClient: DynamoDB.DocumentClient,
		input: DynamoDB.DocumentClient.QueryInput,
	) {
		super(input);
	}

	protected asyncSearch(input: DynamoDB.DocumentClient.QueryInput) {
		return this.documentClient.query(input).promise();
	}
}

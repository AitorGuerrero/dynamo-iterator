import {DynamoDB} from "aws-sdk";
import SearchGenerator from "./search-iterator.class";

import DocumentClient = DynamoDB.DocumentClient;

export interface IQueryDocumentClient {
	query(i: DocumentClient.QueryInput): {promise: () => Promise<DocumentClient.QueryOutput>};
}

export default class extends SearchGenerator<DocumentClient.QueryInput> {

	constructor(
		private documentClient: IQueryDocumentClient,
		input: DocumentClient.QueryInput,
	) {
		super(input);
	}

	protected asyncSearch(input: DocumentClient.QueryInput) {
		return this.documentClient.query(input).promise();
	}
}

import {DynamoDB} from "aws-sdk";
import SearchIterator from "./search-iterator.class";

import DocumentClient = DynamoDB.DocumentClient;

export interface IScanDocumentClient {
	scan(i: DocumentClient.ScanInput): {promise: () => Promise<DocumentClient.ScanOutput>};
}

export default class extends SearchIterator<DocumentClient.ScanInput> {

	constructor(
		private documentClient: IScanDocumentClient,
		input: DocumentClient.ScanInput,
	) {
		super(input);
	}

	protected asyncSearch(input: DocumentClient.ScanInput) {
		return this.documentClient.scan(input).promise();
	}
}

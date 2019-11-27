import {DynamoDB} from "aws-sdk";
import SearchIterator from "./search-iterator.class";

import DocumentClient = DynamoDB.DocumentClient;

export interface IScanDocumentClient {
	scan(i: DocumentClient.ScanInput, cb: (err: Error, data: DocumentClient.ScanOutput) => unknown): unknown;
}

export default class extends SearchIterator<DocumentClient.ScanInput> {

	constructor(
		private documentClient: IScanDocumentClient,
		input: DocumentClient.ScanInput,
	) {
		super(input);
	}

	protected asyncSearch(input: DocumentClient.ScanInput) {
		return new Promise<DocumentClient.ScanOutput>(
			(rs, rj) => this.documentClient.scan(input, (err, res) => err ? rj(err) : rs(res)),
		);
	}
}

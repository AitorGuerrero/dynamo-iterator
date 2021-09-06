import {DynamoDB} from "aws-sdk";
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
	 * @return {AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>}
	 */
	public async* scan(input: DocumentClient.ScanInput): AsyncGenerator<DynamoDB.DocumentClient.AttributeMap> {
		let response: DynamoDB.DocumentClient.ScanOutput;
		do {
			response = await this.documentClient.scan(Object.assign(
				input,
				{ExclusiveStartKey: response?.LastEvaluatedKey},
			)).promise();
			for (const item of response.Items) {
				yield item;
			}
		} while(response.LastEvaluatedKey !== undefined)
	}

	/**
	 * @param {DocumentClient.QueryInput} input
	 * @return {AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>}
	 */
	public async* query(input: DocumentClient.QueryInput): AsyncGenerator<DynamoDB.DocumentClient.AttributeMap> {
		let response: DynamoDB.DocumentClient.QueryOutput;
		do {
			response = await this.documentClient.query(Object.assign(
				input,
				{ExclusiveStartKey: response?.LastEvaluatedKey},
			)).promise();
			for (const item of response.Items) {
				yield item;
			}
		} while(response.LastEvaluatedKey !== undefined)
	}
}

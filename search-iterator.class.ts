import {DynamoDB} from "aws-sdk";
import DocumentClient = DynamoDB.DocumentClient;

interface IInput {
	ExclusiveStartKey?: DocumentClient.Key;
}

interface IOutput {
	Items?: DocumentClient.AttributeMap[];
	LastEvaluatedKey?: DocumentClient.Key;
	Count?: number;
}

export default abstract class <Input> {

	private batch: DocumentClient.AttributeMap[] = [];
	private loadingBatch = false;
	private sourceIsEmpty = false;
	private lastEvaluatedKey: DocumentClient.Key;

	protected constructor(
		protected input: Input & IInput,
	) {}

	public [Symbol.asyncIterator]() {
		return this;
	}

	public async next(): Promise<{done: boolean, value: DynamoDB.DocumentClient.AttributeMap}> {
		if (this.batch.length === 0 && !this.sourceIsEmpty) {
			if (this.loadingBatch) {
				throw new Error('Loading batch');
			}
			this.loadingBatch = true;
			await this.fillBatch();
			this.loadingBatch = false;
		}
		const item = this.batch.shift();
		if (item === undefined) {
			return {done: true, value: undefined};
		}

		return {done: false, value: item};
	}

	public async count() {
		const documentClientInput = Object.assign(
			{},
			this.input,
			{Select: "COUNT"},
		);
		let total = 0;
		let response;
		do {
			response = await this.asyncSearch(documentClientInput);
			documentClientInput.ExclusiveStartKey = response.LastEvaluatedKey;
			total += response.Count;
		} while (response.LastEvaluatedKey);

		return total;
	}

	public async toArray() {
		const result: DocumentClient.AttributeMap[] = [];
		for await (const next of this) {
			result.push(next);
		}

		return result;
	}

	public async slice(amount: number) {
		const result: DocumentClient.AttributeMap[] = [];
		for await (const next of this) {
			result.push(next);
			if (result.length === amount) {
				break;
			}
		}

		return result;
	}

	protected abstract asyncSearch(input: Input): Promise<IOutput>;

	private async fillBatch() {
		while (this.batch.length === 0 && this.sourceIsEmpty === false) {
			const dynamoResponse = await this.getNextBlock();
			this.batch = dynamoResponse.Items;
			this.sourceIsEmpty = dynamoResponse.LastEvaluatedKey === undefined;
		}
	}

	private async getNextBlock() {
		const blockInput = Object.assign({}, this.input);
		if (this.lastEvaluatedKey) {
			blockInput.ExclusiveStartKey = this.lastEvaluatedKey;
		}
		const response = await this.asyncSearch(blockInput);
		this.lastEvaluatedKey = response.LastEvaluatedKey;
		if (undefined === this.lastEvaluatedKey) {
			this.sourceIsEmpty = true;
		}

		return response;
	}
}

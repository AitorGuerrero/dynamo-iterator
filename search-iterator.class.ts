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
	private done: boolean = false;

	private sourceIsEmpty = false;
	private lastEvaluatedKey: DocumentClient.Key;
	private processing: boolean = false;

	protected constructor(
		protected input: Input & IInput,
	) {}

	public [Symbol.iterator]() {
		return this;
	}

	public next() {
		const done = this.done;
		if (this.processing) {
			throw new Error("processing");
		}
		this.processing = true;
		const nextPromise = this.nextAsync();
		nextPromise.then(() => this.processing = false);

		return {done, value: nextPromise};
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
		for (const nextPromise of this) {
			result.push(await nextPromise);
		}

		return result;
	}

	public async slice(amount: number) {
		const result: DocumentClient.AttributeMap[] = [];
		for (const nextPromise of this) {
			result.push(await nextPromise);
			if (result.length === amount) {
				break;
			}
		}

		return result;
	}

	protected abstract asyncSearch(input: Input): Promise<IOutput>;

	private async nextAsync() {
		while (this.batch.length === 0 && this.sourceIsEmpty === false) {
			const dynamoResponse = await this.getNextBlock();
			this.batch = dynamoResponse.Items;
			this.sourceIsEmpty = dynamoResponse.LastEvaluatedKey === undefined;
		}
		if (this.batch.length === 0) {
			return;
		}
		const next = this.batch.shift();
		this.done = this.isDone();

		return next;
	}

	private isDone() {
		return this.sourceIsEmpty && this.batch.length === 0;
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

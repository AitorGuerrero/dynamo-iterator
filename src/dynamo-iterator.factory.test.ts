/* tslint:disable:no-unused-expression */
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {expect} from "chai";
import {beforeEach, describe, it} from "mocha";
import DynamoIteratorFactory from "./dynamo-iterator.factory";
import FakeDocumentClient from "./fake.document-client.class";

describe("Having a iterator document client", () => {

	let dynamoGeneratorFactory: DynamoIteratorFactory;
	let fakeDocumentClient: FakeDocumentClient;

	beforeEach(() => {
		fakeDocumentClient = new FakeDocumentClient();
		dynamoGeneratorFactory = new DynamoIteratorFactory(fakeDocumentClient as unknown as DocumentClient);
	});

	describe("and document client having 4 items", () => {

		const itemsAmount = 4;

		beforeEach(() => {
			for (let i = 0; i < itemsAmount; i++) {
				fakeDocumentClient.list.push({value: buildItem(i)});
			}
		});
		describe("and asking to scan", () => {
			let generator: AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>;
			beforeEach(() => generator = dynamoGeneratorFactory.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					for await (const item of generator) {
						items.push(item);
					}
				});
				it("should iterate all items", () => expect(items).to.be.length(itemsAmount));
				it("should iterate in correct order", () => {
					for (let i = 0; i < itemsAmount; i++) {
						expect(items[i].id).to.be.eq(buildId(i));
					}
				});
			});
		});
	});

	describe("and document client having 5 items", () => {

		const itemsAmount = 5;

		beforeEach(() => {
			for (let i = 0; i < itemsAmount; i++) {
				fakeDocumentClient.list.push({value: buildItem(i)});
			}
		});
		describe("and asking to scan", () => {
			let generator: AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>;
			beforeEach(() => generator = dynamoGeneratorFactory.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					for await (const item of generator) {
						items.push(item);
					}
				});
				it("should iterate all items", () => expect(items).to.be.length(itemsAmount));
				it("should iterate in correct order", () => {
					for (let i = 0; i < itemsAmount; i++) {
						expect(items[i].id).to.be.eq(buildId(i));
					}
				});
			});
			describe("and iterating with next method", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					let item: DocumentClient.AttributeMap;
					while (item = (await generator.next()).value) {
						items.push(item);
					}
				});
				it("should iterate all items", () => expect(items).to.be.length(itemsAmount));
				it("should iterate in correct order", () => {
					for (let i = 0; i < itemsAmount; i++) {
						expect(items[i].id).to.be.eq(buildId(i));
					}
				});
			});
		});
		describe("and asking to query", () => {
			let generator: AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>;
			beforeEach(() => generator = dynamoGeneratorFactory.query({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[];
				beforeEach(async () => {
					items = [];
					for await (const item of generator) {
						items.push(item);
					}
				});
				it("should iterate all items", () => expect(items).to.be.length(5));
			});
		});
		describe("and there are no items in the collection", () => {
			beforeEach(() => fakeDocumentClient.list = []);
			describe("and asking to query", () => {
				let generator: AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>;
				beforeEach(() => generator = dynamoGeneratorFactory.query({TableName: "tableName"}));
				it("should no iterate", async () => {
					for await (const item of generator) {
						expect.fail("should not iterate");
					}
				});
			});
		});
		describe("and last items batch is empty", () => {
			beforeEach(() => fakeDocumentClient.list.push(
				{value: buildItem(5), matches: false},
				{value: buildItem(6), matches: false},
				{value: buildItem(7), matches: false},
			));
			describe("and asking to scan", () => {
				let generator: AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>;
				beforeEach(() => generator = dynamoGeneratorFactory.scan({TableName: "tableName"}));
				describe("and iterating the response", () => {
					let items: DocumentClient.AttributeMap[] = [];
					beforeEach(async () => {
						items = [];
						for await (const item of generator) {
							items.push(item);
						}
					});
					it("should iterate all items", () => expect(items).to.be.length(itemsAmount));
				});
			});
		});
		describe("and middle items batch is empty", () => {
			beforeEach(() => fakeDocumentClient.list = [
				{value: buildItem(0)},
				{value: buildItem(1)},
				{value: buildItem(2), matches: false},
				{value: buildItem(3), matches: false},
				{value: buildItem(4), matches: false},
				{value: buildItem(5)},
			]);
			describe("and asking to scan", () => {
				let generator: AsyncGenerator<DynamoDB.DocumentClient.AttributeMap>;
				beforeEach(() => generator = dynamoGeneratorFactory.scan({TableName: "tableName"}));
				describe("and iterating the response", () => {
					let items: DocumentClient.AttributeMap[] = [];
					beforeEach(async () => {
						items = [];
						for await (const item of generator) {
							items.push(item);
						}
					});
					it("should iterate all items", () => expect(items).to.be.length(3));
				});
			});
		});
	});

	function buildItem(i: number) {
		return {id: buildId(i)};
	}

	function buildId(i: number) {
		return `item${i}Id`;
	}
});

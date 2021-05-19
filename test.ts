/* tslint:disable:no-unused-expression */
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {expect} from "chai";
import {beforeEach, describe, it} from "mocha";
import DynamoIteratorFactory from "./dynamo-iterator.factory";
import FakeDocumentClient from "./fake.document-client.class";
import QueryIterator from "./query-iterator.class";
import ScanIterator from "./scan-iterator.class";

describe("Having a iterator document client", () => {

	let dynamoIteratorFactory: DynamoIteratorFactory;
	let fakeDocumentClient: FakeDocumentClient;

	beforeEach(() => {
		fakeDocumentClient = new FakeDocumentClient();
		dynamoIteratorFactory = new DynamoIteratorFactory(fakeDocumentClient as any as DocumentClient);
	});

	describe("and document client having 4 items", () => {

		const itemsAmount = 4;

		beforeEach(() => {
			for (let i = 0; i < itemsAmount; i++) {
				fakeDocumentClient.list.push({value: buildItem(i)});
			}
		});
		describe("and asking to scan", () => {
			let iterator: ScanIterator;
			beforeEach(async () => iterator = dynamoIteratorFactory.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					for await (const item of iterator as any) {
						items.push(item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(itemsAmount));
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
			let iterator: ScanIterator;
			beforeEach(async () => iterator = dynamoIteratorFactory.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					for await (const item of iterator) {
						items.push(item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(itemsAmount));
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
					while (item = (await iterator.next()).value) {
						items.push(item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(itemsAmount));
				it("should iterate in correct order", () => {
					for (let i = 0; i < itemsAmount; i++) {
						expect(items[i].id).to.be.eq(buildId(i));
					}
				});
			});
			describe("and converting to array", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => items = await iterator.toArray());
				it("should iterate all items", async () => expect(items).to.be.length(itemsAmount));
				it("should iterate in correct order", () => {
					for (let i = 0; i < itemsAmount; i++) {
						expect(items[i].id).to.be.eq(buildId(i));
					}
				});
			});
			describe("and asking for the count", () => {
				let count: number;
				beforeEach(async () => count = await iterator.count());
				it("should return all items count", () => expect(count).to.be.eq(5));
			});
			describe("and asking to slice", () => {
				const askedAmount = 4;
				let sliced: DocumentClient.AttributeMap[];
				beforeEach(async () => sliced = await iterator.slice(askedAmount));
				it("should return the asked amount", () => expect(sliced).to.be.length(askedAmount));
				describe("and asking for the 5th item", () => {
					let itemResult: {done: boolean, value: DynamoDB.DocumentClient.AttributeMap};
					beforeEach(async () => itemResult = await iterator.next());
					it("should return undefined", async () => {
						expect(itemResult.done).to.be.equal(false);
						const item = itemResult.value;
						expect(item.id).to.be.equal("item4Id");
					});
				});
			});
			describe("and asking to slice more than available", () => {
				const askedAmount = itemsAmount + 5;
				let sliced: DocumentClient.AttributeMap[];
				beforeEach(async () => sliced = await iterator.slice(askedAmount));
				it("should return available amount", () => expect(sliced).to.be.length(itemsAmount));
				describe("and asking for the next item", () => {
					let itemResult: {done: boolean, value: DynamoDB.DocumentClient.AttributeMap};
					beforeEach(async () => itemResult = await iterator.next());
					it("should return undefined", async () => {
						expect(itemResult.done).to.be.equal(true);
						const item = itemResult.value;
						expect(item).to.be.undefined;
					});
				});
			});
			describe("and iterating without awaiting to the result", () => {
				let thrownError: Error;
				beforeEach(async () => {
					try {
						iterator.next();
						await iterator.next();
					} catch (err) {
						thrownError = err;
					}
				});
				it("should throw error", () => expect(thrownError).instanceOf(Error));
			});
		});
		describe("and asking to query", () => {
			let iterator: QueryIterator;
			beforeEach(async () => iterator = dynamoIteratorFactory.query({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[];
				beforeEach(async () => {
					items = [];
					for await (const item of iterator) {
						items.push(item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(5));
			});
		});
		describe("and there are no items in the collection", () => {
			beforeEach(() => fakeDocumentClient.list = []);
			describe("and asking to query", () => {
				let iterator: QueryIterator;
				beforeEach(async () => iterator = dynamoIteratorFactory.query({TableName: "tableName"}));
				it("should no iterate", async () => {
					for await (const item of iterator) {
						expect.fail("should not iterate");
					}
				});
			});
		});
		describe("and asking for count by query", () => {
			let countResult: number;
			beforeEach(async () => countResult = await dynamoIteratorFactory.query({TableName: "tableName"}).count());
			it("should return document client items amount", () => expect(countResult).to.be.eq(5));
		});
		describe("and asking for count by scan", () => {
			let countResult: number;
			beforeEach(async () => countResult = await dynamoIteratorFactory.scan({TableName: "tableName"}).count());
			it("should return document client items amount", () => expect(countResult).to.be.eq(5));
		});
		describe("and last items batch is empty", () => {
			beforeEach(() => fakeDocumentClient.list.push(
				{value: buildItem(5), matches: false},
				{value: buildItem(6), matches: false},
				{value: buildItem(7), matches: false},
			));
			describe("and asking to scan", () => {
				let iterator: ScanIterator;
				beforeEach(async () => iterator = dynamoIteratorFactory.scan({TableName: "tableName"}));
				describe("and iterating the response", () => {
					let items: DocumentClient.AttributeMap[] = [];
					beforeEach(async () => {
						items = [];
						for await (const item of iterator) {
							items.push(item);
						}
					});
					it("should iterate all items", async () => {
						expect(items).to.be.length(itemsAmount);
					});
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
				let iterator: ScanIterator;
				beforeEach(async () => iterator = dynamoIteratorFactory.scan({TableName: "tableName"}));
				describe("and iterating the response", () => {
					let items: DocumentClient.AttributeMap[] = [];
					beforeEach(async () => {
						items = [];
						for await (const item of iterator) {
							items.push(item);
						}
					});
					it("should iterate all items", async () => {
						expect(items).to.be.length(3);
					});
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

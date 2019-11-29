import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {expect} from "chai";
import {beforeEach, describe, it} from "mocha";
import IteratorDocumentClient from ".";
import FakeDocumentClient from "./fake.document-client.class";
import QueryIterator from "./query-iterator.class";
import ScanIterator from "./scan-iterator.class";

describe("Having a iterator document client", () => {

	let iteratorDocumentClient: IteratorDocumentClient;
	let fakeDocumentClient: FakeDocumentClient;

	beforeEach(() => {
		fakeDocumentClient = new FakeDocumentClient();
		iteratorDocumentClient = new IteratorDocumentClient(fakeDocumentClient as any as DocumentClient);
	});

	describe("and document client having 2 batches of items", () => {
		const item0Id = "item0Id";
		const item1Id = "item1Id";
		const item5Id = "item5Id";
		beforeEach(() => fakeDocumentClient.list
			= [{id: item0Id}, {id: item1Id}, {id: "item3"}, {id: "item4"}, {id: item5Id}]);
		describe("and asking to scan", () => {
			let iterator: ScanIterator;
			beforeEach(async () => iterator = await iteratorDocumentClient.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[];
				beforeEach(async () => {
					items = [];
					for (const item of iterator) {
						items.push(await item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(5));
				it("should iterate in correct order", () => {
					expect(items[0].id).to.be.eq(item0Id);
					expect(items[1].id).to.be.eq(item1Id);
					expect(items[4].id).to.be.eq(item5Id);
				});
			});
			describe("and iterating with next method", () => {
				let items: DocumentClient.AttributeMap[];
				beforeEach(async () => {
					items = [];
					let item: DocumentClient.AttributeMap;
					while (item = await iterator.next().value) {
						items.push(item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(5));
				it("should iterate in correct order", () => {
					expect(items[0].id).to.be.eq(item0Id);
					expect(items[1].id).to.be.eq(item1Id);
					expect(items[4].id).to.be.eq(item5Id);
				});
			});
			describe("and converting to array", () => {
				let items: DocumentClient.AttributeMap[];
				beforeEach(async () => items = await iterator.toArray());
				it("should return all items", async () => expect(items).to.be.length(5));
				it("should return in correct order", () => {
					expect(items[0].id).to.be.eq(item0Id);
					expect(items[1].id).to.be.eq(item1Id);
					expect(items[4].id).to.be.eq(item5Id);
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
			});
			describe("and iterating without awaiting to the result", () => {
				let thrownError: Error;
				beforeEach(() => {
					try {
						iterator.next();
						iterator.next();
					} catch (err) {
						thrownError = err;
					}
				});
				it("should throw error", () => expect(thrownError).instanceOf(Error));
			});
		});
		describe("and asking to query", () => {
			let iterator: QueryIterator;
			beforeEach(async () => iterator = await iteratorDocumentClient.query({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[];
				beforeEach(async () => {
					items = [];
					for (const item of iterator) {
						items.push(await item);
					}
				});
				it("should iterate all items", async () => expect(items).to.be.length(5));
			});
		});
		describe("and there are no items in the collection", () => {
			beforeEach(() => fakeDocumentClient.list = []);
			describe("and asking to query", () => {
				let iterator: QueryIterator;
				beforeEach(async () => iterator = await iteratorDocumentClient.query({TableName: "tableName"}));
				it("should no iterate", async () => {
					for (const item of iterator) {
						expect.fail("should not iterate");
					}
				});
			});
		});
	});
});

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

	describe("and document client having 4 items", () => {

		const itemsAmount = 4;

		beforeEach(() => {
			for (let i = 0; i < itemsAmount; i++) {
				fakeDocumentClient.list.push({id: buildId(i)});
			}
		});
		describe("and asking to scan", () => {
			let iterator: ScanIterator;
			beforeEach(async () => iterator = await iteratorDocumentClient.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					for (const item of iterator) {
						items.push(await item);
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

	describe("and document client having 5 of items", () => {

		const itemsAmount = 5;

		beforeEach(() => {
			for (let i = 0; i < itemsAmount; i++) {
				fakeDocumentClient.list.push({id: buildId(i)});
			}
		});
		describe("and asking to scan", () => {
			let iterator: ScanIterator;
			beforeEach(async () => iterator = await iteratorDocumentClient.scan({TableName: "tableName"}));
			describe("and iterating the response", () => {
				let items: DocumentClient.AttributeMap[] = [];
				beforeEach(async () => {
					items = [];
					for (const item of iterator) {
						items.push(await item);
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
					while (item = await iterator.next().value) {
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
		describe("and asking for count by query", () => {
			let countResult: number;
			beforeEach(async () => countResult = await iteratorDocumentClient.countQuery({TableName: "tableName"}));
			it("should return document client items amount", () => expect(countResult).to.be.eq(5));
		});
		describe("and asking for count by scan", () => {
			let countResult: number;
			beforeEach(async () => countResult = await iteratorDocumentClient.countScan({TableName: "tableName"}));
			it("should return document client items amount", () => expect(countResult).to.be.eq(5));
		});
	});

	function buildId(i: number) {
		return `item${i}Id`;
	}
});

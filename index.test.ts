import fs from "node:fs";
import { join } from "node:path";
import type { Browser } from "puppeteer";
import { jest } from "@jest/globals";
import { generatePDF, generateSlug } from "./index";

beforeAll(() => {
	jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
	(console.log as jest.Mock).mockRestore();
});

describe("generatePDF", () => {
	it("should generate a PDF for a valid URL", async () => {
		const mockBrowser = {
			newPage: async () => ({
				evaluate: async () => [
					"https://example.com/page1",
					"https://example.com/page2",
					"https://example.com/page3",
				],
				pdf: async () => {
					const fixturePath = join(process.cwd(), "fixture.pdf");
					return Buffer.from(fs.readFileSync(fixturePath));
				},
				goto: async () => {},
				close: async () => {},
			}),
			close: async () => {},
		} as unknown as Browser;

		const url = "https://example.com";
		const urlPattern = new RegExp(`^${url}`);
		const pdfBuffer = await generatePDF(
			mockBrowser as unknown as Browser,
			url,
			urlPattern,
		);

		expect(pdfBuffer).toBeInstanceOf(Buffer);
	});
});

describe("testGenerateSlug", () => {
	it("should generate correct slug for various URLs", () => {
		const testCases = [
			{ input: "https://example.com", expected: "example-com" },
			{
				input: "http://example.com/path/to/page",
				expected: "example-com-path-to-page",
			},
			{
				input: "https://example.com?query=param",
				expected: "example-com-query-param",
			},
			{ input: "https://example.com#anchor", expected: "example-com-anchor" },
			{
				input: "https://example.com/path with spaces/",
				expected: "example-com-path-with-spaces",
			},
		];

		for (const { input, expected } of testCases) {
			const result = generateSlug(input);
			expect(result).toBe(expected);
		}
	});
});

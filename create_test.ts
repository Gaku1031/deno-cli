import $ from "https://deno.land/x/dax@0.39.2/mod.ts";

const result = await $`ls`.text();
const files = result.split("\n");

const selectedId = await $.select({
  message: "Select a file to cat:",
  options: files.filter(file => file.trim().length > 0),
});
const selectedFile = files[selectedId];

const generateTestFile = (fileName: string) => {
  const testName = fileName.split('.').slice(0, -1).join('.');
  const testTemplate = `import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
  Deno.test("${testName}", () => {
    assertEquals(true, true);
  });`;
  Deno.writeTextFileSync(`${testName}_test.ts`, testTemplate);
}

if (selectedFile) {
  generateTestFile(selectedFile);
} else {
  console.error("No file selected or invalid selection.");
}

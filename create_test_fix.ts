import $ from "https://deno.land/x/dax@0.39.2/mod.ts";

const result = await $`ls`.text();
const files = result.split("\n");

const selectedId = await $.select({
  message: "Select a file to cat:",
  options: files.filter(file => file.trim().length > 0),
});
const selectedFile = files[selectedId];

const generateTestFile = async (fileName: string) => {
  const fileContent = Deno.readTextFileSync(fileName);
  const testName = fileName.split('.').slice(0, -1).join('.');

  const prompt = `中身が以下のようなファイルがあります。このファイルのテストファイルを作成してください。${fileContent} コード部分のみ返すようにしてください。`;
  const KEY = Deno.env.get('OPENAI_API_KEY');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
      ]
    })
  });

  const data = await response.json();
  const fullResponseText = data.choices[0].message?.content;

  const codeMatch = fullResponseText.match(/```javascript([\s\S]*?)```/);
  console.log(codeMatch);
  const codeText = codeMatch ? codeMatch[1] : "// No code block found in the response";

  const testTemplate = `
    ${codeText}
  `;
  
  Deno.writeTextFileSync(`${testName}_test.ts`, testTemplate);
}

if (selectedFile) {
  await generateTestFile(selectedFile);
} else {
  console.error("No file selected or invalid selection.");
}

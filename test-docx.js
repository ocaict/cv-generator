const HTMLtoDOCX = require('html-to-docx');
const fs = require('fs');

const testHtml = `
<div style="color: blue;">
  <h1>John Doe</h1>
  <h2>Software Engineer</h2>
  <div style="display: flex;">
     <div style="width: 30%;">Sidebar</div>
     <div style="width: 70%;">Main content with <ul><li>Bullets</li></ul></div>
  </div>
</div>
`;

(async () => {
    const fileBuffer = await HTMLtoDOCX(testHtml, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });
    fs.writeFileSync('test.docx', fileBuffer);
    console.log("Done");
})();

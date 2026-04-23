import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

async function testExtraction() {
  const token = "YOUR_TOKEN_HERE"; // Need a valid token
  const filePath = "PATH_TO_TEST_PDF";

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const res = await fetch("http://localhost:5000/api/resumes/extract", {
    method: "POST",
    body: form,
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  console.log(data);
}

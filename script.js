document.getElementById('query-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const queryId = document.getElementById('queryId').value;
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch('/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryId }),
    });
    const result = await response.json();
    resultDiv.innerText = `Result: ${JSON.stringify(result)}`;
  } catch (error) {
    resultDiv.innerText = `Error: ${error.message}`;
  }
});

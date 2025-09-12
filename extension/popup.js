document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const factCheckBtn = document.getElementById('fact-check-btn');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');

    // API endpoint for the local backend
    const API_URL = 'http://127.0.0.1:8000/fact-check';

    factCheckBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            resultsContainer.innerHTML = '<p class="error">Please enter some text to analyze.</p>';
            return;
        }

        // Show loader and clear previous results
        loader.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        factCheckBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const report = await response.json();
            displayResults(report);

        } catch (error) {
            console.error('Error during fact-check:', error);
            resultsContainer.innerHTML = `<p class="error">An error occurred. Make sure the Python backend server is running. <br><br>Details: ${error.message}</p>`;
        } finally {
            // Hide loader and re-enable button
            loader.classList.add('hidden');
            factCheckBtn.disabled = false;
        }
    });

    /**
     * Renders the fact-checking report in the UI.
     * @param {object} report - The final report from the API.
     */
    function displayResults(report) {
        if (!report || !report.verified_claims) {
            resultsContainer.innerHTML = '<p class="error">Received an invalid report from the server.</p>';
            return;
        }

        let html = `<h2>Overall Verdict</h2><p>${report.summary}</p>`;
        html += '<h2>Individual Claims</h2>';

        if (report.verified_claims.length === 0) {
            html += '<p>No verifiable claims were found in the text.</p>';
        } else {
            report.verified_claims.forEach((verdict, index) => {
                const verdictClass = verdict.result.toLowerCase(); // 'supported' or 'refuted'
                html += `
                    <div class="claim-card">
                        <details>
                            <summary>
                                <span class="verdict-badge ${verdictClass}">${verdict.result}</span>
                                <strong>Claim ${index + 1}:</strong> ${verdict.claim_text}
                            </summary>
                            <div class="claim-details">
                                <h3>Reasoning</h3>
                                <p>${verdict.reasoning}</p>
                                <h3>Sources</h3>
                                ${formatSources(verdict.sources)}
                            </div>
                        </details>
                    </div>
                `;
            });
        }
        resultsContainer.innerHTML = html;
    }

    /**
     * Formats the list of sources into an HTML string.
     * @param {Array} sources - List of source objects.
     * @returns {string} - HTML string of sources.
     */
    function formatSources(sources) {
        if (!sources || sources.length === 0) {
            return '<p>No sources were found for this claim.</p>';
        }

        return sources.map(source => `
            <div class="source ${source.is_influential ? 'influential' : ''}">
                <a href="${source.url}" target="_blank">${source.title || 'Source Link'}</a>
                <p class="snippet">${source.text.substring(0, 150)}...</p>
            </div>
        `).join('');
    }
});
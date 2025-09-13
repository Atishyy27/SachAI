document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const factCheckBtn = document.getElementById('fact-check-btn');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');
    const API_URL = 'http://127.0.0.1:8000/fact-check';

    // --- NEW: Check if text was sent from the right-click menu ---
    chrome.storage.local.get(['selectedText'], (result) => {
        if (result.selectedText) {
            textInput.value = result.selectedText;
            // Clear the stored text so it's not used again
            chrome.storage.local.remove('selectedText');
            // Automatically start the fact-check
            factCheckBtn.click();
        }
    });

    factCheckBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            resultsContainer.innerHTML = '<p class="error">Please enter text to analyze.</p>';
            return;
        }

        loader.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        factCheckBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // --- FIX: Use 'answer' to match your Python server ---
                body: JSON.stringify({ "answer": text }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const report = await response.json();
            displayResults(report);

        } catch (error) {
            console.error('Error during fact-check:', error);
            resultsContainer.innerHTML = `<p class="error">An error occurred. Make sure your Python server is running.<br><br>Details: ${error.message}</p>`;
        } finally {
            loader.classList.add('hidden');
            factCheckBtn.disabled = false;
        }
    });

    function displayResults(report) {
        if (!report || !report.verified_claims) {
            resultsContainer.innerHTML = '<p class="error">Received an invalid report.</p>';
            return;
        }

        let html = `<h2>Overall Verdict</h2><p>${report.summary}</p><h2>Individual Claims</h2>`;
        if (report.verified_claims.length === 0) {
            html += '<p>No verifiable claims were found.</p>';
        } else {
            report.verified_claims.forEach((verdict, index) => {
                const verdictClass = verdict.result.toLowerCase().split(' ')[0];
                html += `
                    <div class="claim-card">
                        <details open>
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

    function formatSources(sources) {
        if (!sources || sources.length === 0) return '<p>No sources were found.</p>';
        return sources.map(source => `
            <div class="source ${source.is_influential ? 'influential' : ''}">
                <a href="${source.url}" target="_blank">${source.title || 'Source'}</a>
                <p class="snippet">${source.text ? source.text.substring(0, 150) + '...' : ''}</p>
            </div>
        `).join('');
    }
});
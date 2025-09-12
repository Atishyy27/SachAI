// This is the final, corrected script that matches your HTML.
document.addEventListener('DOMContentLoaded', function() {
    // Correctly get all elements from the HTML
    const form = document.getElementById('fact-check-form');
    const textInput = document.getElementById('input-text'); // Correct ID
    const submitBtn = document.getElementById('submit-btn'); // Correct ID
    const btnText = document.getElementById('btn-text');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    form.addEventListener('submit', handleFactCheck);
    
    async function handleFactCheck(e) {
        e.preventDefault();
        
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            const response = await fetch('/fact-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            displayResults(data);
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing your request. Please try again.');
        } finally {
            setLoadingState(false);
        }
    }
    
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Analyzing...';
            loadingDiv.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Fact-Check';
            loadingDiv.classList.add('hidden');
        }
    }
    
    function displayResults(data) {
        // Update claims badge
        const claimsBadge = document.getElementById('claims-badge');
        claimsBadge.textContent = `${data.verified_claims.length} claims verified`;
        
        // Display sources
        const sourcesList = document.getElementById('sources-list');
        const allSources = data.verified_claims.flatMap(claim => claim.sources).slice(0, 3);
        sourcesList.innerHTML = allSources.map(source => `
            <div class="source-item">
                <i data-lucide="external-link" class="icon-primary" style="margin-top: 2px; flex-shrink: 0;"></i>
                <div class="source-content">
                    <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="source-title">${source.title || 'Source'}</a>
                    <p class="source-text">${source.text ? source.text.substring(0, 150) + '...' : ''}</p>
                </div>
            </div>
        `).join('');
        
        // Display stats
        const stats = data.stats;
        document.getElementById('supported-pct').textContent = `${stats.supported}%`;
        document.getElementById('refuted-pct').textContent = `${stats.refuted}%`;
        document.getElementById('insufficient-pct').textContent = `${stats.insufficient}%`;
        document.getElementById('conflicting-pct').textContent = `${stats.conflicting}%`;
        
        // Update progress bar
        document.getElementById('progress-supported').style.width = `${stats.supported}%`;
        document.getElementById('progress-refuted').style.width = `${stats.refuted}%`;
        document.getElementById('progress-refuted').style.left = `${stats.supported}%`;
        document.getElementById('progress-insufficient').style.width = `${stats.insufficient}%`;
        document.getElementById('progress-insufficient').style.left = `${stats.supported + stats.refuted}%`;
        document.getElementById('progress-conflicting').style.width = `${stats.conflicting}%`;
        document.getElementById('progress-conflicting').style.left = `${stats.supported + stats.refuted + stats.insufficient}%`;

        // Display individual claims
        const claimsList = document.getElementById('claims-list');
        claimsList.innerHTML = data.verified_claims.map((claim, index) => `
            <div class="claim-item">
                <button class="claim-header" onclick="toggleClaim(${index})">
                    <div class="claim-header-content">
                        <div class="claim-info">
                            <span class="result-badge result-${claim.result.toLowerCase().split(' ')[0]}">${claim.result}</span>
                            <span class="claim-text">${claim.claim_text}</span>
                        </div>
                        <i data-lucide="chevron-down" class="chevron" id="chevron-${index}"></i>
                    </div>
                </button>
                <div class="claim-content hidden" id="claim-content-${index}">
                    <div class="claim-section"><h4>Reasoning:</h4><p>${claim.reasoning}</p></div>
                    <div class="claim-section"><h4>Sources:</h4><div class="claim-sources">
                        ${claim.sources.map(source => `
                            <div class="claim-source">
                                <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="claim-source-link">
                                    ${source.title || 'Source'}
                                    <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                                </a>
                                <p class="claim-source-text">${source.text ? source.text.substring(0, 200) + '...' : ''}</p>
                            </div>
                        `).join('')}
                    </div></div>
                </div>
            </div>
        `).join('');
        
        // Display summary
        document.getElementById('summary-text').textContent = data.summary;
        
        // Show results section
        resultsDiv.classList.remove('hidden');
        
        // Re-initialize Lucide icons
        lucide.createIcons();
    }
});

// Global function to toggle claims accordion
function toggleClaim(index) {
    const content = document.getElementById(`claim-content-${index}`);
    const chevron = document.getElementById(`chevron-${index}`);
    
    content.classList.toggle('hidden');
    
    if (content.classList.contains('hidden')) {
        chevron.setAttribute('data-lucide', 'chevron-down');
    } else {
        chevron.setAttribute('data-lucide', 'chevron-up');
    }
    
    lucide.createIcons();
}
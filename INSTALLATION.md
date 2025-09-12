

# sachAI Installation Guide

This guide will walk you through setting up the sachAI project on your local machine.

### Prerequisites

  - Python 3.11 or higher
  - `pip` for package installation
  - `git` for cloning the repository

### Step 1: Clone the Repository

Clone the project from GitHub and navigate into the project directory.

```bash
git clone <your-repository-url>
cd sachAI
```

### Step 2: Set up the Python Environment

Create a virtual environment and install the required packages.

```bash
# Create and activate a virtual environment
python -m venv venv
# On Windows:
# venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure API Keys

The application requires API keys for the language model and a search provider.

1.  Create a file named `.env` in the root directory of your project.

2.  Add your API keys to the file in the following format (do not use quotes).

    ```
    TAVILY_API_KEY=your_tavily_api_key
    ```

      * Find your Tavily API key on the [Tavily dashboard](https://www.google.com/search?q=https://tavily.com/dashboard).

### Step 4: Run the Application

Start the Streamlit web application.

```bash
streamlit run app.py
```

The application will launch in your web browser. You can now use it to fact-check statements.
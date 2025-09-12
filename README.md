# sachAI: The AI Fact-Checker

## Overview
sachAI is an AI-powered fact-checking application that leverages a chain of AI agents to verify factual statements. Built with Python, LangGraph, and Streamlit, this project demonstrates a modular approach to building sophisticated, multi-step AI workflows.

The core of sachAI is its agent-based pipeline, which breaks down complex tasks into a series of logical steps, each handled by a specialized AI agent.

## How It Works
1.  **Claim Extraction:** The system takes a block of text and uses an AI agent to identify and extract individual, verifiable claims.
2.  **Iterative Search:** For each claim, a search agent crafts precise queries and uses a search API (Tavily) to gather evidence from the web. The agent can perform multiple searches if the initial evidence is insufficient.
3.  **Evidence Evaluation:** A final evaluation agent analyzes all the gathered evidence to determine if the claim is "Supported," "Refuted," or "Insufficient Information."
4.  **Final Report:** The results from all claims are compiled into a comprehensive, easy-to-read report, which is displayed on the Streamlit web interface.

## Technologies Used
* **Python:** The core programming language for the application.
* **LangGraph:** A powerful library for building and orchestrating stateful, multi-step agentic workflows.
* **Streamlit:** Used to create the user-friendly, interactive web interface.
* **Tavily:** The search API that provides up-to-date, relevant evidence.

## Setup and Installation
For detailed setup instructions, please see the [Installation Guide](INSTALLATION.md) file.


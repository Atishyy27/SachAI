"""Unified LLM model instances and factory functions.

Provides access to configured language model instances for all modules.
"""

from langchain_core.language_models.chat_models import BaseChatModel
# from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
from utils.settings import settings


def get_llm(
    # CHANGE THIS LINE TO THE NEW MODEL NAME
    model_name: str = "dolphin-mistral",
    temperature: float = 0.0,
    completions: int = 1,
) -> BaseChatModel:
    """Get LLM with specified configuration.

    Args:
        model_name: The model to use
        temperature: Temperature for generation
        completions: How many completions we need (affects temperature for diversity)

    Returns:
        Configured LLM instance
    """
    # Use higher temp when doing multiple completions for diversity
    if completions > 1 and temperature == 0.0:
        temperature = 0.2

    # if not settings.groq_api_key:
    #     raise ValueError("Groq API key not found in environment variables")

    return ChatOllama(
        model=model_name,
        # groq_api_key=settings.groq_api_key,
        temperature=temperature,
    )


def get_default_llm() -> BaseChatModel:
    """Get default LLM instance."""
    return get_llm()
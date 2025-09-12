import logging
from typing import Dict, List
from claim_extractor.schemas import DisambiguatedContent, SelectedContent, State

logger = logging.getLogger(__name__)

async def disambiguation_node(state: State) -> Dict[str, List[DisambiguatedContent]]:
    """
    --- PASS-THROUGH NODE (Corrected) ---
    This node now simply takes the selected content and passes it directly
    to the next stage. The LLM call has been removed to make the pipeline
    more robust for the hackathon demo.
    """
    # --- THIS IS THE CORRECTED LINE ---
    # We access the 'selected_contents' attribute directly, not with .get()
    selected_contents = state.selected_contents or []

    if not selected_contents:
        logger.warning("Nothing to disambiguate (pass-through)")
        return {}

    # Convert 'SelectedContent' objects to 'DisambiguatedContent' objects
    # without making any changes to the text.
    disambiguated_contents = []
    for item in selected_contents:
        disambiguated_sentence = item.processed_sentence
        logger.info(f"Passing through sentence: '{disambiguated_sentence}'")
        disambiguated_contents.append(
            DisambiguatedContent(
                disambiguated_sentence=disambiguated_sentence,
                original_selected_item=item,
            )
        )

    logger.info(f"Successfully passed through {len(disambiguated_contents)} items.")
    return {"disambiguated_contents": disambiguated_contents}
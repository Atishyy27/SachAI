import asyncio
import typer
from rich.console import Console
from rich.panel import Panel
from rich.style import Style
from pyfiglet import Figlet

# Import your main fact-checking graph
from fact_checker.agent import graph

# --- NEW: Create a custom banner ---
custom_fig = Figlet(font='slant')
banner = custom_fig.renderText('Sach AI')

# Create a Typer app for our CLI
app = typer.Typer(
    name="sachai",
    help="A CLI for the SachAI Fact-Checker, powered by a local LLM.",
    add_completion=False
)

# Initialize Rich console for beautiful output
console = Console()

async def run_fact_check(text: str):
    """Asynchronously runs the fact-checking agent and prints results."""
    
    with console.status("[bold cyan]Analyzing your claim...", spinner="dots") as status:
        try:
            inputs = {"answer": text}
            
            status.update("[bold yellow]Running fact-checking pipeline...")
            final_state = await graph.ainvoke(inputs)
            
            final_report = final_state.get("final_report")

            if not final_report or not final_report.verified_claims:
                console.print(Panel("[bold red]Could not generate a complete report. The claim might be empty or invalid.", title="Error", border_style="red"))
                return

            console.rule("[bold green]Fact-Check Complete[/bold green]", style="green")

            for claim in final_report.verified_claims:
                if claim.result.value == "Supported":
                    border_style = "green"
                elif claim.result.value == "Refuted":
                    border_style = "red"
                else:
                    border_style = "yellow"

                content = f"[bold]Claim:[/bold] {claim.claim_text}\n\n"
                content += f"[bold]Reasoning:[/bold]\n{claim.reasoning}\n\n"
                
                source_text = "[bold]Sources:[/bold]\n"
                if claim.sources:
                    for source in claim.sources:
                        source_text += f"- [link={source.url}]{source.title or source.url}[/link]\n"
                else:
                    source_text += "No sources found."
                
                content += source_text

                console.print(
                    Panel(
                        content,
                        title=claim.result.value,
                        title_align="left",
                        border_style=border_style
                    )
                )

            console.print(f"\n[bold]Summary:[/bold] {final_report.summary}")

        except Exception as e:
            console.print(Panel(f"[bold red]An unexpected error occurred:[/bold red]\n{e}", title="Critical Error", border_style="red"))


@app.command()
def check(
    text_to_check: str = typer.Argument(..., help="The statement or text you want to fact-check.")
):
    """
    Analyzes, verifies, and fact-checks a given piece of text.
    """
    # --- NEW: Print the banner at the start ---
    console.print(f"[bold purple]{banner}[/bold purple]")
    console.print("--- LLM-Powered Local Fact-Checker ---", justify="center")
    
    asyncio.run(run_fact_check(text_to_check))


if __name__ == "__main__":
    app()
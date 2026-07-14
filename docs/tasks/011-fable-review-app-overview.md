## Goal
- Review the ai-handoff files in path `docs\ai-handoff`, check for vulnerabilities and architecture improvements.
- Find potential bug and suggest fixes.
- Check if the app is following best practices.
- Check if the app is following the spec, if not, suggest fixes.


## Contraints
- Whenever there is a decision that is worthy to add as ADR document it in `docs\adr`
- Check my `docs` folder to so you know what to update and make sure that the update can be easily spotted like add fable then the datetime or check whats the best approach on this when writing documenttations.
- Do not update database directly create a ticket issues for that or a task ticket if its small and include the instruction for the migration and the related tasks in it.
- Do not directly fixed or implement the bug or improvements you found, just document it and follow ceratin standards like in the matt pocock skills /to-issues and /to-ticket format
- Make sure that it can be understand by the  AI agent use prompt engineering, clear specs, constraint, goals and make sure the context is clear as i will handoff this to a more lower level model like sonnet or opus. So make sure to be specific as possible and all orchestration and decision point is already there.
- Be careful not to break the app, whenever you suggest a changes check if it will break or if there is a dependencies that will affect the changes.


## Output files
- output files should be markdown file that documents your findings, bugs or suggestion improvement.
- You can create a folder inside the `docs\ai-handoff` so you can easily make `issue` or `architecture-improvement`.
- Make sure that each of the issues is seperate and not too bloated, you can create the tickets or issues innone tickets as long as it is related to each other or in the same modules `customer`, `products`, `deliveries` and etc....
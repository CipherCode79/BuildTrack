# AI Microservice Design Notes

- `app/main.py`: keeps endpoint behavior explicit (`/extract`, `/health`) and avoids hidden framework magic.
- `app/extractor.py`: isolates OpenAI prompting/parsing so transport and AI logic stay decoupled.
- `app/matcher.py`: performs backend matching through REST, keeping microservice independent of DB internals.
- `app/schemas.py`: strict typed response contracts for reliable downstream handling.
- `app/config.py`: environment-driven config to keep secrets and deployment settings out of code.

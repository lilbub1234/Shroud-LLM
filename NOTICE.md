# Attribution and Open Source Credits

## Original Project

Shroud LLM is based on AnythingLLM by Mintplex Labs Inc.
- Original Repository: https://github.com/Mintplex-Labs/anything-llm
- Original License: MIT (see LICENSE.upstream)
- Copyright (c) Mintplex Labs Inc.

We are grateful to the Mintplex Labs team and the open source community for creating and maintaining AnythingLLM, which served as the foundation for Shroud LLM.

## Modifications

This project has been substantially modified and rebranded as "Shroud LLM" with:
- Enhanced privacy features (timer-based deletion, BYOK, redaction)
- Restructured codebase architecture
- New branding and user interface
- Privacy-first defaults (telemetry disabled by default)
- Additional security hardening

## Third-Party Dependencies

All third-party dependencies retain their original licenses. See individual package.json files in:
- /server/package.json
- /frontend/package.json
- /collector/package.json

For a complete list of dependencies and their licenses, run:
```bash
cd server && npm list
cd frontend && npm list
cd collector && npm list
```

## License

Shroud LLM is licensed under the MIT License (see LICENSE file).
The upstream AnythingLLM code is also licensed under MIT (see LICENSE.upstream).

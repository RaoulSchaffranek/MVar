---
home: true
heroImage: hero.svg
actionText: Get Started →
actionLink: /docs/
heroText: MVar
description: MVar data type for predictable low-level concurrency
features:
- title: Focused
  details: No dependencies. Barely 1.12KB minified and gzipped. MVar is only concerned with flow control and integrates with any state-management solution.
- title: Univeral
  details: Runs on every JavaScript-runtime-system. Builds are available for ES6 native modules, UMD, AMD, CommonJS, and as a standalone script.
- title: Hygienic
  details: We use a combination of static type checking, property-based testing, and static code analysis to prevent bugs from sneaking into the system.
footer: The Unlicense
---

## Try it!

Here is how you would write a simple "Hello World"-program using MVar. The call to `setTimeout` is only of pathological character to demonstrate how MVar handles asynchrounous tasks. Head over to the documentation-site for a larger [example](docs/#example).

<iframe style="width:100%; min-height: 19rem" src="https://stackblitz.com/edit/mvar-hello-world?embed=1&file=index.ts&hideExplorer=1"></iframe>

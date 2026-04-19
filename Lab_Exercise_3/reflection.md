# Reflection

For this lab, I used both the native Fetch API and jQuery AJAX in the same weather dashboard, and the comparison became much clearer after building a full request chain. I used Fetch with `async/await` for the geocoding and weather requests because the syntax is easier to read when multiple dependent calls are involved. The flow from city search to geocoding result to weather forecast feels close to normal procedural logic, so it is simpler to debug and maintain. Fetch also works well with `try/catch`, which made it straightforward to handle HTTP errors, network failures, and `AbortController` timeouts in one place.

jQuery AJAX was still useful for the WorldTimeAPI request. The `.done()`, `.fail()`, and `.always()` chain is concise and clearly separates success, failure, and cleanup logging. However, compared with Fetch, it feels more tied to an older style of promise handling. I had to think more carefully about where fallback logic belonged, while the Fetch section felt more natural because `await` kept the code flatter and easier to scan.

In terms of verbosity, jQuery can be shorter for simple JSON requests, especially with `$.getJSON()`, but Fetch gives me more explicit control over response validation and cancellation. Browser support used to be a stronger reason to prefer jQuery AJAX, but in modern development the Fetch API is widely supported and better aligned with current JavaScript patterns.

Overall, I prefer Fetch for most application code because it is cleaner for chained asynchronous logic and stronger for error handling. I would still use jQuery AJAX when maintaining older projects that already depend on jQuery.

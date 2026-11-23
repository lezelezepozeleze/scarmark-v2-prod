import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    // Foundry and browser globals the module code uses. A name that is not listed (or not imported) is an error, so a forgotten import is caught here and not when the code runs in Foundry.
    files: ["module/**/*.mjs"],
    languageOptions: {
      globals: Object.fromEntries([
        "game", "foundry", "ui", "canvas", "CONFIG", "CONST", "Hooks", "Roll", "ChatMessage", "Actor", "Item", "ActiveEffect", "fromUuid", "fromUuidSync", "Handlebars",
        "document", "window", "navigator", "HTMLElement", "AbortController", "Element", "Event", "DOMParser", "getComputedStyle", "innerWidth", "innerHeight", "requestAnimationFrame",
        "performance", "setTimeout", "clearTimeout", "console", "structuredClone", "Intl", "globalThis", "SimpleCalendar"
      ].map(name => [name, "readonly"]))
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn"
    }
  },
  {
    // Architecture guard: rules/ and config/ are pure (no Foundry globals, no randomness, no Foundry-facing layers). See docs/AGENTS.md.
    files: ["module/rules/**", "module/config/**", "module/view/**"],
    rules: {
      "no-restricted-globals": ["error",
        ...["game", "foundry", "ui", "canvas", "CONFIG", "Hooks", "Roll", "ChatMessage", "Actor", "Item", "ActiveEffect", "fromUuid", "fromUuidSync", "Handlebars"]
          .map(name => ({ name, message: "module/rules, module/config and module/view must not use Foundry globals; pass values in as parameters." }))
      ],
      "no-restricted-properties": ["error",
        { object: "Math", property: "random", message: "module/rules, module/config and module/view must not use Math.random; take the random number as a parameter." }
      ],
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["../data/*", "../helpers/*", "../sheets/*", "../foundry/*", "../../data/*", "../../helpers/*", "../../sheets/*", "../../foundry/*"],
          message: "module/rules, module/config and module/view must not depend on Foundry-facing layers (data, helpers, sheets, foundry)."
        }]
      }]
    }
  },
  {
    files: ["tests/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        Buffer: "readonly",
        console: "readonly",
        structuredClone: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
        require: "readonly",
        module: "readonly",
        global: "readonly"
      }
    }
  }
];

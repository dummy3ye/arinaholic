/** @type {import('stylelint').Config} */
const tailwindAtRules = [
  "custom-variant",
  "theme",
  "source",
  "utility",
  "variant",
  "apply",
  "reference",
  "config",
  "plugin",
];

export default {
  extends: ["stylelint-config-standard-scss"],
  rules: {
    "scss/at-rule-no-unknown": [true, { ignoreAtRules: tailwindAtRules }],

    // Biome owns formatting; Stylelint only checks stylesheet semantics.
    // Existing styles intentionally use camelCase CSS module classes, modern
    // media range syntax, and legacy browser fallbacks.
    "declaration-block-no-redundant-longhand-properties": null,
    "length-zero-no-unit": null,
    "media-feature-range-notation": null,
    "property-no-deprecated": null,
    "property-no-vendor-prefix": null,
    "selector-class-pattern": null,
    "value-keyword-case": null,
    "at-rule-empty-line-before": null,
    "comment-empty-line-before": null,
    "comment-whitespace-inside": null,
    "custom-property-empty-line-before": null,
    "declaration-empty-line-before": null,
    "rule-empty-line-before": null,
    "scss/at-else-closing-brace-newline-after": null,
    "scss/at-else-closing-brace-space-after": null,
    "scss/at-else-empty-line-before": null,
    "scss/at-else-if-parentheses-space-before": null,
    "scss/at-function-parentheses-space-before": null,
    "scss/at-if-closing-brace-newline-after": null,
    "scss/at-if-closing-brace-space-after": null,
    "scss/at-mixin-argumentless-call-parentheses": null,
    "scss/at-mixin-parentheses-space-before": null,
    "scss/dollar-variable-colon-space-after": null,
    "scss/dollar-variable-colon-space-before": null,
    "scss/dollar-variable-empty-line-before": null,
    "scss/double-slash-comment-empty-line-before": null,
    "scss/double-slash-comment-whitespace-inside": null,
  },
};

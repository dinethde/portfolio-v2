// Read-only Figma Plugin API script. Run it with the Figma MCP `use_figma` tool on file
// op5jPr3yqBUUTyi2CJGQI3, then save the returned JSON as src/styles/figma-variables.json
// (keep the "_source" and "exportedAt" fields) and run: python3 scripts/build_tokens.py
//
// It returns every local variable (default mode; aliases kept by name) and every local text style.

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(vars.map((v) => [v.id, v]));
const colById = Object.fromEntries(cols.map((c) => [c.id, c]));
const hex = (c) => {
  const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : "");
};

const variables = vars.map((v) => {
  const c = colById[v.variableCollectionId];
  const val = v.valuesByMode[c.defaultModeId];
  const rec = { collection: c.name, name: v.name, type: v.resolvedType };
  if (val && typeof val === "object" && val.type === "VARIABLE_ALIAS") rec.alias = byId[val.id]?.name ?? val.id;
  else rec.value = v.resolvedType === "COLOR" ? hex(val) : val;
  return rec;
});

const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
  name: s.name,
  family: s.fontName.family,
  style: s.fontName.style,
  size: s.fontSize,
  lineHeightPercent: s.lineHeight.unit === "PERCENT" ? Math.round(s.lineHeight.value) : null,
  letterSpacingPx: s.letterSpacing.unit === "PIXELS" ? s.letterSpacing.value : 0,
}));

return { variables, textStyles };

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");

const parserPlugins = [
  "jsx",
  "typescript",
  "classProperties",
  "objectRestSpread",
  "optionalChaining",
  "nullishCoalescingOperator",
  "dynamicImport",
];

const isCommonBarrelImport = (sourceValue) => {
  const normalized = sourceValue.replace(/\\/g, "/");
  return /(^|\/)common(\/index(\.[a-z]+)?)?$/.test(normalized);
};

const walk = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (entry.isFile() && /\.(jsx|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
};

const getClassNameTokensFromExpression = (node, tokens) => {
  if (!node) return;

  if (t.isStringLiteral(node)) {
    node.value
      .split(/[^a-zA-Z0-9_]+/)
      .filter(Boolean)
      .forEach((s) => tokens.add(s.toLowerCase()));
    return;
  }

  if (t.isTemplateLiteral(node)) {
    for (const q of node.quasis) {
      q.value.raw
        .split(/[^a-zA-Z0-9_]+/)
        .filter(Boolean)
        .forEach((s) => tokens.add(s.toLowerCase()));
    }
    for (const exp of node.expressions) {
      getClassNameTokensFromExpression(exp, tokens);
    }
    return;
  }

  if (t.isIdentifier(node)) {
    tokens.add(node.name.toLowerCase());
    return;
  }

  if (t.isMemberExpression(node)) {
    if (t.isIdentifier(node.property)) {
      tokens.add(node.property.name.toLowerCase());
    } else if (t.isStringLiteral(node.property)) {
      tokens.add(node.property.value.toLowerCase());
    }
    return;
  }

  if (t.isConditionalExpression(node)) {
    getClassNameTokensFromExpression(node.consequent, tokens);
    getClassNameTokensFromExpression(node.alternate, tokens);
    return;
  }

  if (t.isLogicalExpression(node) || t.isBinaryExpression(node)) {
    getClassNameTokensFromExpression(node.left, tokens);
    getClassNameTokensFromExpression(node.right, tokens);
    return;
  }

  if (t.isCallExpression(node)) {
    for (const arg of node.arguments) {
      if (t.isSpreadElement(arg)) continue;
      getClassNameTokensFromExpression(arg, tokens);
    }
    return;
  }

  if (t.isArrayExpression(node)) {
    for (const el of node.elements) {
      if (!el) continue;
      getClassNameTokensFromExpression(el, tokens);
    }
    return;
  }

  if (t.isObjectExpression(node)) {
    for (const prop of node.properties) {
      if (t.isObjectProperty(prop)) {
        const key = prop.key;
        if (t.isIdentifier(key)) tokens.add(key.name.toLowerCase());
        if (t.isStringLiteral(key)) tokens.add(key.value.toLowerCase());
        getClassNameTokensFromExpression(prop.value, tokens);
      }
    }
  }
};

const getClassNameTokens = (openingEl) => {
  const tokens = new Set();
  const classAttr = openingEl.attributes.find(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: "className" }),
  );
  if (!classAttr || !classAttr.value) return tokens;

  if (t.isStringLiteral(classAttr.value)) {
    getClassNameTokensFromExpression(classAttr.value, tokens);
    return tokens;
  }

  if (t.isJSXExpressionContainer(classAttr.value)) {
    getClassNameTokensFromExpression(classAttr.value.expression, tokens);
  }

  return tokens;
};

const hasAttr = (openingEl, name) =>
  openingEl.attributes.some(
    (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name }),
  );

const inferVariant = (tokens) => {
  const s = [...tokens].join(" ");

  const has = (arr) => arr.some((k) => s.includes(k));

  if (
    has([
      "danger",
      "delete",
      "delbtn",
      "del",
      "remove",
      "reject",
      "archive",
      "block",
      "deactivate",
      "unpublish",
    ])
  ) {
    return "danger";
  }

  if (has(["success", "approve", "accept"])) return "success";
  if (has(["outline", "outlined"])) return "outline";
  if (has(["secondary", "btnsecondary"])) return "secondary";

  if (
    has([
      "ghost",
      "back",
      "close",
      "cancel",
      "clear",
      "filter",
      "tab",
      "link",
      "reset",
      "view",
      "less",
      "more",
    ])
  ) {
    return "ghost";
  }

  return "primary";
};

const inferSize = (tokens) => {
  const s = [...tokens].join(" ");

  const has = (arr) => arr.some((k) => s.includes(k));

  if (has(["lg", "large", "hero", "cta"])) return "lg";
  if (
    has([
      "sm",
      "small",
      "icon",
      "tab",
      "back",
      "close",
      "clear",
      "filter",
      "link",
    ])
  ) {
    return "sm";
  }
  return "md";
};

const allFiles = walk(srcRoot);
let filesChanged = 0;
let buttonsTouched = 0;

for (const filePath of allFiles) {
  const code = fs.readFileSync(filePath, "utf8");
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: parserPlugins,
      errorRecovery: true,
    });
  } catch {
    continue;
  }

  let changed = false;

  traverse(ast, {
    Program(programPath) {
      const buttonLocals = new Set();

      for (const stmtPath of programPath.get("body")) {
        if (!stmtPath.isImportDeclaration()) continue;
        const sourceValue = stmtPath.node.source.value;
        if (!isCommonBarrelImport(sourceValue)) continue;

        for (const specifier of stmtPath.node.specifiers) {
          if (
            t.isImportSpecifier(specifier) &&
            t.isIdentifier(specifier.imported, { name: "Button" })
          ) {
            buttonLocals.add(specifier.local.name);
          }
        }
      }

      if (buttonLocals.size === 0) return;

      programPath.traverse({
        JSXOpeningElement(jsxPath) {
          const nameNode = jsxPath.node.name;
          if (!t.isJSXIdentifier(nameNode)) return;
          if (!buttonLocals.has(nameNode.name)) return;

          const openingEl = jsxPath.node;

          const prevLen = openingEl.attributes.length;
          openingEl.attributes = openingEl.attributes.filter(
            (attr) =>
              !(
                t.isJSXAttribute(attr) &&
                t.isJSXIdentifier(attr.name, { name: "unstyled" })
              ),
          );
          if (openingEl.attributes.length !== prevLen) changed = true;

          const tokens = getClassNameTokens(openingEl);

          if (!hasAttr(openingEl, "variant")) {
            openingEl.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier("variant"),
                t.stringLiteral(inferVariant(tokens)),
              ),
            );
            changed = true;
          }

          if (!hasAttr(openingEl, "size")) {
            openingEl.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier("size"),
                t.stringLiteral(inferSize(tokens)),
              ),
            );
            changed = true;
          }

          buttonsTouched++;
        },
      });
    },
  });

  if (!changed) continue;

  const output = generate(
    ast,
    {
      jsescOption: { minimal: true },
      retainLines: false,
    },
    code,
  ).code;

  if (output !== code) {
    fs.writeFileSync(filePath, `${output}\n`, "utf8");
    filesChanged++;
  }
}

console.log(
  JSON.stringify(
    {
      filesScanned: allFiles.length,
      filesChanged,
      buttonsTouched,
    },
    null,
    2,
  ),
);

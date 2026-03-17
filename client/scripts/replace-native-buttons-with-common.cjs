const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const commonDir = path.join(srcRoot, "components", "common");
const commonButtonFile = path.normalize(
  path.join(commonDir, "Button", "Button.jsx"),
);

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

const getRelativeCommonImport = (filePath) => {
  let relative = path.relative(path.dirname(filePath), commonDir);
  relative = relative.replace(/\\/g, "/");
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return relative;
};

const getUniqueLocalName = (programPath, base) => {
  let candidate = base;
  let index = 1;
  while (programPath.scope.hasBinding(candidate)) {
    candidate = `${base}${index++}`;
  }
  return candidate;
};

const ensureCommonButtonImport = (programPath, filePath) => {
  let commonImportDeclPath = null;
  let buttonLocalName = null;

  for (const stmtPath of programPath.get("body")) {
    if (!stmtPath.isImportDeclaration()) continue;
    const sourceValue = stmtPath.node.source.value;
    if (!isCommonBarrelImport(sourceValue)) continue;

    commonImportDeclPath = stmtPath;
    for (const specifier of stmtPath.node.specifiers) {
      if (
        t.isImportSpecifier(specifier) &&
        t.isIdentifier(specifier.imported, { name: "Button" })
      ) {
        buttonLocalName = specifier.local.name;
        break;
      }
    }
  }

  if (buttonLocalName) return buttonLocalName;

  const localName = programPath.scope.hasBinding("Button")
    ? getUniqueLocalName(programPath, "CommonButton")
    : "Button";

  const specifier = t.importSpecifier(
    t.identifier(localName),
    t.identifier("Button"),
  );

  if (commonImportDeclPath) {
    commonImportDeclPath.node.specifiers.push(specifier);
    return localName;
  }

  const importDecl = t.importDeclaration(
    [specifier],
    t.stringLiteral(getRelativeCommonImport(filePath)),
  );

  const body = programPath.node.body;
  let insertIndex = 0;
  while (insertIndex < body.length && t.isImportDeclaration(body[insertIndex])) {
    insertIndex++;
  }
  body.splice(insertIndex, 0, importDecl);

  return localName;
};

const hasUnstyledAttr = (openingElement) =>
  openingElement.attributes.some(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: "unstyled" }),
  );

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

const allFiles = walk(srcRoot);

let filesChanged = 0;
let buttonsConverted = 0;

for (const filePath of allFiles) {
  if (path.normalize(filePath) === commonButtonFile) continue;

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
      const nativeButtonElements = [];

      programPath.traverse({
        JSXElement(jsxPath) {
          const opening = jsxPath.node.openingElement;
          if (t.isJSXIdentifier(opening.name, { name: "button" })) {
            nativeButtonElements.push(jsxPath);
          }
        },
      });

      if (nativeButtonElements.length === 0) return;

      const buttonLocalName = ensureCommonButtonImport(programPath, filePath);

      for (const jsxPath of nativeButtonElements) {
        const opening = jsxPath.node.openingElement;
        opening.name = t.jsxIdentifier(buttonLocalName);

        if (
          jsxPath.node.closingElement &&
          t.isJSXIdentifier(jsxPath.node.closingElement.name, { name: "button" })
        ) {
          jsxPath.node.closingElement.name = t.jsxIdentifier(buttonLocalName);
        }

        if (!hasUnstyledAttr(opening)) {
          opening.attributes.push(t.jsxAttribute(t.jsxIdentifier("unstyled")));
        }
      }

      changed = true;
      buttonsConverted += nativeButtonElements.length;
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
      buttonsConverted,
    },
    null,
    2,
  ),
);

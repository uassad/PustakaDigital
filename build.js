const fs = require("fs-extra");
const path = require("node:path");
const { glob } = require("glob");
const { execFileSync, spawnSync } = require("node:child_process");
const postcss = require("postcss");
const postcssObfuscator = require("postcss-obfuscator");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { minify } = require("html-minifier-terser");

const rootDir = __dirname;
const tempDir = path.join(rootDir, "temp_build");
const outDir = path.join(rootDir, "1. dist_prod");

function resolvePython() {
  if (process.env.PYTHON) {
    return process.env.PYTHON;
  }

  const venvPython =
    process.platform === "win32"
      ? path.join(rootDir, ".venv", "Scripts", "python.exe")
      : path.join(rootDir, ".venv", "bin", "python");

  const candidates = [venvPython, process.platform === "win32" ? "python" : "python3", "python"];
  for (const candidate of candidates) {
    if (path.isAbsolute(candidate) && !fs.existsSync(candidate)) {
      continue;
    }

    const result = spawnSync(candidate, ["--version"], {
      cwd: rootDir,
      encoding: "utf8",
    });
    if (!result.error && result.status === 0) {
      return candidate;
    }
  }

  throw new Error("Python was not found. Set PYTHON or install Python 3.");
}

function globPath(...parts) {
  return path.join(...parts).split(path.sep).join("/");
}

async function build() {
  for (const requiredPath of ["statics", "templates", "main.py"]) {
    if (!(await fs.pathExists(path.join(rootDir, requiredPath)))) {
      throw new Error(`Required build input not found: ${requiredPath}`);
    }
  }

  await fs.remove(tempDir);
  await fs.remove(outDir);
  await fs.ensureDir(tempDir);
  await fs.copy(path.join(rootDir, "statics"), path.join(tempDir, "statics"));
  await fs.copy(path.join(rootDir, "templates"), path.join(tempDir, "templates"));
  await fs.ensureDir(path.join(outDir, "statics"));
  await fs.ensureDir(path.join(outDir, "templates"));

  const imageDir = path.join(tempDir, "statics", "img");
  if (await fs.pathExists(imageDir)) {
    await fs.copy(imageDir, path.join(outDir, "statics", "img"));
  }

  console.log("1. Mengacak & menyinkronkan nama class CSS ke HTML & JS...");
  const cssFiles = await glob(globPath(tempDir, "statics", "css", "**", "*.css"), {
    windowsPathsNoEscape: process.platform === "win32",
  });

  await Promise.all(
    cssFiles.map(async (cssFile) => {
      const cssCode = await fs.readFile(cssFile, "utf8");
      const relativePath = path.relative(tempDir, cssFile);
      const outCssPath = path.join(outDir, relativePath);
      const result = await postcss([
        postcssObfuscator({
          enable: true,
          length: 6,
          classMethod: "random",
          ids: false,
          srcPath: tempDir,
          desPath: outDir,
          extensions: [".html", ".js"],
          jsonsPath: path.join(tempDir, "mapping.json"),
        }),
      ]).process(cssCode, { from: cssFile, to: outCssPath });

      await fs.outputFile(outCssPath, result.css);
    })
  );

  console.log("2. Meng-obfuscate semua file JavaScript...");
  const jsFiles = await glob(globPath(outDir, "statics", "js", "**", "*.js"), {
    windowsPathsNoEscape: process.platform === "win32",
  });

  await Promise.all(
    jsFiles.map(async (jsFile) => {
      const jsCode = await fs.readFile(jsFile, "utf8");
      const obfuscated = JavaScriptObfuscator.obfuscate(jsCode, {
        compact: true,
        controlFlowFlattening: true,
        stringArray: true,
        stringArrayEncoding: ["base64"],
      });
      await fs.writeFile(jsFile, obfuscated.getObfuscatedCode());
    })
  );

  console.log("3. Mengompresi file HTML di folder templates...");
  const htmlFiles = await glob(globPath(outDir, "templates", "**", "*.html"), {
    windowsPathsNoEscape: process.platform === "win32",
  });

  await Promise.all(
    htmlFiles.map(async (htmlFile) => {
      const htmlCode = await fs.readFile(htmlFile, "utf8");
      const minified = await minify(htmlCode, {
        collapseWhitespace: true,
        removeComments: true,
        ignoreCustomFragments: [
          /\{\{[^{}]*\}\}/,
          /\{%[\s\S]*?%\}/,
          /\{#[\s\S]*?#\}/,
        ],
      });
      await fs.writeFile(htmlFile, minified);
    })
  );

  console.log("4. Meng-obfuscate kode Python...");
  const pythonExe = resolvePython();
  const pythonTargets = ["main.py", "app", "books", "configuration"].filter((target) =>
    fs.existsSync(path.join(rootDir, target))
  );
  if (pythonTargets.length === 0) {
    throw new Error("No Python source files were found to obfuscate.");
  }

  execFileSync(
    pythonExe,
    ["-m", "pyarmor.cli", "gen", "-O", outDir, "-r", ...pythonTargets],
    { cwd: rootDir, stdio: "inherit" }
  );

  const otpComposeFile = path.join(rootDir, "docker-compose.otp.yml");
  if (await fs.pathExists(otpComposeFile)) {
    await fs.copy(otpComposeFile, path.join(outDir, "docker-compose.otp.yml"));
  }

  await fs.remove(tempDir);
  console.log(`Selesai! Seluruh aplikasi terproteksi ada di ${outDir}`);
}

build().catch((error) => {
  console.error("Build gagal:", error);
  process.exitCode = 1;
});

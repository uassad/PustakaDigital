const fs = require("fs-extra");
const path = require("node:path");
const { glob } = require("glob");
const { execSync } = require("node:child_process");
const postcss = require("postcss");
const postcssObfuscator = require("postcss-obfuscator");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { minify } = require("html-minifier-terser");

async function build() {
  const tempDir = "./temp_build";
  const outDir = "./1. dist_prod";

  // Pastikan folder asli statics dan templates tersedia di root
  if (!(await fs.pathExists("./statics")) || !(await fs.pathExists("./templates"))) {
    console.error("Error: Folder ./statics atau ./templates tidak ditemukan di folder utama.");
    return;
  }

  // 1. Siapkan folder sementara & salin statics + templates langsung dari root
  await fs.remove(tempDir);
  await fs.remove(outDir);
  await fs.ensureDir(tempDir);
  await fs.copy("./statics", `${tempDir}/statics`);
  await fs.copy("./templates", `${tempDir}/templates`);

  await fs.ensureDir(`${outDir}/statics`);
  await fs.ensureDir(`${outDir}/templates`);

  // Salin aset gambar/font ke folder output
  if (await fs.pathExists(`${tempDir}/statics/img`)) {
    await fs.copy(`${tempDir}/statics/img`, `${outDir}/statics/img`);
  }

  console.log("1. Mengacak & menyinkronkan nama class CSS ke HTML & JS...");
  const cssFiles = await glob(`${tempDir}/statics/css/**/*.css`, {
    windowsPathsNoEscape: true,
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
          jsonsPath: `${tempDir}/mapping.json`,
        }),
      ]).process(cssCode, { from: cssFile, to: outCssPath });

      await fs.outputFile(outCssPath, result.css);
    })
  );

  console.log("2. Meng-obfuscate semua file JavaScript...");
  const jsFiles = await glob(`${outDir}/statics/js/**/*.js`, {
    windowsPathsNoEscape: true,
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
  const htmlFiles = await glob(`${outDir}/templates/**/*.html`, {
    windowsPathsNoEscape: true,
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
  const pythonExe = fs.existsSync("./.venv/Scripts/python.exe")
    ? path.resolve("./.venv/Scripts/python.exe")
    : "python";

  try {
    // Obfuscate main.py dan semua folder Python sekaligus dalam satu perintah
    const pyTargets = ["main.py", "app", "books", "configuration"].filter((item) =>
      fs.existsSync(item)
    );

    if (pyTargets.length > 0) {
      execSync(`"${pythonExe}" -m pyarmor.cli gen -O "${outDir}" -r ${pyTargets.join(" ")}`, {
        stdio: "inherit",
      });
    } else {
      console.warn("Peringatan: Tidak ada file/folder Python yang ditemukan!");
    }
  } catch (err) {
    console.error("Gagal meng-obfuscate Python:", err.message);
  }

  // Salin file pendukung jika ada
  if (await fs.pathExists("./docker-compose.otp.yml")) {
    await fs.copy("./docker-compose.otp.yml", `${outDir}/docker-compose.otp.yml`);
  }

  // Bersihkan folder sementara
  await fs.remove(tempDir);
  console.log(`Selesai! Seluruh aplikasi terproteksi ada di folder ${outDir}`);
}

build().catch(console.error);
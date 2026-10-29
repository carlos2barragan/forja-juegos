// Ejecuta el C# del estudiante contra pruebas reales, con un mini UnityEngine simulado (motor/UnityEngine.cs).
// Compila con el csc del SDK de .NET instalado y ejecuta con `dotnet exec`: no hace falta Unity.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const { runEnglish } = require('./runner_ingles');

const TIMEOUT = 15000;
const MOTOR_SRC = path.join(__dirname, 'motor', 'UnityEngine.cs');
const CACHE = path.join(os.tmpdir(), 'forja-juegos-cache');

const run = (cmd, args, opts) => new Promise((resolve) => {
  execFile(cmd, args, { timeout: TIMEOUT, maxBuffer: 2_000_000, windowsHide: true, ...opts }, (err, stdout, stderr) => {
    resolve({ err, stdout: String(stdout || ''), stderr: String(stderr || ''), timedOut: !!err && err.killed });
  });
});

const tidy = (s) => s.trim().split(/\r?\n/).slice(0, 10).join('\n').slice(0, 900);

// El código del estudiante no necesita ver nuestras claves.
const childEnv = () => {
  const env = { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1' };
  delete env.ANTHROPIC_API_KEY;
  return env;
};

const vnum = (v) => v.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
const vcmp = (a, b) => { const x = vnum(a), y = vnum(b); for (let i = 0; i < 4; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; };
const newest = (dir, filter = () => true) => {
  try { return fs.readdirSync(dir).filter((d) => /^\d+\.\d+/.test(d) && filter(d)).sort(vcmp).pop() || null; } catch { return null; }
};

// Busca dotnet, el compilador csc.dll y los ensamblados de referencia. Se calcula una vez.
let toolchain;
const findToolchain = () => (toolchain ||= detectToolchain());
async function detectToolchain() {
  const r = await run('dotnet', ['--list-sdks']);
  if (r.err) return null;
  const sdks = r.stdout.split(/\r?\n/).map((l) => l.match(/^(\S+)\s+\[(.+)\]$/)).filter(Boolean)
    .map((m) => ({ ver: m[1], dir: path.join(m[2], m[1]) }))
    .filter((s) => fs.existsSync(path.join(s.dir, 'Roslyn', 'bincore', 'csc.dll')))
    .sort((a, b) => vcmp(a.ver, b.ver));
  const sdk = sdks.pop();
  if (!sdk) return null;
  const root = path.dirname(path.dirname(sdk.dir));
  const runtimes = path.join(root, 'shared', 'Microsoft.NETCore.App');
  const majors = new Set((fs.existsSync(runtimes) ? fs.readdirSync(runtimes) : []).map((v) => vnum(v)[0]));
  const packs = path.join(root, 'packs', 'Microsoft.NETCore.App.Ref');
  const pack = newest(packs, (v) => majors.has(vnum(v)[0]));
  if (!pack) return null;
  const refRoot = path.join(packs, pack, 'ref');
  const tfm = fs.readdirSync(refRoot).find((d) => /^net\d/.test(d));
  const refDir = path.join(refRoot, tfm);
  return {
    csc: path.join(sdk.dir, 'Roslyn', 'bincore', 'csc.dll'),
    refs: fs.readdirSync(refDir).filter((f) => f.endsWith('.dll')).map((f) => path.join(refDir, f)),
    runtimeconfig: JSON.stringify({ runtimeOptions: { tfm, framework: { name: 'Microsoft.NETCore.App', version: `${vnum(pack)[0]}.0.0` }, rollForward: 'LatestMinor' } }),
  };
}

async function csc(tc, dir, args) {
  const rsp = path.join(dir, 'csc.rsp');
  const base = ['-nologo', '-utf8output', '-langversion:latest', '-nullable:disable', '-warn:0', '-deterministic', ...tc.refs.map((r) => `-r:"${r}"`)];
  fs.writeFileSync(rsp, [...base, ...args].join('\n'), 'utf8');
  return run('dotnet', [tc.csc, '@' + rsp], { cwd: dir, env: childEnv(), timeout: 60000 });
}

// El motor se compila una vez por versión de su código fuente y se reutiliza.
const motores = new Map();
function buildMotor(tc) {
  const src = fs.readFileSync(MOTOR_SRC, 'utf8');
  const hash = crypto.createHash('sha1').update(src).update(tc.csc).digest('hex').slice(0, 12);
  if (!motores.has(hash)) motores.set(hash, compileMotor(tc, hash).then((r) => { if (r.error) motores.delete(hash); return r; }));
  return motores.get(hash);
}
async function compileMotor(tc, hash) {
  const dir = path.join(CACHE, hash);
  const dll = path.join(dir, 'UnityEngine.dll');
  if (fs.existsSync(dll)) return { dll };
  fs.mkdirSync(dir, { recursive: true });
  // El nombre del archivo es el del ensamblado: se compila aparte y luego se mueve.
  const tmpDir = path.join(dir, `tmp-${process.pid}-${Date.now()}`);
  fs.mkdirSync(tmpDir);
  const r = await csc(tc, tmpDir, ['-target:library', '-out:UnityEngine.dll', `"${MOTOR_SRC}"`]);
  if (r.err) return { error: 'No compila el motor simulado:\n' + tidy(r.stdout + r.stderr) };
  try { fs.renameSync(path.join(tmpDir, 'UnityEngine.dll'), dll); } catch { /* otro proceso lo compiló a la vez */ }
  fs.rm(tmpDir, { recursive: true, force: true }, () => {});
  return { dll };
}

const HARNESS = (marca, cuerpo, extra) => `
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Simulacion;
using Object = UnityEngine.Object;
using Random = UnityEngine.Random;
using Debug = UnityEngine.Debug;

${extra || ''}

public static class __Pruebas
{
    static void Check(string nombre, Func<bool> f)
    {
        bool ok = false; string n = nombre;
        try { ok = f(); }
        catch (Exception e) { n = nombre + " (" + e.GetType().Name + ": " + Corta(e.Message) + ")"; }
        Console.WriteLine("${marca}|" + n.Replace("|", "/").Replace("\\n", " ") + "|" + (ok ? "1" : "0"));
    }
    static string Corta(string s) => s.Length > 80 ? s.Substring(0, 80) + "…" : s;
    static bool Lanza<T>(Action a) where T : Exception { try { a(); } catch (T) { return true; } catch { return false; } return false; }
    static bool Cerca(float a, float b, float eps = 1e-3f) => Math.Abs(a - b) <= eps;
    static bool Cerca(Vector3 a, Vector3 b, float eps = 1e-3f) => (a - b).magnitude <= eps;
    static bool Cerca(Vector2 a, Vector2 b, float eps = 1e-3f) => (a - b).magnitude <= eps;

    public static void Main()
    {
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        try
        {
${cuerpo}
        }
        catch (Exception e) { Console.WriteLine("${marca}|Las pruebas se interrumpieron (" + e.GetType().Name + ": " + Corta(e.Message) + ")|0"); }
    }
}
`;

const hasTests = (c) => Boolean(c && (c.test || c.pruebasIngles));

async function runTests(c, code) {
  if (!hasTests(c)) return null;
  if (c.pruebasIngles) return runEnglish(code, c.pruebasIngles);
  const tc = await findToolchain();
  if (!tc) return { unavailable: 'No encuentro el SDK de .NET (7 o superior). Instálalo desde dot.net y reinicia el servidor.' };
  const motor = await buildMotor(tc);
  if (motor.error) return { error: motor.error };

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'forja-juegos-'));
  const marca = '@@T' + crypto.randomBytes(6).toString('hex');
  try {
    fs.writeFileSync(path.join(dir, 'Solucion.cs'), code, 'utf8');
    fs.writeFileSync(path.join(dir, 'Pruebas.cs'), HARNESS(marca, c.test, c.testExtra), 'utf8');
    fs.copyFileSync(motor.dll, path.join(dir, 'UnityEngine.dll'));
    fs.writeFileSync(path.join(dir, 'Pruebas.runtimeconfig.json'), tc.runtimeconfig);
    const comp = await csc(tc, dir, ['-target:exe', '-out:Pruebas.dll', '-main:__Pruebas', '-r:UnityEngine.dll', 'Solucion.cs', 'Pruebas.cs']);
    if (comp.err) {
      const out = (comp.stdout + comp.stderr).split(/\r?\n/).filter((l) => /error CS/.test(l))
        .map((l) => l.replace(dir + path.sep, '').replace(/^Pruebas\.cs.*?error/, 'Las pruebas no encuentran lo que piden (revisa nombres y firmas): error'));
      return { error: 'No compila:\n' + tidy(out.join('\n') || comp.stdout + comp.stderr) };
    }
    const r = await run('dotnet', ['exec', '--runtimeconfig', 'Pruebas.runtimeconfig.json', 'Pruebas.dll'], { cwd: dir, env: childEnv() });
    if (r.timedOut) return { error: 'Tu código tardó más de 15 segundos. ¿Hay un bucle infinito o una corrutina que nunca termina?' };
    const tests = r.stdout.split(/\r?\n/).filter((l) => l.startsWith(marca + '|')).map((l) => {
      const p = l.split('|');
      return { name: p.slice(1, -1).join('|'), ok: p[p.length - 1].trim() === '1' };
    });
    if (!tests.length) return { error: tidy(r.stderr || r.stdout) || 'Tu código no produjo resultados.' };
    return { tests };
  } catch (e) {
    return { error: 'No se pudo ejecutar: ' + e.message };
  } finally {
    fs.rm(dir, { recursive: true, force: true }, () => {});
  }
}

module.exports = { runTests, hasTests };

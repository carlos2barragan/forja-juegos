// Prueba de humo del motor simulado: ciclo de vida, corrutinas, Instantiate/Destroy y "null falso".
const { runTests } = require('../runner');

const code = `
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class Vida : MonoBehaviour {
    public static List<string> log = new();
    public int frames;
    public bool fin;
    void Awake() { log.Add("Awake"); }
    void OnEnable() { log.Add("OnEnable"); }
    void Start() { log.Add("Start"); StartCoroutine(Esperar()); }
    void Update() { frames++; }
    IEnumerator Esperar() { yield return new WaitForSeconds(1f); fin = true; }
    void OnDestroy() { log.Add("OnDestroy"); }
}`;
const test = `
var v = Motor.Crear<Vida>();
Check("Awake y OnEnable al crear", () => string.Join(",", Vida.log) == "Awake,OnEnable");
Motor.Fotograma();
Check("Start antes del primer Update", () => Vida.log[2] == "Start" && v.frames == 1);
Motor.Avanzar(0.5f);
Check("la corrutina aún espera", () => !v.fin);
Motor.Avanzar(0.6f);
Check("la corrutina terminó", () => v.fin);
var copia = Object.Instantiate(v);
Check("Instantiate copia campos", () => copia.frames == v.frames && copia != v);
Object.Destroy(v.gameObject);
Check("Destroy espera al final del fotograma", () => v != null);
Motor.Fotograma();
Check("null falso tras Destroy", () => v == null && Vida.log.Contains("OnDestroy"));
Check("Quaternion.Euler y eulerAngles", () => Cerca(Quaternion.Euler(10, 90, 0).eulerAngles, new Vector3(10, 90, 0)));
Check("rotar forward 90 en Y da right", () => Cerca(Quaternion.Euler(0, 90, 0) * Vector3.forward, Vector3.right));
var j = new Jugada { puntos = 3, nombre = "a" };
Check("JsonUtility ida y vuelta", () => JsonUtility.FromJson<Jugada>(JsonUtility.ToJson(j)).puntos == 3 && !JsonUtility.ToJson(j).Contains("oculto"));
`;
const extra = `[System.Serializable] public class Jugada { public int puntos; public string nombre; int oculto = 5; public int Prop { get; set; } }`;

(async () => {
  const t = Date.now();
  const r = await runTests({ test, testExtra: extra }, code);
  console.log(JSON.stringify(r, null, 1), Date.now() - t, 'ms');
  process.exit(r.tests && r.tests.every((x) => x.ok) ? 0 : 1);
})();

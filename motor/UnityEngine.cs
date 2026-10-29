// Mini UnityEngine: imita la API de Unity lo justo para ejecutar los retos fuera del editor.
// No es Unity: no hay escena, render ni física. Sí hay matemáticas, componentes, ciclo de vida,
// corrutinas, Input y Time, simulados por UnityEngine.Simulacion.Motor.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace UnityEngine
{
    // ── Atributos del inspector (solo para que compile el código de Unity) ──
    [AttributeUsage(AttributeTargets.Field)] public class SerializeField : Attribute { }
    [AttributeUsage(AttributeTargets.Field)] public class HideInInspector : Attribute { }
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = true)] public class HeaderAttribute : Attribute { public HeaderAttribute(string h) { } }
    [AttributeUsage(AttributeTargets.Field)] public class TooltipAttribute : Attribute { public TooltipAttribute(string t) { } }
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = true)] public class SpaceAttribute : Attribute { public SpaceAttribute(float h = 8) { } }
    [AttributeUsage(AttributeTargets.Field)] public class TextAreaAttribute : Attribute { public TextAreaAttribute(int a = 3, int b = 3) { } }
    [AttributeUsage(AttributeTargets.Field)] public class RangeAttribute : Attribute { public float min, max; public RangeAttribute(float min, float max) { this.min = min; this.max = max; } }
    [AttributeUsage(AttributeTargets.Field)] public class MinAttribute : Attribute { public MinAttribute(float m) { } }
    [AttributeUsage(AttributeTargets.Class)] public class CreateAssetMenuAttribute : Attribute { public string fileName, menuName; public int order; }
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)] public class RequireComponent : Attribute { public RequireComponent(Type t) { } }
    [AttributeUsage(AttributeTargets.Class)] public class DisallowMultipleComponent : Attribute { }
    [AttributeUsage(AttributeTargets.Method)] public class ContextMenu : Attribute { public ContextMenu(string n) { } }

    // ── Vectores ──
    public struct Vector2 : IEquatable<Vector2>
    {
        public float x, y;
        public Vector2(float x, float y) { this.x = x; this.y = y; }
        public static Vector2 zero => new(0, 0);
        public static Vector2 one => new(1, 1);
        public static Vector2 up => new(0, 1);
        public static Vector2 down => new(0, -1);
        public static Vector2 left => new(-1, 0);
        public static Vector2 right => new(1, 0);
        public float sqrMagnitude => x * x + y * y;
        public float magnitude => MathF.Sqrt(sqrMagnitude);
        public Vector2 normalized { get { float m = magnitude; return m > 1e-5f ? this / m : zero; } }
        public void Normalize() { this = normalized; }
        public static float Dot(Vector2 a, Vector2 b) => a.x * b.x + a.y * b.y;
        public static float Distance(Vector2 a, Vector2 b) => (a - b).magnitude;
        public static Vector2 Lerp(Vector2 a, Vector2 b, float t) => LerpUnclamped(a, b, Mathf.Clamp01(t));
        public static Vector2 LerpUnclamped(Vector2 a, Vector2 b, float t) => a + (b - a) * t;
        public static Vector2 MoveTowards(Vector2 a, Vector2 b, float d) { var v = b - a; float m = v.magnitude; return m <= d || m == 0 ? b : a + v / m * d; }
        public static Vector2 ClampMagnitude(Vector2 v, float max) => v.sqrMagnitude > max * max ? v.normalized * max : v;
        public static float Angle(Vector2 a, Vector2 b) { float d = MathF.Sqrt(a.sqrMagnitude * b.sqrMagnitude); return d < 1e-15f ? 0 : MathF.Acos(Mathf.Clamp(Dot(a, b) / d, -1, 1)) * Mathf.Rad2Deg; }
        public static float SignedAngle(Vector2 a, Vector2 b) => Angle(a, b) * MathF.Sign(a.x * b.y - a.y * b.x);
        public static Vector2 Reflect(Vector2 v, Vector2 n) => v - 2 * Dot(v, n) * n;
        public static Vector2 Perpendicular(Vector2 v) => new(-v.y, v.x);
        public static Vector2 Max(Vector2 a, Vector2 b) => new(MathF.Max(a.x, b.x), MathF.Max(a.y, b.y));
        public static Vector2 Min(Vector2 a, Vector2 b) => new(MathF.Min(a.x, b.x), MathF.Min(a.y, b.y));
        public static Vector2 operator +(Vector2 a, Vector2 b) => new(a.x + b.x, a.y + b.y);
        public static Vector2 operator -(Vector2 a, Vector2 b) => new(a.x - b.x, a.y - b.y);
        public static Vector2 operator -(Vector2 a) => new(-a.x, -a.y);
        public static Vector2 operator *(Vector2 a, float d) => new(a.x * d, a.y * d);
        public static Vector2 operator *(float d, Vector2 a) => new(a.x * d, a.y * d);
        public static Vector2 operator *(Vector2 a, Vector2 b) => new(a.x * b.x, a.y * b.y);
        public static Vector2 operator /(Vector2 a, float d) => new(a.x / d, a.y / d);
        public static bool operator ==(Vector2 a, Vector2 b) => (a - b).sqrMagnitude < 1e-10f;
        public static bool operator !=(Vector2 a, Vector2 b) => !(a == b);
        public static implicit operator Vector3(Vector2 v) => new(v.x, v.y, 0);
        public static implicit operator Vector2(Vector3 v) => new(v.x, v.y);
        public bool Equals(Vector2 o) => x == o.x && y == o.y;
        public override bool Equals(object o) => o is Vector2 v && Equals(v);
        public override int GetHashCode() => HashCode.Combine(x, y);
        public override string ToString() => $"({x:0.00}, {y:0.00})";
    }

    public struct Vector3 : IEquatable<Vector3>
    {
        public float x, y, z;
        public Vector3(float x, float y, float z) { this.x = x; this.y = y; this.z = z; }
        public Vector3(float x, float y) { this.x = x; this.y = y; z = 0; }
        public static Vector3 zero => new(0, 0, 0);
        public static Vector3 one => new(1, 1, 1);
        public static Vector3 up => new(0, 1, 0);
        public static Vector3 down => new(0, -1, 0);
        public static Vector3 left => new(-1, 0, 0);
        public static Vector3 right => new(1, 0, 0);
        public static Vector3 forward => new(0, 0, 1);
        public static Vector3 back => new(0, 0, -1);
        public float sqrMagnitude => x * x + y * y + z * z;
        public float magnitude => MathF.Sqrt(sqrMagnitude);
        public Vector3 normalized { get { float m = magnitude; return m > 1e-5f ? this / m : zero; } }
        public void Normalize() { this = normalized; }
        public static Vector3 Normalize(Vector3 v) => v.normalized;
        public static float Dot(Vector3 a, Vector3 b) => a.x * b.x + a.y * b.y + a.z * b.z;
        public static Vector3 Cross(Vector3 a, Vector3 b) => new(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
        public static float Distance(Vector3 a, Vector3 b) => (a - b).magnitude;
        public static Vector3 Lerp(Vector3 a, Vector3 b, float t) => LerpUnclamped(a, b, Mathf.Clamp01(t));
        public static Vector3 LerpUnclamped(Vector3 a, Vector3 b, float t) => a + (b - a) * t;
        public static Vector3 MoveTowards(Vector3 a, Vector3 b, float d) { var v = b - a; float m = v.magnitude; return m <= d || m == 0 ? b : a + v / m * d; }
        public static Vector3 ClampMagnitude(Vector3 v, float max) => v.sqrMagnitude > max * max ? v.normalized * max : v;
        public static float Angle(Vector3 a, Vector3 b) { float d = MathF.Sqrt(a.sqrMagnitude * b.sqrMagnitude); return d < 1e-15f ? 0 : MathF.Acos(Mathf.Clamp(Dot(a, b) / d, -1, 1)) * Mathf.Rad2Deg; }
        public static float SignedAngle(Vector3 a, Vector3 b, Vector3 axis) => Angle(a, b) * MathF.Sign(Dot(axis, Cross(a, b)));
        public static Vector3 Reflect(Vector3 v, Vector3 n) => v - 2 * Dot(v, n) * n;
        public static Vector3 Project(Vector3 v, Vector3 n) { float s = Dot(n, n); return s < 1e-15f ? zero : n * (Dot(v, n) / s); }
        public static Vector3 ProjectOnPlane(Vector3 v, Vector3 n) => v - Project(v, n);
        public static Vector3 Scale(Vector3 a, Vector3 b) => new(a.x * b.x, a.y * b.y, a.z * b.z);
        public static Vector3 Max(Vector3 a, Vector3 b) => new(MathF.Max(a.x, b.x), MathF.Max(a.y, b.y), MathF.Max(a.z, b.z));
        public static Vector3 Min(Vector3 a, Vector3 b) => new(MathF.Min(a.x, b.x), MathF.Min(a.y, b.y), MathF.Min(a.z, b.z));
        public static Vector3 SmoothDamp(Vector3 cur, Vector3 target, ref Vector3 vel, float smoothTime, float maxSpeed = float.PositiveInfinity, float dt = -1)
        {
            if (dt < 0) dt = Time.deltaTime;
            float vx = vel.x, vy = vel.y, vz = vel.z;
            var r = new Vector3(Mathf.SmoothDamp(cur.x, target.x, ref vx, smoothTime, maxSpeed, dt), Mathf.SmoothDamp(cur.y, target.y, ref vy, smoothTime, maxSpeed, dt), Mathf.SmoothDamp(cur.z, target.z, ref vz, smoothTime, maxSpeed, dt));
            vel = new Vector3(vx, vy, vz);
            return r;
        }
        public static Vector3 operator +(Vector3 a, Vector3 b) => new(a.x + b.x, a.y + b.y, a.z + b.z);
        public static Vector3 operator -(Vector3 a, Vector3 b) => new(a.x - b.x, a.y - b.y, a.z - b.z);
        public static Vector3 operator -(Vector3 a) => new(-a.x, -a.y, -a.z);
        public static Vector3 operator *(Vector3 a, float d) => new(a.x * d, a.y * d, a.z * d);
        public static Vector3 operator *(float d, Vector3 a) => new(a.x * d, a.y * d, a.z * d);
        public static Vector3 operator /(Vector3 a, float d) => new(a.x / d, a.y / d, a.z / d);
        public static bool operator ==(Vector3 a, Vector3 b) => (a - b).sqrMagnitude < 1e-10f;
        public static bool operator !=(Vector3 a, Vector3 b) => !(a == b);
        public bool Equals(Vector3 o) => x == o.x && y == o.y && z == o.z;
        public override bool Equals(object o) => o is Vector3 v && Equals(v);
        public override int GetHashCode() => HashCode.Combine(x, y, z);
        public override string ToString() => $"({x:0.00}, {y:0.00}, {z:0.00})";
    }

    public struct Vector2Int : IEquatable<Vector2Int>
    {
        public int x, y;
        public Vector2Int(int x, int y) { this.x = x; this.y = y; }
        public static Vector2Int zero => new(0, 0);
        public static Vector2Int up => new(0, 1);
        public static Vector2Int down => new(0, -1);
        public static Vector2Int left => new(-1, 0);
        public static Vector2Int right => new(1, 0);
        public static Vector2Int operator +(Vector2Int a, Vector2Int b) => new(a.x + b.x, a.y + b.y);
        public static Vector2Int operator -(Vector2Int a, Vector2Int b) => new(a.x - b.x, a.y - b.y);
        public static bool operator ==(Vector2Int a, Vector2Int b) => a.x == b.x && a.y == b.y;
        public static bool operator !=(Vector2Int a, Vector2Int b) => !(a == b);
        public bool Equals(Vector2Int o) => this == o;
        public override bool Equals(object o) => o is Vector2Int v && this == v;
        public override int GetHashCode() => HashCode.Combine(x, y);
        public override string ToString() => $"({x}, {y})";
    }

    // ── Mathf ──
    public static class Mathf
    {
        public const float PI = MathF.PI;
        public const float Infinity = float.PositiveInfinity;
        public const float NegativeInfinity = float.NegativeInfinity;
        public const float Deg2Rad = MathF.PI / 180f;
        public const float Rad2Deg = 180f / MathF.PI;
        public static readonly float Epsilon = float.Epsilon;
        public static float Sin(float f) => MathF.Sin(f);
        public static float Cos(float f) => MathF.Cos(f);
        public static float Tan(float f) => MathF.Tan(f);
        public static float Asin(float f) => MathF.Asin(f);
        public static float Acos(float f) => MathF.Acos(f);
        public static float Atan(float f) => MathF.Atan(f);
        public static float Atan2(float y, float x) => MathF.Atan2(y, x);
        public static float Sqrt(float f) => MathF.Sqrt(f);
        public static float Abs(float f) => MathF.Abs(f);
        public static int Abs(int v) => Math.Abs(v);
        public static float Min(float a, float b) => a < b ? a : b;
        public static float Min(params float[] v) => v.Min();
        public static int Min(int a, int b) => a < b ? a : b;
        public static float Max(float a, float b) => a > b ? a : b;
        public static float Max(params float[] v) => v.Max();
        public static int Max(int a, int b) => a > b ? a : b;
        public static float Pow(float f, float p) => MathF.Pow(f, p);
        public static float Exp(float p) => MathF.Exp(p);
        public static float Log(float f) => MathF.Log(f);
        public static float Log(float f, float b) => MathF.Log(f, b);
        public static float Log10(float f) => MathF.Log10(f);
        public static float Ceil(float f) => MathF.Ceiling(f);
        public static float Floor(float f) => MathF.Floor(f);
        public static float Round(float f) => MathF.Round(f, MidpointRounding.ToEven);
        public static int CeilToInt(float f) => (int)MathF.Ceiling(f);
        public static int FloorToInt(float f) => (int)MathF.Floor(f);
        public static int RoundToInt(float f) => (int)MathF.Round(f, MidpointRounding.ToEven);
        public static float Sign(float f) => f >= 0 ? 1 : -1;
        public static float Clamp(float v, float min, float max) => v < min ? min : v > max ? max : v;
        public static int Clamp(int v, int min, int max) => v < min ? min : v > max ? max : v;
        public static float Clamp01(float v) => Clamp(v, 0, 1);
        public static float Lerp(float a, float b, float t) => a + (b - a) * Clamp01(t);
        public static float LerpUnclamped(float a, float b, float t) => a + (b - a) * t;
        public static float InverseLerp(float a, float b, float v) => a != b ? Clamp01((v - a) / (b - a)) : 0;
        public static float Repeat(float t, float len) => Clamp(t - Floor(t / len) * len, 0, len);
        public static float PingPong(float t, float len) { t = Repeat(t, len * 2); return len - Abs(t - len); }
        public static float DeltaAngle(float a, float b) { float d = Repeat(b - a, 360); if (d > 180) d -= 360; return d; }
        public static float LerpAngle(float a, float b, float t) => a + DeltaAngle(a, b) * Clamp01(t);
        public static float MoveTowards(float c, float t, float d) => Abs(t - c) <= d ? t : c + Sign(t - c) * d;
        public static float MoveTowardsAngle(float c, float t, float d) { float dl = DeltaAngle(c, t); return -d < dl && dl < d ? t : MoveTowards(c, c + dl, d); }
        public static float SmoothStep(float a, float b, float t) { t = Clamp01(t); t = -2f * t * t * t + 3f * t * t; return b * t + a * (1f - t); }
        public static bool Approximately(float a, float b) => Abs(b - a) < Max(1e-6f * Max(Abs(a), Abs(b)), Epsilon * 8);
        public static float SmoothDamp(float cur, float target, ref float vel, float smoothTime, float maxSpeed = Infinity, float dt = -1)
        {
            if (dt < 0) dt = Time.deltaTime;
            smoothTime = Max(0.0001f, smoothTime);
            float omega = 2f / smoothTime, x = omega * dt, exp = 1f / (1f + x + 0.48f * x * x + 0.235f * x * x * x);
            float change = cur - target, orig = target, maxChange = maxSpeed * smoothTime;
            change = Clamp(change, -maxChange, maxChange);
            target = cur - change;
            float temp = (vel + omega * change) * dt;
            vel = (vel - omega * temp) * exp;
            float output = target + (change + temp) * exp;
            if (orig - cur > 0f == output > orig) { output = orig; vel = (output - orig) / dt; }
            return output;
        }
        // Ruido Perlin 2D clásico, en [0, 1] aproximadamente.
        static readonly int[] P = Enumerable.Range(0, 256).OrderBy(i => (i * 1103515245 + 12345) & 0x7fffffff).Concat(Enumerable.Range(0, 256).OrderBy(i => (i * 1103515245 + 12345) & 0x7fffffff)).ToArray();
        static float Fade(float t) => t * t * t * (t * (t * 6 - 15) + 10);
        static float Grad(int h, float x, float y) => ((h & 1) == 0 ? x : -x) + ((h & 2) == 0 ? y : -y);
        public static float PerlinNoise(float x, float y)
        {
            int xi = FloorToInt(x) & 255, yi = FloorToInt(y) & 255;
            float xf = x - Floor(x), yf = y - Floor(y), u = Fade(xf), v = Fade(yf);
            int aa = P[P[xi] + yi], ab = P[P[xi] + yi + 1], ba = P[P[xi + 1] + yi], bb = P[P[xi + 1] + yi + 1];
            float r = LerpUnclamped(LerpUnclamped(Grad(aa, xf, yf), Grad(ba, xf - 1, yf), u), LerpUnclamped(Grad(ab, xf, yf - 1), Grad(bb, xf - 1, yf - 1), u), v);
            return Clamp01((r + 1) / 2);
        }
    }

    // ── Rotaciones ──
    public struct Quaternion
    {
        public float x, y, z, w;
        public Quaternion(float x, float y, float z, float w) { this.x = x; this.y = y; this.z = z; this.w = w; }
        public static Quaternion identity => new(0, 0, 0, 1);
        public static Quaternion AngleAxis(float deg, Vector3 axis)
        {
            axis = axis.normalized; float h = deg * Mathf.Deg2Rad * 0.5f, s = MathF.Sin(h);
            return new(axis.x * s, axis.y * s, axis.z * s, MathF.Cos(h));
        }
        // Mismo orden que Unity: Z, luego X, luego Y.
        public static Quaternion Euler(float x, float y, float z) => AngleAxis(y, Vector3.up) * AngleAxis(x, Vector3.right) * AngleAxis(z, Vector3.forward);
        public static Quaternion Euler(Vector3 e) => Euler(e.x, e.y, e.z);
        public static Quaternion Inverse(Quaternion q) => new(-q.x, -q.y, -q.z, q.w);
        public static float Dot(Quaternion a, Quaternion b) => a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        public static float Angle(Quaternion a, Quaternion b) { float d = MathF.Min(MathF.Abs(Dot(a, b)), 1f); return d > 1f - 1e-6f ? 0 : MathF.Acos(d) * 2f * Mathf.Rad2Deg; }
        public static Quaternion LookRotation(Vector3 forward) => LookRotation(forward, Vector3.up);
        public static Quaternion LookRotation(Vector3 forward, Vector3 up)
        {
            var f = forward.normalized; if (f.sqrMagnitude < 1e-10f) return identity;
            var r = Vector3.Cross(up, f).normalized; if (r.sqrMagnitude < 1e-10f) r = Vector3.right;
            var u = Vector3.Cross(f, r);
            float m00 = r.x, m01 = u.x, m02 = f.x, m10 = r.y, m11 = u.y, m12 = f.y, m20 = r.z, m21 = u.z, m22 = f.z, tr = m00 + m11 + m22;
            Quaternion q;
            if (tr > 0) { float s = MathF.Sqrt(tr + 1) * 2; q = new((m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25f * s); }
            else if (m00 > m11 && m00 > m22) { float s = MathF.Sqrt(1 + m00 - m11 - m22) * 2; q = new(0.25f * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s); }
            else if (m11 > m22) { float s = MathF.Sqrt(1 + m11 - m00 - m22) * 2; q = new((m01 + m10) / s, 0.25f * s, (m12 + m21) / s, (m02 - m20) / s); }
            else { float s = MathF.Sqrt(1 + m22 - m00 - m11) * 2; q = new((m02 + m20) / s, (m12 + m21) / s, 0.25f * s, (m10 - m01) / s); }
            return q.Normalizado();
        }
        public static Quaternion Slerp(Quaternion a, Quaternion b, float t)
        {
            t = Mathf.Clamp01(t); float d = Dot(a, b);
            if (d < 0) { b = new(-b.x, -b.y, -b.z, -b.w); d = -d; }
            if (d > 0.9995f) return new Quaternion(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t, a.w + (b.w - a.w) * t).Normalizado();
            float th = MathF.Acos(d), s = MathF.Sin(th), wa = MathF.Sin((1 - t) * th) / s, wb = MathF.Sin(t * th) / s;
            return new(a.x * wa + b.x * wb, a.y * wa + b.y * wb, a.z * wa + b.z * wb, a.w * wa + b.w * wb);
        }
        public static Quaternion RotateTowards(Quaternion a, Quaternion b, float maxDeg) { float ang = Angle(a, b); return ang == 0 ? b : Slerp(a, b, MathF.Min(1, maxDeg / ang)); }
        Quaternion Normalizado() { float m = MathF.Sqrt(x * x + y * y + z * z + w * w); return new(x / m, y / m, z / m, w / m); }
        public Vector3 eulerAngles
        {
            get
            {
                // Inversa de Euler(Z, X, Y).
                float sx = 2 * (w * x - y * z);
                float ex = MathF.Abs(sx) >= 1 ? MathF.CopySign(MathF.PI / 2, sx) : MathF.Asin(sx);
                float ey = MathF.Atan2(2 * (w * y + x * z), 1 - 2 * (x * x + y * y));
                float ez = MathF.Atan2(2 * (w * z + x * y), 1 - 2 * (x * x + z * z));
                static float N(float r) { float d = r * Mathf.Rad2Deg; d %= 360; return d < 0 ? d + 360 : d; }
                return new Vector3(N(ex), N(ey), N(ez));
            }
        }
        public static Quaternion operator *(Quaternion a, Quaternion b) => new(
            a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            a.w * b.y + a.y * b.w + a.z * b.x - a.x * b.z,
            a.w * b.z + a.z * b.w + a.x * b.y - a.y * b.x,
            a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z);
        public static Vector3 operator *(Quaternion q, Vector3 v)
        {
            var u = new Vector3(q.x, q.y, q.z);
            var t = 2f * Vector3.Cross(u, v);
            return v + q.w * t + Vector3.Cross(u, t);
        }
        public override string ToString() => $"({x:0.000}, {y:0.000}, {z:0.000}, {w:0.000})";
    }

    public struct Color
    {
        public float r, g, b, a;
        public Color(float r, float g, float b, float a = 1) { this.r = r; this.g = g; this.b = b; this.a = a; }
        public static Color white => new(1, 1, 1);
        public static Color black => new(0, 0, 0);
        public static Color red => new(1, 0, 0);
        public static Color green => new(0, 1, 0);
        public static Color blue => new(0, 0, 1);
        public static Color yellow => new(1, 0.92f, 0.016f);
        public static Color gray => new(0.5f, 0.5f, 0.5f);
        public static Color clear => new(0, 0, 0, 0);
        public static Color Lerp(Color x, Color y, float t) { t = Mathf.Clamp01(t); return new(x.r + (y.r - x.r) * t, x.g + (y.g - x.g) * t, x.b + (y.b - x.b) * t, x.a + (y.a - x.a) * t); }
        public static Color operator +(Color x, Color y) => new(x.r + y.r, x.g + y.g, x.b + y.b, x.a + y.a);
        public static Color operator -(Color x, Color y) => new(x.r - y.r, x.g - y.g, x.b - y.b, x.a - y.a);
        public static Color operator *(Color x, Color y) => new(x.r * y.r, x.g * y.g, x.b * y.b, x.a * y.a);
        public static Color operator *(Color x, float d) => new(x.r * d, x.g * d, x.b * d, x.a * d);
        public static Color operator *(float d, Color x) => x * d;
        public override string ToString() => $"RGBA({r:0.000}, {g:0.000}, {b:0.000}, {a:0.000})";
    }

    public struct Ray
    {
        public Vector3 origin, direction;
        public Ray(Vector3 origin, Vector3 direction) { this.origin = origin; this.direction = direction.normalized; }
        public Vector3 GetPoint(float d) => origin + direction * d;
    }

    // ── Tiempo, azar, registro ──
    public static class Time
    {
        public static float deltaTime { get; internal set; } = 1f / 60f;
        public static float unscaledDeltaTime { get; internal set; } = 1f / 60f;
        public static float time { get; internal set; }
        public static float unscaledTime { get; internal set; }
        public static float fixedDeltaTime { get; set; } = 0.02f;
        public static float timeScale { get; set; } = 1f;
        public static int frameCount { get; internal set; }
    }

    public static class Random
    {
        static System.Random rng = new(12345);
        public static void InitState(int seed) => rng = new System.Random(seed);
        public static float value => (float)rng.NextDouble();
        public static float Range(float min, float max) => min + (max - min) * value;
        public static int Range(int min, int max) => max <= min ? min : rng.Next(min, max);
        public static Vector2 insideUnitCircle { get { float a = value * MathF.PI * 2, r = MathF.Sqrt(value); return new(MathF.Cos(a) * r, MathF.Sin(a) * r); } }
        public static Vector3 onUnitSphere { get { float z = Range(-1f, 1f), a = value * MathF.PI * 2, r = MathF.Sqrt(1 - z * z); return new(r * MathF.Cos(a), r * MathF.Sin(a), z); } }
    }

    public static class Debug
    {
        public static readonly List<string> Registro = new();
        public static void Log(object m) { Registro.Add(m?.ToString()); }
        public static void LogWarning(object m) { Registro.Add("[aviso] " + m); }
        public static void LogError(object m) { Registro.Add("[error] " + m); }
        public static void DrawLine(Vector3 a, Vector3 b) { }
        public static void DrawLine(Vector3 a, Vector3 b, Color c, float d = 0) { }
        public static void DrawRay(Vector3 a, Vector3 d) { }
        public static void DrawRay(Vector3 a, Vector3 d, Color c, float t = 0) { }
        public static void Assert(bool c, string m = null) { if (!c) throw new Exception("Assert: " + m); }
    }

    public static class Application
    {
        public static int targetFrameRate { get; set; } = -1;
        public static bool isPlaying => true;
        public static string persistentDataPath { get; } = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "forja-juegos-datos");
    }

    public static class PlayerPrefs
    {
        static readonly Dictionary<string, object> d = new();
        public static void SetInt(string k, int v) => d[k] = v;
        public static void SetFloat(string k, float v) => d[k] = v;
        public static void SetString(string k, string v) => d[k] = v;
        public static int GetInt(string k, int def = 0) => d.TryGetValue(k, out var v) && v is int i ? i : def;
        public static float GetFloat(string k, float def = 0) => d.TryGetValue(k, out var v) && v is float f ? f : def;
        public static string GetString(string k, string def = "") => d.TryGetValue(k, out var v) && v is string s ? s : def;
        public static bool HasKey(string k) => d.ContainsKey(k);
        public static void DeleteKey(string k) => d.Remove(k);
        public static void DeleteAll() => d.Clear();
        public static void Save() { }
    }

    // Como en Unity: solo campos públicos o [SerializeField] de clases [Serializable].
    public static class JsonUtility
    {
        static readonly JsonSerializerOptions Opt = new() { IncludeFields = true, WriteIndented = false, TypeInfoResolver = new System.Text.Json.Serialization.Metadata.DefaultJsonTypeInfoResolver { Modifiers = { SoloSerializable } } };
        static readonly JsonSerializerOptions OptBonito = new(Opt) { WriteIndented = true };
        static void SoloSerializable(System.Text.Json.Serialization.Metadata.JsonTypeInfo ti)
        {
            if (ti.Kind != System.Text.Json.Serialization.Metadata.JsonTypeInfoKind.Object) return;
            foreach (var p in ti.Properties.ToList())
            {
                var mi = p.AttributeProvider as MemberInfo;
                bool ok = mi is FieldInfo f && ((f.IsPublic && !f.IsDefined(typeof(NonSerializedAttribute))) || f.IsDefined(typeof(SerializeField)));
                if (!ok) ti.Properties.Remove(p);
            }
        }
        public static string ToJson(object o, bool pretty = false) => o == null ? "" : JsonSerializer.Serialize(o, o.GetType(), pretty ? OptBonito : Opt);
        public static T FromJson<T>(string json) => JsonSerializer.Deserialize<T>(json, Opt);
    }

    public enum KeyCode
    {
        None, Space, Return, Escape, Tab, LeftShift, LeftControl, UpArrow, DownArrow, LeftArrow, RightArrow,
        A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
        Alpha0, Alpha1, Alpha2, Alpha3, Alpha4, Alpha5, Alpha6, Alpha7, Alpha8, Alpha9,
        Mouse0, Mouse1, Mouse2, JoystickButton0, JoystickButton1,
    }

    public static class Input
    {
        internal static readonly Dictionary<string, float> Ejes = new();
        internal static readonly HashSet<KeyCode> Mantenidas = new(), Bajadas = new(), Subidas = new();
        static readonly Dictionary<string, KeyCode> Botones = new() { ["Jump"] = KeyCode.Space, ["Fire1"] = KeyCode.Mouse0, ["Fire2"] = KeyCode.Mouse1, ["Submit"] = KeyCode.Return, ["Cancel"] = KeyCode.Escape };
        public static Vector3 mousePosition { get; internal set; }
        public static float GetAxis(string n) => Ejes.TryGetValue(n, out var v) ? v : 0;
        public static float GetAxisRaw(string n) { float v = GetAxis(n); return v > 0 ? 1 : v < 0 ? -1 : 0; }
        public static bool GetKey(KeyCode k) => Mantenidas.Contains(k);
        public static bool GetKeyDown(KeyCode k) => Bajadas.Contains(k);
        public static bool GetKeyUp(KeyCode k) => Subidas.Contains(k);
        static KeyCode Boton(string n) => Botones.TryGetValue(n, out var k) ? k : throw new ArgumentException($"El botón '{n}' no está configurado en el Input Manager");
        public static bool GetButton(string n) => GetKey(Boton(n));
        public static bool GetButtonDown(string n) => GetKeyDown(Boton(n));
        public static bool GetButtonUp(string n) => GetKeyUp(Boton(n));
    }

    // ── Objetos y componentes ──
    public class Object
    {
        public string name { get; set; } = "";
        internal bool destruido, porDestruir;
        public static bool operator ==(Object a, Object b)
        {
            bool an = a is null || a.destruido, bn = b is null || b.destruido;
            if (an || bn) return an && bn;
            return ReferenceEquals(a, b);
        }
        public static bool operator !=(Object a, Object b) => !(a == b);
        public static implicit operator bool(Object o) => o != null;
        public override bool Equals(object o) => o is Object u ? this == u : o is null && this == null;
        public override int GetHashCode() => base.GetHashCode();
        public int GetInstanceID() => System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(this);
        public override string ToString() => name;

        public static void Destroy(Object o, float t = 0) { if (o is not null) Simulacion.Motor.Destruir(o, t); }
        public static void DestroyImmediate(Object o) { if (o is not null) Simulacion.Motor.DestruirYa(o); }
        public static T Instantiate<T>(T original) where T : Object => Simulacion.Motor.Clonar(original, null, null);
        public static T Instantiate<T>(T original, Vector3 pos, Quaternion rot) where T : Object => Simulacion.Motor.Clonar(original, pos, rot);
        public static T FindObjectOfType<T>() where T : Object => Simulacion.Motor.Vivos().OfType<T>().FirstOrDefault();
        public static T[] FindObjectsOfType<T>() where T : Object => Simulacion.Motor.Vivos().OfType<T>().ToArray();
    }

    public sealed class GameObject : Object
    {
        internal readonly List<Component> componentes = new();
        internal bool activo = true, esPrefab;
        public string tag { get; set; } = "Untagged";
        public int layer { get; set; }
        public Transform transform { get; }
        public GameObject() : this("GameObject") { }
        public GameObject(string name) { this.name = name; transform = new Transform { name = name }; transform.gameObject = this; componentes.Add(transform); }
        public GameObject gameObject => this;
        public bool activeSelf => activo;
        public bool activeInHierarchy => activo;
        public bool CompareTag(string t) => tag == t;
        public void SetActive(bool v) => Simulacion.Motor.Activar(this, v);
        public T AddComponent<T>() where T : Component => (T)Simulacion.Motor.Agregar(this, typeof(T), null);
        public Component AddComponent(Type t) => Simulacion.Motor.Agregar(this, t, null);
        public T GetComponent<T>() => componentes.Where(c => !c.destruido).OfType<T>().FirstOrDefault();
        public bool TryGetComponent<T>(out T c) { c = GetComponent<T>(); return c != null; }
        public T[] GetComponents<T>() => componentes.Where(c => !c.destruido).OfType<T>().ToArray();
        public T GetComponentInChildren<T>() => GetComponent<T>();
    }

    public class Component : Object
    {
        public GameObject gameObject { get; internal set; }
        public Transform transform => gameObject?.transform;
        public string tag { get => gameObject.tag; set => gameObject.tag = value; }
        public bool CompareTag(string t) => gameObject.tag == t;
        public T GetComponent<T>() => gameObject.GetComponent<T>();
        public bool TryGetComponent<T>(out T c) => gameObject.TryGetComponent(out c);
        public T[] GetComponents<T>() => gameObject.GetComponents<T>();
        public T GetComponentInChildren<T>() => gameObject.GetComponent<T>();
    }

    public class Transform : Component
    {
        public Vector3 position { get; set; }
        public Quaternion rotation { get; set; } = Quaternion.identity;
        public Vector3 localScale { get; set; } = Vector3.one;
        public Vector3 localPosition { get => position; set => position = value; }
        public Quaternion localRotation { get => rotation; set => rotation = value; }
        public Vector3 eulerAngles { get => rotation.eulerAngles; set => rotation = Quaternion.Euler(value); }
        public Vector3 localEulerAngles { get => eulerAngles; set => eulerAngles = value; }
        public Vector3 forward { get => rotation * Vector3.forward; set => rotation = Quaternion.LookRotation(value); }
        public Vector3 right => rotation * Vector3.right;
        public Vector3 up => rotation * Vector3.up;
        public Transform parent { get; set; }
        public void Translate(Vector3 v) => position += rotation * v;
        public void Translate(float x, float y, float z) => Translate(new Vector3(x, y, z));
        public void Translate(Vector3 v, Space s) => position += s == Space.World ? v : rotation * v;
        public void Rotate(Vector3 euler) => rotation = rotation * Quaternion.Euler(euler);
        public void Rotate(float x, float y, float z) => Rotate(new Vector3(x, y, z));
        public void Rotate(Vector3 axis, float angle) => rotation = rotation * Quaternion.AngleAxis(angle, axis);
        public void LookAt(Vector3 p) => rotation = Quaternion.LookRotation(p - position);
        public void LookAt(Transform t) => LookAt(t.position);
        public Vector3 TransformPoint(Vector3 p) => position + rotation * Vector3.Scale(p, localScale);
        public Vector3 InverseTransformPoint(Vector3 p) { var l = Quaternion.Inverse(rotation) * (p - position); return new(l.x / localScale.x, l.y / localScale.y, l.z / localScale.z); }
        public Vector3 TransformDirection(Vector3 d) => rotation * d;
        public Vector3 InverseTransformDirection(Vector3 d) => Quaternion.Inverse(rotation) * d;
    }

    public enum Space { World, Self }

    public class Behaviour : Component
    {
        internal bool habilitado = true;
        public bool enabled { get => habilitado; set => Simulacion.Motor.Habilitar(this, value); }
        public bool isActiveAndEnabled => habilitado && gameObject != null && gameObject.activo;
    }

    public class YieldInstruction { }
    public sealed class WaitForSeconds : YieldInstruction { public readonly float segundos; public WaitForSeconds(float s) { segundos = s; } }
    public sealed class WaitForSecondsRealtime : YieldInstruction { public readonly float segundos; public WaitForSecondsRealtime(float s) { segundos = s; } }
    public sealed class WaitForEndOfFrame : YieldInstruction { }
    public sealed class WaitForFixedUpdate : YieldInstruction { }
    public sealed class WaitUntil : YieldInstruction { public readonly Func<bool> cond; public WaitUntil(Func<bool> c) { cond = c; } }
    public sealed class WaitWhile : YieldInstruction { public readonly Func<bool> cond; public WaitWhile(Func<bool> c) { cond = c; } }

    public sealed class Coroutine : YieldInstruction
    {
        internal readonly Stack<IEnumerator> pila = new();
        internal object espera;
        internal float hasta;
        internal bool terminada;
        internal int ultimoFotograma;
        internal MonoBehaviour duenio;
        public bool Terminada => terminada;
    }

    public class MonoBehaviour : Behaviour
    {
        internal bool despierto;
        public Coroutine StartCoroutine(IEnumerator rutina)
        {
            if (rutina == null) throw new ArgumentNullException(nameof(rutina));
            if (!gameObject.activo) throw new InvalidOperationException($"No se puede iniciar una corrutina: el GameObject '{gameObject.name}' está inactivo.");
            return Simulacion.Motor.IniciarCorrutina(this, rutina);
        }
        public void StopCoroutine(Coroutine c) { if (c != null) c.terminada = true; }
        public void StopAllCoroutines() => Simulacion.Motor.PararCorrutinas(this);
        public void Invoke(string metodo, float t) => StartCoroutine(Invocar(metodo, t));
        System.Collections.IEnumerator Invocar(string m, float t) { yield return new WaitForSeconds(t); Simulacion.Motor.Llamar(this, m); }
        public static void print(object m) => Debug.Log(m);
    }

    public class ScriptableObject : Object
    {
        public static T CreateInstance<T>() where T : ScriptableObject
        {
            var o = Activator.CreateInstance<T>();
            o.name = typeof(T).Name;
            Simulacion.Motor.Llamar(o, "Awake");
            Simulacion.Motor.Llamar(o, "OnEnable");
            return o;
        }
    }
}

namespace UnityEngine.Simulacion
{
    // El "motor": crea objetos y avanza fotogramas llamando a Awake, OnEnable, Start, FixedUpdate,
    // Update, corrutinas, LateUpdate, OnDisable y OnDestroy en el mismo orden que Unity.
    public static class Motor
    {
        static readonly List<Component> todos = new();
        static readonly HashSet<MonoBehaviour> sinStart = new();
        static readonly List<Coroutine> corrutinas = new();
        static readonly List<(Object obj, float t)> porDestruir = new();
        static readonly Dictionary<(Type, string), MethodInfo> cache = new();
        static float acumuladorFijo;

        public static IEnumerable<Object> Vivos()
        {
            var comps = todos.Where(c => !c.destruido && !c.gameObject.esPrefab).ToList();
            return comps.Cast<Object>().Concat(comps.Select(c => c.gameObject).Distinct());
        }

        static MethodInfo Metodo(Type t, string n)
        {
            if (cache.TryGetValue((t, n), out var m)) return m;
            for (var x = t; x != null && x != typeof(MonoBehaviour) && x != typeof(ScriptableObject); x = x.BaseType)
            {
                m = x.GetMethod(n, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly, null, Type.EmptyTypes, null);
                if (m != null) break;
            }
            return cache[(t, n)] = m;
        }

        public static void Llamar(object o, string n)
        {
            var m = Metodo(o.GetType(), n);
            if (m == null) return;
            try
            {
                var r = m.Invoke(o, null);
                if (r is IEnumerator e && o is MonoBehaviour mb && n == "Start") IniciarCorrutina(mb, e);
            }
            catch (TargetInvocationException ex) { System.Runtime.ExceptionServices.ExceptionDispatchInfo.Capture(ex.InnerException).Throw(); }
        }

        static bool Activo(Component c) => !c.destruido && c.gameObject.activo && !c.gameObject.esPrefab && (c is not Behaviour b || b.habilitado);

        internal static Component Agregar(GameObject go, Type t, Action<Component> antesDeAwake)
        {
            if (!typeof(Component).IsAssignableFrom(t)) throw new ArgumentException($"{t.Name} no es un Component");
            var c = (Component)Activator.CreateInstance(t);
            c.gameObject = go; c.name = go.name;
            go.componentes.Add(c);
            todos.Add(c);
            antesDeAwake?.Invoke(c);
            if (go.esPrefab || !go.activo) return c;
            if (c is MonoBehaviour m0) m0.despierto = true;
            Llamar(c, "Awake");
            if (c is Behaviour b && b.habilitado) Llamar(c, "OnEnable");
            if (c is MonoBehaviour mb) sinStart.Add(mb);
            return c;
        }

        internal static void Activar(GameObject go, bool v)
        {
            if (go.activo == v) return;
            go.activo = v;
            foreach (var c in go.componentes.ToList())
            {
                if (c is not Behaviour b || c.destruido) continue;
                if (v)
                {
                    if (c is MonoBehaviour mb && !mb.despierto) { mb.despierto = true; Llamar(c, "Awake"); sinStart.Add(mb); }
                    if (b.habilitado) Llamar(c, "OnEnable");
                }
                else
                {
                    if (b.habilitado) Llamar(c, "OnDisable");
                    if (c is MonoBehaviour mb) PararCorrutinas(mb);
                }
            }
        }

        internal static void Habilitar(Behaviour b, bool v)
        {
            if (b.habilitado == v) return;
            b.habilitado = v;
            if (b.gameObject == null || !b.gameObject.activo || b.gameObject.esPrefab || b.destruido) return;
            Llamar(b, v ? "OnEnable" : "OnDisable");
        }

        internal static Coroutine IniciarCorrutina(MonoBehaviour mb, IEnumerator e)
        {
            var c = new Coroutine { duenio = mb };
            c.pila.Push(e);
            corrutinas.Add(c);
            Paso(c); // como en Unity: corre hasta el primer yield en el mismo instante
            return c;
        }

        internal static void PararCorrutinas(MonoBehaviour mb) { foreach (var c in corrutinas) if (c.duenio == (object)mb) c.terminada = true; }

        static bool Esperando(Coroutine c) => c.espera switch
        {
            WaitForSeconds => Time.time < c.hasta,
            WaitForSecondsRealtime => Time.unscaledTime < c.hasta,
            WaitUntil w => !w.cond(),
            WaitWhile w => w.cond(),
            Coroutine h => !h.terminada,
            _ => false,
        };

        static void Paso(Coroutine c)
        {
            c.ultimoFotograma = Time.frameCount;
            while (!c.terminada)
            {
                if (c.pila.Count == 0) { c.terminada = true; return; }
                var e = c.pila.Peek();
                if (!e.MoveNext()) { c.pila.Pop(); continue; }
                var y = e.Current;
                if (y is IEnumerator anidada) { c.pila.Push(anidada); continue; }
                c.espera = y;
                if (y is WaitForSeconds w) c.hasta = Time.time + w.segundos;
                if (y is WaitForSecondsRealtime wr) c.hasta = Time.unscaledTime + wr.segundos;
                return;
            }
        }

        internal static void Destruir(Object o, float t) { if (!o.destruido && !o.porDestruir) { porDestruir.Add((o, Time.time + t)); if (t <= 0) o.porDestruir = true; } }

        internal static void DestruirYa(Object o)
        {
            if (o.destruido) return;
            if (o is GameObject go) { foreach (var c in go.componentes.ToList()) DestruirYa(c); go.destruido = true; return; }
            if (o is Component c2)
            {
                if (c2 is Behaviour b && b.habilitado && c2.gameObject.activo && !c2.gameObject.esPrefab) Llamar(c2, "OnDisable");
                if (c2 is MonoBehaviour mb) { PararCorrutinas(mb); sinStart.Remove(mb); }
                if (!c2.gameObject.esPrefab) Llamar(c2, "OnDestroy");
                c2.destruido = true;
                if (c2 is Transform) c2.gameObject.destruido = true;
                return;
            }
            o.destruido = true;
        }

        internal static T Clonar<T>(T original, Vector3? pos, Quaternion? rot) where T : Object
        {
            if (original == null) throw new ArgumentException("El objeto a instanciar es null.");
            GameObject fuente = original is GameObject g ? g : (original as Component)?.gameObject ?? throw new ArgumentException("Solo se pueden instanciar GameObjects y componentes.");
            var nuevo = new GameObject(fuente.name + "(Clone)") { tag = fuente.tag, layer = fuente.layer };
            nuevo.transform.position = pos ?? fuente.transform.position;
            nuevo.transform.rotation = rot ?? fuente.transform.rotation;
            nuevo.transform.localScale = fuente.transform.localScale;
            Component equivalente = null;
            foreach (var c in fuente.componentes.Where(c => c is not Transform && !c.destruido).ToList())
            {
                var copia = Agregar(nuevo, c.GetType(), d => CopiarCampos(c, d));
                if (ReferenceEquals(c, original)) equivalente = copia;
            }
            return original is GameObject ? (T)(Object)nuevo : (T)(Object)equivalente;
        }

        static void CopiarCampos(object de, object a)
        {
            for (var t = de.GetType(); t != null && t != typeof(MonoBehaviour); t = t.BaseType)
                foreach (var f in t.GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly))
                    if (f.IsPublic || f.IsDefined(typeof(SerializeField))) f.SetValue(a, f.GetValue(de));
        }

        // ── API para las pruebas ──
        public static T Crear<T>(string nombre = null) where T : Component => new GameObject(nombre ?? typeof(T).Name).AddComponent<T>();

        // Un prefab: existe pero no recibe Awake/Start/Update, como un asset en el proyecto.
        public static T Prefab<T>(string nombre = null, Action<T> configurar = null) where T : Component
        {
            var go = new GameObject(nombre ?? typeof(T).Name) { esPrefab = true };
            var c = go.AddComponent<T>();
            configurar?.Invoke(c);
            return c;
        }

        public static void Eje(string nombre, float valor) => Input.Ejes[nombre] = valor;
        public static void Pulsar(KeyCode k) { if (Input.Mantenidas.Add(k)) Input.Bajadas.Add(k); }
        public static void Soltar(KeyCode k) { if (Input.Mantenidas.Remove(k)) Input.Subidas.Add(k); }
        public static void Validar(object o) => Llamar(o, "OnValidate");

        public static void Fotograma(float dt = 1f / 60f)
        {
            Time.unscaledDeltaTime = dt;
            Time.deltaTime = dt * Time.timeScale;
            Time.time += Time.deltaTime;
            Time.unscaledTime += dt;
            Time.frameCount++;

            foreach (var mb in sinStart.ToList()) if (Activo(mb)) { sinStart.Remove(mb); Llamar(mb, "Start"); }

            acumuladorFijo += Time.deltaTime;
            float paso = Time.fixedDeltaTime, dtFrame = Time.deltaTime;
            while (acumuladorFijo >= paso - 1e-6f)
            {
                acumuladorFijo -= paso;
                Time.deltaTime = paso;
                foreach (var c in todos.ToList()) if (Activo(c)) Llamar(c, "FixedUpdate");
            }
            Time.deltaTime = dtFrame;

            foreach (var c in todos.ToList()) if (Activo(c) && !(c is MonoBehaviour m && sinStart.Contains(m))) Llamar(c, "Update");
            foreach (var co in corrutinas.ToList())
            {
                if (co.terminada || co.duenio.destruido || !co.duenio.gameObject.activo) { co.terminada = true; continue; }
                if (co.ultimoFotograma == Time.frameCount) continue; // recién iniciada en este fotograma
                if (co.espera is WaitForEndOfFrame or WaitForFixedUpdate || !Esperando(co)) Paso(co);
            }
            corrutinas.RemoveAll(c => c.terminada);
            foreach (var c in todos.ToList()) if (Activo(c) && !(c is MonoBehaviour m && sinStart.Contains(m))) Llamar(c, "LateUpdate");

            foreach (var (o, t) in porDestruir.ToList()) if (Time.time >= t - 1e-6f) { porDestruir.Remove((o, t)); DestruirYa(o); }
            Input.Bajadas.Clear(); Input.Subidas.Clear();
        }

        public static void Avanzar(float segundos, float fps = 60)
        {
            int n = (int)MathF.Round(segundos * fps);
            for (int i = 0; i < n; i++) Fotograma(1f / fps);
        }
    }
}

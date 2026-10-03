"""'Calm Shore': an 80-second, seamlessly looping, soothing beach ambience.
Slow, soft waves (no crashing), a gentle breeze that rises and falls, and a few very distant, soft gull calls.
Everything wraps around the loop end so there is no seam.
"""
import numpy as np
from scipy.signal import butter, sosfilt
import wave

SR = 44100
DUR = 80.0
N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)

def add(buf_l, buf_r, sig, start, pan=0.0, gain=1.0):
    i0 = int(round(start * SR)) % N
    idx = (np.arange(len(sig)) + i0) % N
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    np.add.at(buf_l, idx, sig * gain * lg); np.add.at(buf_r, idx, sig * gain * rg)

def colored(n, slope, seed, lo=None, hi=None):
    r = np.random.default_rng(seed)
    X = np.fft.rfft(r.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X /= np.maximum(f, 15) ** (slope / 2)
    if lo: X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    y = np.fft.irfft(X, n); return y / (np.max(np.abs(y)) + 1e-9)

def slow_curve(n, seed, smooth_s):
    r = np.random.default_rng(seed)
    X = np.fft.rfft(r.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X *= np.exp(-(f * smooth_s) ** 2)
    y = np.fft.irfft(X, n); y -= y.min(); return y / (y.max() + 1e-9)

# ---------- soft, continuous sea bed (dark, low) ----------
# (no constant bed: between waves it is quiet)

# ---------- slow waves: long swell in, soft wash, long sigh out (no crash) ----------
def soft_wave(seed, size):
    r = np.random.default_rng(seed)
    dur = r.uniform(12, 14); n = int(dur * SR); tt = np.arange(n) / SR
    peak = r.uniform(4.2, 5.2)
    # smooth raised-cosine-ish rise and a longer exponential-like fall
    rise = 0.5 - 0.5 * np.cos(np.pi * np.clip(tt / peak, 0, 1))
    fall = np.exp(-np.clip(tt - peak, 0, None) / 2.3)
    env = (rise * fall) ** 0.6 * np.clip((dur - tt) / 3.5, 0, 1)   # flatter, rounder swell
    body = colored(n, 1.5, seed + 10, lo=140, hi=1100)            # the deep "whoosh"
    foam_env = (0.5 - 0.5 * np.cos(np.pi * np.clip((tt - peak + .6) / 1.6, 0, 1))) * np.exp(-np.clip(tt - peak - 1, 0, None) / 2.2)
    foam_flutter = 0.7 + 0.3 * slow_curve(n, seed + 20, 0.05)
    foam = colored(n, 1.2, seed + 30, lo=700, hi=4000) * foam_env * foam_flutter   # soft, watery wash
    # water running back over sand: soft, slightly brighter trickle near the end
    back_env = np.exp(-((tt - (peak + 3.2)) / 1.6) ** 2)
    back = colored(n, 1.0, seed + 40, lo=1200, hi=4500) * back_env * (0.6 + 0.4 * slow_curve(n, seed + 50, 0.02))
    return (body * env * 0.85 + foam * 0.17 + back * 0.045) * size

rng = np.random.default_rng(5)
tcur = 0.0; k = 0
while tcur < DUR:
    add(L, R, soft_wave(100 + k, rng.uniform(0.75, 0.9)), tcur, pan=rng.uniform(-0.3, 0.3), gain=0.30)
    tcur += rng.uniform(8.5, 10); k += 1

# ---------- very distant gulls: soft, rounded, short, far away ----------
GL = np.zeros(N); GR = np.zeros(N)
def soft_call(seed):
    r = np.random.default_rng(seed)
    dur = r.uniform(0.22, 0.32); n = int(dur * SR); tt = np.arange(n) / SR; u = tt / dur
    f_top = r.uniform(1050, 1250)
    f0 = f_top * (1 - 0.22 * u ** 1.4) * np.where(u < .12, 0.92 + 0.08 * u / .12, 1)   # small lift, then a gentle fall
    ph = 2 * np.pi * np.cumsum(f0) / SR
    s = np.sin(ph) + 0.38 * np.sin(2 * ph) + 0.16 * np.sin(3 * ph) + 0.06 * np.sin(4 * ph)   # rounded, a little presence
    env = np.sin(np.pi * u) ** 1.5
    return s * env
def call_group(seed):
    r = np.random.default_rng(seed); parts = []; t0 = 0.0
    for i in range(r.integers(2, 4)):
        c = soft_call(seed * 7 + i); parts.append((t0, c)); t0 += len(c) / SR + r.uniform(0.25, 0.45)
    buf = np.zeros(int((t0 + .3) * SR))
    for st, c in parts: i0 = int(st * SR); buf[i0:i0 + len(c)] += c
    return sosfilt(butter(1, 4200, fs=SR, output="sos"), buf)     # distance softens, but outdoors stays clear
for i, gt in enumerate([14.0, 46.0, 68.0]):
    add(GL, GR, call_group(300 + i), gt, pan=[-0.7, 0.6, -0.2][i], gain=0.022)
# gulls get their own wide, soft space so they sound far away
def circ_reverb(x, seconds, mix, seed, lp):
    r = np.random.default_rng(seed); n = int(seconds * SR); tt = np.arange(n) / SR
    ir = sosfilt(butter(1, lp, fs=SR, output="sos"), r.standard_normal(n) * np.exp(-tt * 2.0)); ir /= np.sqrt(np.sum(ir ** 2))
    H = np.fft.rfft(np.concatenate([ir, np.zeros(N - n)]))
    return x * (1 - mix) + np.fft.irfft(np.fft.rfft(x) * H, N) * mix
L += circ_reverb(GL, 0.9, 0.12, 11, 5000); R += circ_reverb(GR, 0.9, 0.12, 12, 5000)   # open air: just a hint of space

# ---------- master: light air around everything, warm top end, no saturation ----------
L = circ_reverb(L, 1.2, 0.06, 3, 6000); R = circ_reverb(R, 1.2, 0.06, 4, 6000)
lp = butter(2, 6500, fs=SR, output="sos"); hp = butter(2, 30, btype="high", fs=SR, output="sos")
for _ in range(1):
    L = sosfilt(lp, sosfilt(hp, np.concatenate([L, L])))[N:]; R = sosfilt(lp, sosfilt(hp, np.concatenate([R, R])))[N:]
st = np.stack([L, R], 1)
# gentle compressor: tames the loudest moment of each wave so peaks and lulls sit closer together
lvl = np.sqrt(np.mean(st ** 2, axis=1)); k = int(0.4 * SR)
lvl = np.convolve(np.concatenate([lvl[-k:], lvl, lvl[:k]]), np.ones(k) / k, "same")[k:-k] + 1e-9
thr = np.percentile(lvl, 35); gain = np.where(lvl > thr, (lvl / thr) ** (1 / 3.5 - 1), 1.0)
st *= gain[:, None]
st *= 0.45 / np.max(np.abs(st))
fade = int(5 * SR); ramp = 0.5 - 0.5 * np.cos(np.pi * np.arange(fade) / fade)   # gentle 5 s fade in / out
st[:fade] *= ramp[:, None]; st[-fade:] *= ramp[::-1, None]
with wave.open("audio/calm-shore.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f"len {DUR:.0f}s peak {np.abs(st).max():.2f} seam {np.abs(st[0]-st[-1]).max():.4f}")

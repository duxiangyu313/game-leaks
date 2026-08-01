"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { TOOL_FREE_LIMIT } from "@/lib/site-config";

// ═══════════════════════════════════════════════════════════
// 硬件预设选项（覆盖 2021-2026 主流装机配置）
// ═══════════════════════════════════════════════════════════
const CPU_OPTIONS = [
  // Intel 14/13/12 代桌面
  "Intel Core i9-14900K",
  "Intel Core i7-14700K",
  "Intel Core i5-14600K",
  "Intel Core i5-14400F",
  "Intel Core i3-14100F",
  "Intel Core i9-13900K",
  "Intel Core i7-13700K",
  "Intel Core i5-13600K",
  "Intel Core i5-13400F",
  "Intel Core i9-12900K",
  "Intel Core i7-12700K",
  "Intel Core i5-12600K",
  "Intel Core i5-12400F",
  // AMD Ryzen 9000/8000/7000/5000
  "AMD Ryzen 9 9950X",
  "AMD Ryzen 9 9900X",
  "AMD Ryzen 7 9700X",
  "AMD Ryzen 5 9600X",
  "AMD Ryzen 9 7950X3D",
  "AMD Ryzen 9 7900X3D",
  "AMD Ryzen 7 7800X3D",
  "AMD Ryzen 7 7700X",
  "AMD Ryzen 5 7600X",
  "AMD Ryzen 5 7500F",
  "AMD Ryzen 7 5800X3D",
  "AMD Ryzen 7 5700X",
  "AMD Ryzen 5 5600",
  "AMD Ryzen 5 5500",
  // 移动端常见
  "Intel Core i9-14900HX",
  "Intel Core i7-14700H",
  "Intel Core i5-14500H",
  "Intel Core i7-13700H",
  "Intel Core i5-13500H",
  "AMD Ryzen 9 7945HX",
  "AMD Ryzen 7 7840H",
  "AMD Ryzen 5 7640H",
];

const GPU_OPTIONS = [
  // NVIDIA RTX 50 系列
  "NVIDIA RTX 5090",
  "NVIDIA RTX 5080",
  "NVIDIA RTX 5070 Ti",
  "NVIDIA RTX 5070",
  "NVIDIA RTX 5060 Ti",
  "NVIDIA RTX 5060",
  // NVIDIA RTX 40 系列
  "NVIDIA RTX 4090",
  "NVIDIA RTX 4080 SUPER",
  "NVIDIA RTX 4080",
  "NVIDIA RTX 4070 Ti SUPER",
  "NVIDIA RTX 4070 Ti",
  "NVIDIA RTX 4070 SUPER",
  "NVIDIA RTX 4070",
  "NVIDIA RTX 4060 Ti 8GB",
  "NVIDIA RTX 4060 Ti 16GB",
  "NVIDIA RTX 4060",
  "NVIDIA RTX 4050",
  // NVIDIA RTX 30 系列（仍占 70%+ 装机）
  "NVIDIA RTX 3090 Ti",
  "NVIDIA RTX 3090",
  "NVIDIA RTX 3080 Ti",
  "NVIDIA RTX 3080 12GB",
  "NVIDIA RTX 3080 10GB",
  "NVIDIA RTX 3070 Ti",
  "NVIDIA RTX 3070",
  "NVIDIA RTX 3060 Ti GDDR6X",
  "NVIDIA RTX 3060 Ti",
  "NVIDIA RTX 3060 12GB",
  "NVIDIA RTX 3050 8GB",
  // NVIDIA 入门 / 上代
  "NVIDIA GTX 1660 SUPER",
  "NVIDIA GTX 1660 Ti",
  "NVIDIA GTX 1060 6GB",
  "NVIDIA RTX 2060 SUPER",
  "NVIDIA RTX 2060 12GB",
  "NVIDIA RTX 2070 SUPER",
  // AMD RX 9000/8000/7000/6000
  "AMD RX 9070 XT",
  "AMD RX 9070",
  "AMD RX 8900 XTX",
  "AMD RX 7900 XTX",
  "AMD RX 7900 GRE",
  "AMD RX 7900 XT",
  "AMD RX 7800 XT",
  "AMD RX 7700 XT",
  "AMD RX 7600 XT",
  "AMD RX 7600",
  "AMD RX 6950 XT",
  "AMD RX 6900 XT",
  "AMD RX 6800 XT",
  "AMD RX 6800",
  "AMD RX 6750 XT",
  "AMD RX 6700 XT",
  "AMD RX 6650 XT",
  "AMD RX 6600 XT",
  "AMD RX 6600",
  "AMD RX 6500 XT",
  // Intel ARC
  "Intel Arc B580",
  "Intel Arc B570",
  "Intel Arc A770 16GB",
  "Intel Arc A750 8GB",
  "Intel Arc A580 8GB",
  // 移动端常见
  "NVIDIA RTX 4090 Laptop",
  "NVIDIA RTX 4080 Laptop",
  "NVIDIA RTX 4070 Laptop",
  "NVIDIA RTX 4060 Laptop",
  "NVIDIA RTX 4050 Laptop",
  "NVIDIA RTX 3070 Laptop",
  "NVIDIA RTX 3060 Laptop",
  "AMD RX 7900M",
  "AMD RX 7600M XT",
];

const RAM_OPTIONS = [4, 8, 16, 24, 32, 48, 64, 96, 128];
const STORAGE_OPTIONS = [128, 256, 512, 1024, 2048, 4096];

// ═══════════════════════════════════════════════════════════
// 兜底配置：国产 3A 大作通用推荐基线（当数据库无该游戏数据时使用）
// ═══════════════════════════════════════════════════════════
const GENERIC_AAA_BASELINE: GameRequirement = {
  game_id: "generic-aaa",
  game_title: "国产 3A 大作通用基线（参考）",
  cpu_min: "Intel Core i5-10400F / AMD Ryzen 5 3600",
  cpu_rec: "Intel Core i7-12700K / AMD Ryzen 7 7700X",
  gpu_min: "NVIDIA GTX 1060 6GB / AMD RX 580 8GB",
  gpu_rec: "NVIDIA RTX 3060 12GB / AMD RX 6650 XT",
  ram_min: 8,
  ram_rec: 16,
  storage_min: 100,
  storage_rec: 150,
};

interface UserConfig {
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
}

interface GameRequirement {
  game_id: string;
  game_title: string;
  cpu_min: string | null;
  cpu_rec: string | null;
  gpu_min: string | null;
  gpu_rec: string | null;
  ram_min: number | null;
  ram_rec: number | null;
  storage_min: number | null;
  storage_rec: number | null;
}

/** 从需求字符串中提取关键词列表（品牌+型号） */
function extractKeywords(text: string | null): string[] {
  if (!text) return [];
  // 拆分为单词，过滤掉过短/无意义的词
  return text
    .toLowerCase()
    .split(/[\s,/-]+/)
    .filter((w) => w.length >= 2)
    .filter((w) => !["gb", "ghz", "or", "and", "the", "with", "equivalent", "better"].includes(w));
}

/** 尝试用关键词列表匹配用户输入 */
function matchKeywords(userInput: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true; // 无关键词视为可匹配
  const input = userInput.toLowerCase();
  return keywords.some((kw) => input.includes(kw));
}

export default function ReqCheckPage() {
  const [config, setConfig] = useState<UserConfig>({ cpu: "", gpu: "", ram: 0, storage: 0 });
  const [games, setGames] = useState<{ id: string; title: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [requirement, setRequirement] = useState<GameRequirement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [cpuVerdict, setCpuVerdict] = useState<string | null>(null);
  const [gpuVerdict, setGpuVerdict] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState<number>(0);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBaseline, setIsBaseline] = useState(false); // 是否用了通用兜底基线

  // 初始化：加载游戏列表 + 检查剩余次数
  useEffect(() => {
    loadGames();
    checkRemainingCount();
  }, []);

  async function loadGames() {
    setGamesLoading(true);
    const { data } = await supabase.from("games").select("id, title").order("title");
    if (data) setGames(data);
    setGamesLoading(false);
  }

  function checkRemainingCount() {
    const today = new Date().toISOString().split("T")[0];
    const key = TOOL_FREE_LIMIT.reqCheck.storageKey;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setRemainingCount(Math.max(0, TOOL_FREE_LIMIT.reqCheck.dailyLimit - parsed.count));
      } else {
        setRemainingCount(TOOL_FREE_LIMIT.reqCheck.dailyLimit);
      }
    } else {
      setRemainingCount(TOOL_FREE_LIMIT.reqCheck.dailyLimit);
    }
  }

  function incrementUsage() {
    const today = new Date().toISOString().split("T")[0];
    const key = TOOL_FREE_LIMIT.reqCheck.storageKey;
    const stored = localStorage.getItem(key);
    let count = 1;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) count = parsed.count + 1;
    }
    localStorage.setItem(key, JSON.stringify({ date: today, count }));
    setRemainingCount(Math.max(0, TOOL_FREE_LIMIT.reqCheck.dailyLimit - count));
  }

  // 自动检测配置（浏览器 API 有限，只能获取核心数和内存）
  function autoDetect() {
    const cores = navigator.hardwareConcurrency || 0;
    const memory = (navigator as any).deviceMemory || 0;
    setConfig((prev) => ({
      ...prev,
      cpu: cores ? `${cores} 核心` : "",
      ram: memory ? Math.round(memory) : 0,
    }));
  }

  // 执行检测
  async function handleCheck() {
    setErrorMsg(null);

    if (remainingCount <= 0) {
      setErrorMsg("今日免费检测次数已用完，明日再来！");
      return;
    }
    if (!selectedGame || !config.cpu || !config.gpu || !config.ram) {
      setErrorMsg("请填写完整配置（CPU、GPU、内存）并选择游戏");
      return;
    }

    setChecking(true);

    // 查询游戏配置需求
    const { data: reqData } = await supabase
      .from("game_requirements")
      .select("*, games(title)")
      .eq("game_id", selectedGame)
      .maybeSingle();

    // 无论是否查到数据，都消耗一次检测次数（防刷）
    incrementUsage();

    // 查到真实数据 → 用真实数据；没有 → 用国产3A通用基线兜底
    let useBaseline = false;
    let req: any;
    let gameTitle: string;

    if (reqData) {
      req = reqData as any;
      gameTitle = req.games?.title || "";
    } else {
      useBaseline = true;
      req = GENERIC_AAA_BASELINE;
      // 从 games 表取标题
      gameTitle = games.find((g) => g.id === selectedGame)?.title || "所选游戏";
    }
    setIsBaseline(useBaseline);

    // 数值比对：内存和存储
    const ramOk = config.ram >= (req.ram_min || 0);
    const storageOk = config.storage >= (req.storage_min || 0);

    // CPU/GPU 关键词匹配
    const cpuKw = extractKeywords(req.cpu_min);
    const gpuKw = extractKeywords(req.gpu_min);
    const cpuOk = matchKeywords(config.cpu, cpuKw);
    const gpuOk = matchKeywords(config.gpu, gpuKw);

    // 单独判定 CPU/GPU
    if (cpuKw.length > 0) {
      setCpuVerdict(cpuOk ? "✅ 匹配" : "⚠️ 无法自动判断，请手动对比下方配置");
    } else {
      setCpuVerdict(null);
    }
    if (gpuKw.length > 0) {
      setGpuVerdict(gpuOk ? "✅ 匹配" : "⚠️ 无法自动判断，请手动对比下方配置");
    } else {
      setGpuVerdict(null);
    }

    // 综合判定
    let verdict: string;
    if (ramOk && storageOk && cpuOk && gpuOk) {
      verdict = "✅ 可以运行";
    } else if (ramOk && storageOk) {
      verdict = "⚠️ 勉强可运行（CPU/GPU 可能不达标）";
    } else {
      verdict = "❌ 无法运行（内存或存储不足）";
    }

    setResult(verdict);
    setRequirement({
      game_id: req.game_id,
      game_title: gameTitle,
      cpu_min: req.cpu_min,
      cpu_rec: req.cpu_rec,
      gpu_min: req.gpu_min,
      gpu_rec: req.gpu_rec,
      ram_min: req.ram_min,
      ram_rec: req.ram_rec,
      storage_min: req.storage_min,
      storage_rec: req.storage_rec,
    });
    setChecking(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 行内错误提示 */}
      {errorMsg && (
        <div className="bg-[#E94560]/10 border border-[#E94560]/30 rounded-lg p-3 mb-4 text-center">
          <p className="text-[#E94560] text-sm">{errorMsg}</p>
        </div>
      )}

      {/* 剩余次数提示 */}
      <div className="bg-[#1A1A2E] rounded-lg p-4 mb-6 flex justify-between items-center">
        <span className="text-gray-400">今日剩余免费检测次数</span>
        <span className="text-[#F5A623] font-bold text-xl">
          {remainingCount} / {TOOL_FREE_LIMIT.reqCheck.dailyLimit}
        </span>
      </div>

      {/* 配置输入区 */}
      <div className="bg-[#1A1A2E] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">你的电脑配置</h2>
          <button onClick={autoDetect} className="text-sm text-[#F5A623] hover:underline">
            自动检测（核心数 + 内存）
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CPU 带下拉选项 */}
          <div>
            <label className="text-gray-400 text-sm">处理器 CPU <span className="text-gray-500">（点击右侧 ▾ 从列表选择）</span></label>
            <input
              list="cpu-list"
              value={config.cpu}
              onChange={(e) => setConfig({ ...config, cpu: e.target.value })}
              placeholder="如：Intel Core i5-12400F，或点右侧选"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2.5 mt-1 border border-gray-700 focus:border-[#E94560] focus:outline-none focus:ring-1 focus:ring-[#E94560]/40 transition-all"
            />
            <datalist id="cpu-list">
              {CPU_OPTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          {/* GPU 带下拉选项 */}
          <div>
            <label className="text-gray-400 text-sm">显卡 GPU <span className="text-gray-500">（点击右侧 ▾ 从列表选择）</span></label>
            <input
              list="gpu-list"
              value={config.gpu}
              onChange={(e) => setConfig({ ...config, gpu: e.target.value })}
              placeholder="如：NVIDIA RTX 3060，或点右侧选"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2.5 mt-1 border border-gray-700 focus:border-[#E94560] focus:outline-none focus:ring-1 focus:ring-[#E94560]/40 transition-all"
            />
            <datalist id="gpu-list">
              {GPU_OPTIONS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          {/* 内存 快捷按钮 + 输入 */}
          <div>
            <label className="text-gray-400 text-sm">内存 (GB) <span className="text-gray-500">（点按钮快选）</span></label>
            <div className="flex flex-wrap gap-1.5 mt-1 mb-1.5">
              {RAM_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setConfig({ ...config, ram: r })}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    config.ram === r
                      ? "bg-[#E94560]/20 border-[#E94560]/50 text-[#F5F1E8]"
                      : "bg-[#0A0E14] border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {r}G
                </button>
              ))}
            </div>
            <input
              type="number"
              value={config.ram || ""}
              onChange={(e) => setConfig({ ...config, ram: Number(e.target.value) })}
              placeholder="其他容量请输入"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 border border-gray-700 focus:border-[#E94560] focus:outline-none focus:ring-1 focus:ring-[#E94560]/40 transition-all"
            />
          </div>
          {/* 存储 快捷按钮 + 输入 */}
          <div>
            <label className="text-gray-400 text-sm">硬盘可用空间 (GB) <span className="text-gray-500">（点按钮快选）</span></label>
            <div className="flex flex-wrap gap-1.5 mt-1 mb-1.5">
              {STORAGE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setConfig({ ...config, storage: s })}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    config.storage === s
                      ? "bg-[#F5A623]/20 border-[#F5A623]/50 text-[#F5F1E8]"
                      : "bg-[#0A0E14] border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {s >= 1024 ? `${s / 1024}T` : `${s}G`}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={config.storage || ""}
              onChange={(e) => setConfig({ ...config, storage: Number(e.target.value) })}
              placeholder="其他容量请输入"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 border border-gray-700 focus:border-[#F5A623] focus:outline-none focus:ring-1 focus:ring-[#F5A623]/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 游戏选择区 */}
      <div className="bg-[#1A1A2E] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">选择游戏</h2>
        {gamesLoading ? (
          <div className="text-gray-400 text-sm py-2">加载游戏列表中...</div>
        ) : games.length === 0 ? (
          <div className="text-gray-500 text-sm py-2">暂无游戏数据</div>
        ) : (
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 border border-gray-700"
          >
            <option value="">请选择游戏</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 检测按钮 */}
      <button
        onClick={handleCheck}
        disabled={remainingCount <= 0 || checking}
        className="w-full bg-[#E94560] text-white font-bold py-3 rounded-lg hover:bg-[#E94560]/80 disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-all"
      >
        {checking ? "检测中..." : remainingCount > 0 ? "开始检测" : "今日次数已用完"}
      </button>

      {/* 结果展示区 */}
      {result && (
        <div className="bg-[#1A1A2E] rounded-lg p-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-white">
              {requirement?.game_title || "检测结果"}
            </h2>
            {isBaseline && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 font-medium">
                ⚠️ 通用基线参考（数据库暂无该游戏数据）
              </span>
            )}
          </div>
          <p className="text-2xl mb-1">{result}</p>
          {isBaseline && (
            <p className="text-xs text-[#A8A39A] mb-2">
              根据同类国产 3A 大作平均配置估算，实际需求以开发商公布为准
            </p>
          )}
          {/* CPU/GPU 单独判定 */}
          {(cpuVerdict || gpuVerdict) && (
            <div className="flex gap-6 text-sm mt-2 mb-4">
              {cpuVerdict && <span>{cpuVerdict}</span>}
              {gpuVerdict && <span>{gpuVerdict}</span>}
            </div>
          )}

          {requirement && (
            <div className="grid grid-cols-2 gap-6 text-sm mt-4 pt-4 border-t border-gray-700/50">
              {/* 最低配置 */}
              <div>
                <h3 className="text-[#E94560] font-bold mb-2">最低配置</h3>
                <p className="text-gray-400">CPU：{requirement.cpu_min || "未知"}</p>
                <p className="text-gray-400">GPU：{requirement.gpu_min || "未知"}</p>
                <p className="text-gray-400">内存：{requirement.ram_min != null ? `${requirement.ram_min} GB` : "未知"}</p>
                <p className="text-gray-400">存储：{requirement.storage_min != null ? `${requirement.storage_min} GB` : "未知"}</p>
              </div>
              {/* 推荐配置 */}
              <div>
                <h3 className="text-[#F5A623] font-bold mb-2">推荐配置</h3>
                <p className="text-gray-400">CPU：{requirement.cpu_rec || "未知"}</p>
                <p className="text-gray-400">GPU：{requirement.gpu_rec || "未知"}</p>
                <p className="text-gray-400">内存：{requirement.ram_rec != null ? `${requirement.ram_rec} GB` : "未知"}</p>
                <p className="text-gray-400">存储：{requirement.storage_rec != null ? `${requirement.storage_rec} GB` : "未知"}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 次数用完提示 */}
      {remainingCount === 0 && (
        <div className="bg-[#1A1A2E] rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-4">今日免费检测次数已用完</p>
          <p className="text-sm text-gray-500">每日 0:00 重置，或升级会员获取无限次数</p>
        </div>
      )}
    </div>
  );
}

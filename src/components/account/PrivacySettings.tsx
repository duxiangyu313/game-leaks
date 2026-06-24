"use client";

import { useState } from "react";

// 隐私设置目前用 localStorage 存储偏好
const PRIVACY_KEY = "gylb_privacy";

interface PrivacyPrefs {
  showHistory: boolean;
  showActivity: boolean;
}

function getPrefs(): PrivacyPrefs {
  try {
    const raw = localStorage.getItem(PRIVACY_KEY);
    return raw ? JSON.parse(raw) : { showHistory: true, showActivity: true };
  } catch { return { showHistory: true, showActivity: true }; }
}

function savePrefs(p: PrivacyPrefs) {
  localStorage.setItem(PRIVACY_KEY, JSON.stringify(p));
}

export { getPrefs, type PrivacyPrefs };

export default function PrivacySettings() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(getPrefs);

  const toggle = (key: keyof PrivacyPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm text-[#F1F5F9]">浏览记录</p>
          <p className="text-xs text-[#64748B]">在账户页面显示浏览历史</p>
        </div>
        <button
          onClick={() => toggle("showHistory")}
          className={`w-10 h-5 rounded-full transition-colors relative ${prefs.showHistory ? "bg-[#06B6D4]" : "bg-[#334155]"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${prefs.showHistory ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm text-[#F1F5F9]">公开活跃状态</p>
          <p className="text-xs text-[#64748B]">在论坛中显示在线状态</p>
        </div>
        <button
          onClick={() => toggle("showActivity")}
          className={`w-10 h-5 rounded-full transition-colors relative ${prefs.showActivity ? "bg-[#06B6D4]" : "bg-[#334155]"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${prefs.showActivity ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      <p className="text-[10px] text-[#475569] mt-2">隐私偏好保存在本地浏览器中</p>
    </div>
  );
}

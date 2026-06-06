import { Monitor, Cpu } from "lucide-react";

interface RequirementsTabProps {
  requirements: any;
}

export default function RequirementsTab({ requirements }: RequirementsTabProps) {
  if (!requirements) {
    return <p className="text-[#64748B] text-center py-12">暂未公布配置要求</p>;
  }

  const minSpecs = [
    ["OS", requirements.os_min], ["CPU", requirements.cpu_min], ["GPU", requirements.gpu_min],
    ["内存", requirements.ram_min], ["存储", requirements.storage_min],
    requirements.directx ? ["DirectX", requirements.directx] : null,
  ].filter((x): x is [string, string] => x !== null);

  const recSpecs = [
    ["OS", requirements.os_rec], ["CPU", requirements.cpu_rec], ["GPU", requirements.gpu_rec],
    ["内存", requirements.ram_rec], ["存储", requirements.storage_rec],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-5">
        <h4 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-[#F59E0B]" />最低配置
        </h4>
        <div className="space-y-2 text-sm">
          {minSpecs.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[#64748B]">{k}</span><span className="text-[#F1F5F9]">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-5">
        <h4 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#06B6D4]" />推荐配置
        </h4>
        <div className="space-y-2 text-sm">
          {recSpecs.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[#64748B]">{k}</span><span className="text-[#F1F5F9]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

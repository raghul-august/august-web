import { ShieldCheck, Stethoscope } from "lucide-react";
import { memo } from "react";

const TrustBadges = memo(function TrustBadges() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3">
            {[
                { label: "HIPAA Secure", icon: <ShieldCheck className="w-4 h-4" /> },
                { label: "Built By Doctors", icon: <Stethoscope className="w-4 h-4" /> },
            ].map((item, i) => (
                <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 text-[10px] md:text-[16px] font-normal tracking-[0.12em] uppercase"
                    style={{ color: "#B8B5B0" }}
                >
                    {item.icon}
                    {item.label}
                    {i < 1 && <span className="ml-2" style={{ opacity: 0.5 }}>|</span>}
                </span>
            ))}
        </div>
    );
});

export default TrustBadges;
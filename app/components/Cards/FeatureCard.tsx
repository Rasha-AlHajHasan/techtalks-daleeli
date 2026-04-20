type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left pt-6 md:pt-0">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 mb-3">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
};

export default FeatureCard;

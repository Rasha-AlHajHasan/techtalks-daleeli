type PrincipleCardProps = {
  icon: React.ElementType;
  title: string;
  desc: string;
};

const PrincipleCard = ({ icon: Icon, title, desc }: PrincipleCardProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-700">
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
};

export default PrincipleCard;

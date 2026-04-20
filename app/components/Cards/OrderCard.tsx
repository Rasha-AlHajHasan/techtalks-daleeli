type OrderCardProps = {
  icon: React.ElementType;
  name: string;
};

const OrderCard = ({ icon: Icon, name }: OrderCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <p className="font-semibold text-slate-900 text-sm">{name}</p>
    </div>
  );
};

export default OrderCard;

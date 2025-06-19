import { Service } from '@/lib/services';

interface ServiceCardProps {
  service: Service;
  onSelect: (serviceId: string) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
         onClick={() => onSelect(service.id)}>
      <div className="text-4xl mb-4">{service.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Duration:</span>
          <span className="font-medium">{service.estimatedDuration}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Price Range:</span>
          <span className="font-medium">{service.priceRange}</span>
        </div>
      </div>
      <button className="mt-4 w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
        Book Now
      </button>
    </div>
  );
}
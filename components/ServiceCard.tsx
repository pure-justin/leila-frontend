export default function ServiceCard({ service }: any) {
  return (
    <div className="p-4 border rounded">
      <h3>{service.name}</h3>
      <p>{service.description}</p>
    </div>
  );
}
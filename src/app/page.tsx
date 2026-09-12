import EventPulse from "@/components/EventPulse";
import { HISTORICO, resumenPorFranja } from "@/lib/engine";

export default function Home() {
  // El historico se lee en el servidor y viaja como props: el cliente no necesita
  // volver a pedirlo por API.
  return (
    <main className="flex-1">
      <EventPulse historico={HISTORICO} tasasPorFranja={resumenPorFranja()} />
    </main>
  );
}

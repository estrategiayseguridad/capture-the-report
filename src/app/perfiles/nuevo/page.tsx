import Link from "next/link";

import { FormularioPerfil } from "@/components/formulario-perfil";
import { Aviso } from "@/components/ui";

/**
 * Alta de colaborador (menú 1 del pitch) — el paso 1 del escenario: RRHH
 * registra a quien entra. Al guardar se pasa a calificar sus habilidades.
 */
export const metadata = {
  title: "Nuevo colaborador · ProdigiES",
};

export default function NuevoColaborador() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link href="/perfiles" className="text-sm text-acento hover:text-acento-claro">
        ← Volver a perfiles
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-acento">
        Menú · Perfiles · Alta
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Nuevo colaborador
      </h1>
      <p className="mt-2 max-w-2xl text-tinta-2">
        Lo que RRHH registra en la incorporación. Primero los datos del perfil;
        después se califican sus habilidades y se cargan sus certificaciones.
      </p>

      <div className="mt-6 max-w-2xl">
        <Aviso tono="aviso">
          Usen nombres ficticios. El prototipo escribe en{" "}
          <code>data/colaboradores.json</code>, que está en el repo — nada de
          datos de personas reales.
        </Aviso>
      </div>

      <FormularioPerfil etiquetaBoton="Crear perfil y calificar habilidades →" />
    </main>
  );
}

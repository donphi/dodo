import dynamic from "next/dynamic";
const ForceGraph2DComponent = dynamic(() => import("../components/ForceGraph2D"), { ssr: false });

export default function Graph2DPage(): JSX.Element {
  return (
    <main className="w-full h-screen overflow-hidden">
      <ForceGraph2DComponent />
    </main>
  );
}
import dynamic from "next/dynamic";
const ForceGraph3DComponent = dynamic(() => import("../components/ForceGraph3D"), { ssr: false });

export default function Graph3DPage(): JSX.Element {
  return (
    <main className="w-full h-screen overflow-hidden dark:bg-black">
      <ForceGraph3DComponent />
    </main>
  );
}
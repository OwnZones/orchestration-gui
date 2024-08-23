import { PageProps } from '../../../.next/types/app/html_input/page';

export default function HtmlInput({ searchParams: { input } }: PageProps) {
  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-white flex flex-col gap-12 justify-center items-center">
      <p className="text-9xl font-extrabold">HTML INPUT</p>
      <p className="text-8xl font-bold">{input}</p>
    </div>
  );
}

import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#F9DC8C]">
      <div className="relative w-full max-w-[90%] md:max-w-[1200px]">
        <Image
          src="/images/DreamHall.jpg"
          alt="Dream Hall"
          width={1800}
          height={500}
          className="rounded-lg shadow-lg w-full h-auto"
          priority // Optional: Prioritize loading for above-the-fold images
        />
      </div>
    </div>
  );
}
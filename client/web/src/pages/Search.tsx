import Search from '../components/search';

export default function SearchPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-center py-6 bg-neutral-950 sticky top-0 z-10">
        <Search />
      </div>
      <div className="text-white mt-10">Search results will go here.</div>
    </div>
  );
} 
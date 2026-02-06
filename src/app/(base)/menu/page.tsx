import ItemModule from '~/module/menu/components/item-module';

export default function Page() {
  return (
    <div className="flex w-full h-screen justify-center px-4 py-6">
      <div className="w-full hfi max-w-5xl">
        <ItemModule />
      </div>
    </div>
  );
}

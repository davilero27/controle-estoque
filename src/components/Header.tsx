export function Header() {
    return (
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold">
          Dashboard
        </h2>
  
        <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Novo Produto
        </button>
      </header>
    );
  }
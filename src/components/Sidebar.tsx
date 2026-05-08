export function Sidebar() {
    return (
      <aside className="w-64 bg-zinc-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-10">
          Estoque
        </h1>
  
        <nav className="flex flex-col gap-4">
          <button className="text-left hover:text-blue-400 transition">
            Dashboard
          </button>
  
          <button className="text-left hover:text-blue-400 transition">
            Produtos
          </button>
  
          <button className="text-left hover:text-blue-400 transition">
            Vendas
          </button>
        </nav>
      </aside>
    );
  }
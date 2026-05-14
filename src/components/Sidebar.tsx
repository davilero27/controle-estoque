export function Sidebar() {
    return (
      <aside className="w-full md:w-64 bg-zinc-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-10">
          Estoque
        </h1>
  
        <nav className="flex md:flex-col gap-4 overflow-x-auto">
          <a
            href="#top"
            className="text-left hover:text-blue-400 transition"
          >
            Dashboard
          </a>
  
          <a
            href="#products"
            className="text-left hover:text-blue-400 transition"
          >
            Produtos
          </a>
  
          <a
            href="#sales"
            className="text-left hover:text-blue-400 transition"
          >
            Vendas
          </a>
        </nav>
      </aside>
    );
  }
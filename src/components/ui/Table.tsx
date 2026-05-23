interface TableProps {
  children: React.ReactNode;

  className?: string;
}

export function Table({
  children,
  className = "",
}: TableProps) {

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800">

      <table
        className={`w-full min-w-[760px] ${className}`}
      >

        {children}

      </table>

    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({
  children,
}: TableHeaderProps) {

  return (
    <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-sm text-zinc-400">

      {children}

    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({
  children,
}: TableBodyProps) {

  return (
    <tbody>

      {children}

    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;

  className?: string;
}

export function TableRow({
  children,
  className = "",
}: TableRowProps) {

  return (
    <tr
      className={`border-b border-zinc-800 transition hover:bg-zinc-900/50 ${className}`}
    >

      {children}

    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;

  className?: string;
}

export function TableHead({
  children,
  className = "",
}: TableHeadProps) {

  return (
    <th
      className={`px-4 py-4 text-left font-medium ${className}`}
    >

      {children}

    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;

  className?: string;
}

export function TableCell({
  children,
  className = "",
}: TableCellProps) {

  return (
    <td
      className={`px-4 py-4 text-sm ${className}`}
    >

      {children}

    </td>
  );
}
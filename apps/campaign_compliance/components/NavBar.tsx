import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/imports/fundraising", label: "Import" },
  { href: "/contributions", label: "Contributions" },
  { href: "/expenses", label: "Expenses" },
  { href: "/travel", label: "Travel" },
  { href: "/filing", label: "Filing" },
  { href: "/candidate", label: "Candidate" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
        <Link href="/" className="font-semibold tracking-tight">
          Compliance
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-md px-2 py-1 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

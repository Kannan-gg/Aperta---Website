import { DeviceConnectionDrawer, DeviceStatusPill } from './device-connection'

const links = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#mechanism', label: 'Mechanism' },
  { href: '#data', label: 'Data' },
  { href: '#impact', label: 'Impact' },
]

export function SiteNav() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white/75 backdrop-blur-md">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-10"
        >
          <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold tracking-[0.2em] text-navy">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-cyan shadow-[0_0_12px_#72D3F0]" />
            APERTA
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm font-medium text-slate transition-colors hover:text-royal">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <DeviceStatusPill />
            <a
              href="#contact"
              className="hidden rounded-[4px] bg-cyan px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-royal hover:text-white sm:inline-flex"
            >
              Contact
            </a>
          </div>
        </nav>
      </header>
      <DeviceConnectionDrawer />
    </>
  )
}

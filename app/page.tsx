import { SiteNav } from '@/components/aperta/site-nav'
import { Hero } from '@/components/aperta/hero'
import { Problem } from '@/components/aperta/problem'
import { Pillars } from '@/components/aperta/pillars'
import { Mechanism } from '@/components/aperta/mechanism'
import { Dashboard } from '@/components/aperta/dashboard'
import { Impact } from '@/components/aperta/impact'
import { Closing } from '@/components/aperta/closing'

export default function Page() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <Pillars />
        <Mechanism />
        <Dashboard />
        <Impact />
        <Closing />
      </main>
    </>
  )
}

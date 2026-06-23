import { HeaderNav } from "./components/header-nav";
import { Hero } from "./components/hero";
import { Thesis } from "./components/thesis";
import { Problem } from "./components/problem";
import { BiasDemo } from "./components/bias-demo";
import { Contributions } from "./components/contributions";
import { Status } from "./components/status";
import { GetInvolved } from "./components/get-involved";
import { Footer } from "./components/footer";
import { Reveal } from "./components/ui/reveal";

export default function Home() {
  return (
    <>
      <HeaderNav />
      <main>
        {/* Hero is above the fold — shown immediately, no reveal. */}
        <Hero />
        <Reveal>
          <Thesis />
        </Reveal>
        <Reveal>
          <Problem />
        </Reveal>
        <Reveal>
          <BiasDemo />
        </Reveal>
        <Reveal>
          <Contributions />
        </Reveal>
        <Reveal>
          <Status />
        </Reveal>
        <Reveal>
          <GetInvolved />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}

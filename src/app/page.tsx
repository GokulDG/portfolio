import BuildLog from "@/components/BuildLog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Motion from "@/components/Motion";
import Nav from "@/components/Nav";
import Rail from "@/components/Rail";
import Stack from "@/components/Stack";
import Story from "@/components/Story";
import SystemsLab from "@/components/SystemsLab";
import Toolkit from "@/components/Toolkit";
import Work from "@/components/Work";

export default function Page() {
  return (
    <>
      <a className="skip" href="#story">
        Skip to content
      </a>
      <Stack />
      <Nav />
      <Rail />
      <main>
        <Hero />
        <Story />
        <Work />
        <SystemsLab />
        <Toolkit />
        <BuildLog />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <Motion />
    </>
  );
}

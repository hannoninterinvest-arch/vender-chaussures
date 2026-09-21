import { Categories } from "@/components/Categories";
import { TrustBar } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Lookbook } from "@/components/Lookbook";
import { NewDrops } from "@/components/NewDrops";
import { Pillars } from "@/components/Pillars";
import { Reviews } from "@/components/Reviews";
import { WholesaleBanner } from "@/components/WholesaleBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Lookbook />
      <TrustBar />
      <NewDrops />
      <Categories />
      <Pillars />
      <Reviews />
      <WholesaleBanner />
    </>
  );
}

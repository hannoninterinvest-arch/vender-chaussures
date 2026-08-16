import { Categories } from "@/components/Categories";
import { TrustBar } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { NewDrops } from "@/components/NewDrops";
import { Newsletter } from "@/components/Newsletter";
import { Pillars } from "@/components/Pillars";
import { Reviews } from "@/components/Reviews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Pillars />
      <NewDrops />
      <Categories />
      <Reviews />
      <Newsletter />
    </>
  );
}

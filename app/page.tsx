import { Categories } from "@/components/Categories";
import { Hero } from "@/components/Hero";
import { NewDrops } from "@/components/NewDrops";
import { Newsletter } from "@/components/Newsletter";
import { Pillars } from "@/components/Pillars";
import { Reviews } from "@/components/Reviews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pillars />
      <NewDrops />
      <Categories />
      <Reviews />
      <Newsletter />
    </>
  );
}

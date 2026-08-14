import { Categories } from "@/components/Categories";
import { Hero } from "@/components/Hero";
import { NewDrops } from "@/components/NewDrops";
import { Newsletter } from "@/components/Newsletter";
import { Reviews } from "@/components/Reviews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <NewDrops />
      <Categories />
      <Reviews />
      <Newsletter />
    </>
  );
}

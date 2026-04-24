import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import Trending from "@/components/home/Treading";
import TodayEvents from "@/components/home/TodayEvents";
import Upcoming from "@/components/home/Upcoming";
import OnlineEvents from "@/components/home/OnlineEvents";

export default function HomePage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <Navbar />
      <Hero />
      <Categories />
      <Trending/>
      <TodayEvents />
      <Upcoming />
      <OnlineEvents />
      <Footer />
    </main>
  );
}
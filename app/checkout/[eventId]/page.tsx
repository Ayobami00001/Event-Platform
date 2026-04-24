import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CheckoutForm from "@/components/forms/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <CheckoutForm />
      <Footer />
    </main>
  );
}
import Header from "@/components/Header";
import GatewayHero from "@/components/gateway/GatewayHero";
import AgentDemo from "@/components/gateway/AgentDemo";
import ServiceCatalog from "@/components/gateway/ServiceCatalog";
import Quickstart from "@/components/gateway/Quickstart";
import PaymentFlow from "@/components/gateway/PaymentFlow";
import GatewayFooter from "@/components/gateway/GatewayFooter";

export const metadata = {
  title: "CAYPO Gateway — Pay for any API with USDCx",
  description:
    "17 API services, 46 endpoints. No API keys, no accounts — pay per request with USDCx on Canton Network.",
};

export default function GatewayPage() {
  return (
    <>
      <Header />
      <GatewayHero />
      <section id="demo" className="py-20 px-6 max-w-6xl mx-auto">
        <AgentDemo />
      </section>
      <section id="services" className="py-20 px-6 max-w-6xl mx-auto">
        <ServiceCatalog />
      </section>
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Quickstart />
      </section>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <PaymentFlow />
      </section>
      <GatewayFooter />
    </>
  );
}

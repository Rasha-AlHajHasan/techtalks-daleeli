import Header from "@/app/components/Navigation/Header";
import Footer from "@/app/components/Navigation/Footer";
import NewsNotificationModal from "@/app/components/News/NewsNotificationModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <NewsNotificationModal />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

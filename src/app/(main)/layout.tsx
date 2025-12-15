import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Large/Navbar/Navbar";
import Footer from "../components/Large/Footer/Footer";
import RoleRedirect from "../(auth)/RoleRedirect";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <RoleRedirect />
      <RoleRedirect />
      {children}
      <Footer />
    </>
  );
}
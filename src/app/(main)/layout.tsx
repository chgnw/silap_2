import Navbar from "../components/Large/Navbar/Navbar";
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
      {children}
    </>
  );
}
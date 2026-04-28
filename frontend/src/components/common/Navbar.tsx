import Button from "../ui/Button"
import Container from "../ui/Container"

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <Container>
        <div className="flex items-center justify-between py-4">

          {/* Brand */}
          <div className="font-bold text-lg text-green-700">
            Kusuma Lestari Agro
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8 text-sm text-gray-600">
            <a href="#" className="hover:text-green-600">
              Produk Organik
            </a>

            <a href="#" className="hover:text-green-600">
              Tentang Kami
            </a>

            <a href="#" className="hover:text-green-600">
              Distributor
            </a>
          </nav>

          {/* Internal System Login */}
          <Button variant="secondary">
            Login
          </Button>

        </div>
      </Container>
    </header>
  )
}
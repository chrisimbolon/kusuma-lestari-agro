import Button from "../components/ui/Button"
import Container from "../components/ui/Container"

export default function Hero() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Pupuk
              <span className="block text-green-600">
                Organik Berkualitas
              </span>
              Untuk Hasil Panen Lebih Maksimal
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              <strong>Kusuma Lestari Agro</strong> menyediakan pupuk
              <strong className="text-green-700"> organik berkualitas</strong>
              yang telah teruji di lapangan dan digunakan oleh berbagai
              petani serta distributor.
            </p>

            <p className="mt-4 font-semibold text-green-700">
              Berani diuji. Berani diteliti.
            </p>

            <div className="mt-8 flex gap-4">
              <Button>
                Pelajari Produk
              </Button>

              <Button variant="secondary">
                Hubungi Kami
              </Button>
            </div>

          </div>

          {/* RIGHT VISUAL */}
          <div className="bg-white shadow-xl rounded-xl h-80 flex items-center justify-center text-gray-400">
            Foto Produk Pupuk Organik / Lahan Pertanian
          </div>

        </div>

      </Container>
    </section>
  )
}
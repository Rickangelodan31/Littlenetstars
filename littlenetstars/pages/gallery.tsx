import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const images = [
  { src: "/gallery/gallery1.jpg", caption: "Jamaica Sunshine Girls in action" },
  { src: "/gallery/gallery2.jpg", caption: "Netball match day" },
  { src: "/gallery/gallery3.jpg", caption: "Training session" },
  { src: "/gallery/gallery4.jpg", caption: "EMMNA Nationals 2021" },
  { src: "/gallery/gallery5.jpg", caption: "Netball court" },
  { src: "/gallery/gallery6.jpg", caption: "Netball community programme" },
];

export default function Gallery() {
  return (
    <>
      <Head>
        <title>Gallery – LittleNetStars</title>
        <meta name="description" content="Photos from LittleNetStars sessions." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white dark:bg-slate-900 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Gallery</h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Moments from the court</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow group"
              >
                <Image
                  src={img.src}
                  alt={img.caption}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-105 transition-transform duration-500"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm font-medium">{img.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

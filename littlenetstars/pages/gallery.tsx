import Head from "next/head";
import { motion } from "framer-motion";
import type { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/mongodb";
import GalleryImage from "@/lib/models/GalleryImage";
import Setting from "@/lib/models/Setting";

interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption: string;
  order: number;
}

interface Props {
  images: GalleryItem[];
  title: string;
  subtitle: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    await dbConnect();
    const [imgs, titleSetting, subtitleSetting] = await Promise.all([
      GalleryImage.find({}).sort({ order: 1, createdAt: -1 }).lean(),
      Setting.findOne({ key: "gallery_title" }),
      Setting.findOne({ key: "gallery_subtitle" }),
    ]);
    return {
      props: {
        images: JSON.parse(JSON.stringify(imgs)),
        title: titleSetting?.value || "Gallery",
        subtitle: subtitleSetting?.value || "Moments from the court",
      },
    };
  } catch {
    return { props: { images: [], title: "Gallery", subtitle: "Moments from the court" } };
  }
};

export default function Gallery({ images, title, subtitle }: Props) {
  return (
    <>
      <Head>
        <title>{title} – LittleNetStars</title>
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
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">{subtitle}</p>
          </motion.div>

          {images.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <div className="text-5xl mb-4">📸</div>
              <p>Gallery coming soon — check back after our first sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <motion.div
                  key={img._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {img.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

import { PublicHeader } from '@/components/public-header';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <PublicHeader />
      <div className="container mx-auto max-w-4xl flex-1 px-4 py-16">
        <h1 className="text-5xl font-bold font-headline mb-6 text-center">About WineSpace</h1>
        <div className="prose lg:prose-xl prose-p:my-8 mx-auto text-foreground/80 text-justify">
          <p>
            WineSpace was born from a simple yet powerful idea: to revolutionize the procurement process for the South African wine industry. We saw a landscape where talented producers spent too much time navigating complex supply chains and where excellent suppliers struggled to reach their target market efficiently. We knew there had to be a better way.
          </p>
          <p>&nbsp;</p>
          <p>
            Our mission is to bridge this gap. We've created a centralized, user-friendly platform that empowers winemakers to easily find, compare, and procure the highest quality components—from the finest glass bottles and corks to bespoke labels and packaging. For suppliers, we offer an unparalleled opportunity to showcase their products directly to a dedicated and passionate audience of industry professionals.
          </p>
          <p>&nbsp;</p>
          <p>
            At its core, WineSpace is more than just a marketplace; it's a community. It's a digital ecosystem designed to foster connections, streamline operations, and ultimately, elevate the art of winemaking. We are driven by a passion for technology and a deep respect for the tradition and craftsmanship of the wine industry. By handling the complexities of procurement, we free producers to do what they do best: create exceptional wines.
          </p>
        </div>
      </div>
      <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WineSpace. All rights reserved.
      </footer>
    </main>
  );
}

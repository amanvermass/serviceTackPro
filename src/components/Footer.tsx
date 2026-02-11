import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border w-[100vw]">
      <div className=" px-[2vw] py-[2vh]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-text-secondary">© 2025 Domain Manager Pro. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[clamp(0.875rem,1.5vw,1rem)] text-text-secondary hover:text-primary transition-smooth">Privacy Policy</Link>
            <Link href="#" className="text-[clamp(0.875rem,1.5vw,1rem)] text-text-secondary hover:text-primary transition-smooth">Terms of Service</Link>
            <Link href="#" className="text-[clamp(0.875rem,1.5vw,1rem)] text-text-secondary hover:text-primary transition-smooth">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

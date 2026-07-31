import Link from "next/link";
import { SquareParking, Home, Search } from "lucide-react";
import Container from "@/components/shared/Container";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background">
      <Container className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-light text-primary">
          <SquareParking size={36} />
        </div>
        <h1 className="mt-8 text-6xl font-extrabold tracking-tight text-ink">
          404
        </h1>
        <h2 className="mt-3 text-xl font-bold text-ink">
          No parking spot found here
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          The page you're looking for might have moved, or the space was
          never mapped in the first place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home size={16} />
            Back to Home
          </Link>
          <Link href="/search" className="btn-secondary">
            <Search size={16} />
            Search Parking
          </Link>
        </div>
      </Container>
    </div>
  );
}

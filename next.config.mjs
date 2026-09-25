/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Community-uploaded spot photos (Supabase Storage public bucket)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async redirects() {
    return [
      { source: "/saved", destination: "/account?tab=saved", permanent: false },
      { source: "/contributions", destination: "/account?tab=contributions", permanent: false },
    ];
  },
};

export default nextConfig;

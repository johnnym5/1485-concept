/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.1485concepts.com' }],
        destination: 'https://1485concepts.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

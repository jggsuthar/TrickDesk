/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mount WebRTC PeerJS connection clashes in local dev
};

export default nextConfig;

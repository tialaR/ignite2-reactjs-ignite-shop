/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  //Para conseguir usar o next/image na aplicação
  images: {
    allowFutureImage: true,

    //Estabelecendo o domínio de onde as imagens da aplicação vêm
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.stripe.com",
      },
    ],
  },
}

module.exports = nextConfig

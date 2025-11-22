/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "aws-s3-inventorymanagement-basicsofis.s3.eu-north-1.amazonaws.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "img.clerk.com",
                port: "",
                pathname: "/**"
            }
        ]
    }

};

export default nextConfig;

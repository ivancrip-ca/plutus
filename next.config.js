/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Para imágenes de perfil de Google
      'graph.facebook.com',        // Para imágenes de perfil de Facebook
      'platform-lookaside.fbsbx.com', // Otra fuente de imágenes de Facebook
      'firebasestorage.googleapis.com' // Para imágenes almacenadas en Firebase Storage
    ],
  },
  // ...otras configuraciones que puedas tener
}

module.exports = nextConfig

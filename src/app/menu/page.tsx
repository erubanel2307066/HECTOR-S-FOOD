import { Metadata } from 'next'
import ClientMenuPage from './client-page'

export const metadata: Metadata = {
  title: 'Menú | Hector\'s',
  description: 'Explora nuestro menú y ordena online',
}

export default function MenuPage() {
  return <ClientMenuPage />
}

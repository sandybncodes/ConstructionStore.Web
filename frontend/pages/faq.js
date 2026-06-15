import Header from '../components/Header'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { useLanguage } from '../lib/i18nContext'

export default function FaqPage() {
  const { t } = useLanguage()

  const faqs = [
    { q: 'Cum comand produse?', a: 'Adăugați produsele în coș și urmați pașii pentru livrare și plată.' },
    { q: 'Livrați în toată Moldova?', a: 'Da — oferim livrare în Chișinău, Ialoveni și restul Moldovei.' },
    { q: 'Care este politica de returnare?', a: 'Returnările sunt acceptate în 30 de zile de la livrare.' },
  ]

  const faqStructured = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <Seo title={`FAQ | MirDav Company`} description={`Întrebări frecvente despre comenzi, livrare și produse.`} structuredData={faqStructured} canonical={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/faq`} />
      <Header />
      <main className="container-main py-5">
        <h1>Întrebări frecvente</h1>
        <section>
          {faqs.map((f, i) => (
            <article key={i} className="faq-item">
              <h2>{f.q}</h2>
              <p>{f.a}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}

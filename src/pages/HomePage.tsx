import Kicker from '../components/atoms/Kicker'
import { getSessionUser } from '../database/database'

const services = [
  {
    title: 'Preprensa',
    text: 'Diseño, pruebas de color y preparación de archivos listos para imprimir.',
    image: '/assets/Preprensa-Nomos-Impreseros-2.jpeg',
  },
  {
    title: 'Impresión digital',
    text: 'Tirajes cortos y personalizados con calidad editorial.',
    image: '/assets/IMPRESION_DIGITAL.jpg',
  },
  {
    title: 'Encuadernación y acabados',
    text: 'Acabados que dan carácter a cada proyecto.',
    image: '/assets/Encuadernacion-y-acabados-Nomos-Impresores-1-1024x576-1.jpg',
  },
  {
    title: 'Despachos y logística',
    text: 'Entregas puntuales en todo el país.',
    image: '/assets/Despachos-y-Logistica-Nomos-Impresores-768x432-1.jpg',
  },
]

function HomePage() {
    const user = getSessionUser()

  return (
    <main className="home-main">
      <section className="home-hero" aria-label="Bienvenida">
        <img
          className="home-hero__image"
          src="/assets/Sobre-Nomos-Impresores-1.jpg"
          alt=""
          aria-hidden="true"
        />
        <div className="home-hero__content">
          <Kicker light>Portal Nomos</Kicker>
          <h1>Hola{user ? `, ${user.username}` : ''}. Bienvenido a tu espacio de trabajo.</h1>
          <p>Ideas que toman forma. Historias que perduran.</p>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-services">
        <Kicker>Nuestros servicios</Kicker>
        <h2 id="home-services">Todo lo que tu proyecto necesita</h2>
        <div className="home-grid">
          {services.map((service) => (
            <article className="home-card" key={service.title}>
              <img src={service.image} alt="" aria-hidden="true" />
              <div className="home-card__body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default HomePage

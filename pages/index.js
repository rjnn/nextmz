import Head from 'next/head'
import Image from 'next/image'
import Ban from '../components/Ban'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Anti-spam login</title>
        <meta name="description" content="Anti-spam login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Ban />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://materialize.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span>
            <Image src="/materialize.png" alt="Materialize Logo" width={32} height={32} />
          </span>
        </a>
      </footer>
    </div>
  )
}
